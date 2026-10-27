using System.Text.Json;
using System.Text.Json.Nodes;
using DarbSennin.Domain.Content;
using DarbSennin.Domain.Judging;
using DarbSennin.Infrastructure.Configuration;

namespace DarbSennin.Infrastructure.Content;

/// <summary>The result of reading one content set: what loaded, and what was wrong.</summary>
public sealed record ContentSet(string SetId, string ContentVersion, bool Demo, IReadOnlyList<ProblemPackage> Problems, IReadOnlyList<string> Errors);

/// <summary>
/// Reads content/&lt;set&gt;/ into problem packages, checking every file against its schema and
/// the rules a schema cannot state (folder matches id, case ids unique, statement present).
/// </summary>
public static class ContentLoader
{
    public static ContentSet Load(string setDirectory, SchemaCatalog schemas)
    {
        var errors = new List<string>();
        var setFile = Path.Combine(setDirectory, "set.yaml");
        var set = ReadChecked(setFile, "content-set", schemas, errors, setDirectory);
        var setId = set?["set"]?.GetValue<string>() ?? string.Empty;
        var version = set?["contentVersion"]?.GetValue<string>() ?? string.Empty;
        var demo = set?["demo"]?.GetValue<bool>() ?? false;

        var problems = new List<ProblemPackage>();
        foreach (var dir in Directory.GetDirectories(setDirectory).Order(StringComparer.Ordinal))
        {
            var package = LoadProblem(dir, version, demo, schemas, errors, setDirectory);
            if (package is not null)
            {
                problems.Add(package);
            }
        }

        foreach (var id in problems.GroupBy(p => p.Problem.Id).Where(g => g.Count() > 1).Select(g => g.Key))
        {
            errors.Add($"problem id '{id}' is used by more than one folder");
        }

        return new ContentSet(setId, version, demo, problems, errors);
    }

    private static ProblemPackage? LoadProblem(string dir, string version, bool demo, SchemaCatalog schemas, List<string> errors, string root)
    {
        var slug = Path.GetFileName(dir);
        var before = errors.Count;
        var problem = ReadChecked(Path.Combine(dir, "problem.yaml"), "problem", schemas, errors, root);
        var samples = ReadChecked(Path.Combine(dir, "tests", "sample.yaml"), "tests", schemas, errors, root);
        var hidden = ReadChecked(Path.Combine(dir, "tests", "hidden.yaml"), "tests", schemas, errors, root);
        var generator = ReadChecked(Path.Combine(dir, "generators", "generator.yaml"), "generator", schemas, errors, root);
        var statementPath = Path.Combine(dir, "statement.md");
        if (!File.Exists(statementPath))
        {
            errors.Add($"{Rel(statementPath, root)}: file not found");
        }

        foreach (var reference in new[] { "solution.py", "Solution.cs", "solution.mjs" })
        {
            var path = Path.Combine(dir, "reference", reference);
            if (!File.Exists(path))
            {
                errors.Add($"{Rel(path, root)}: reference solution not found");
            }
        }

        if (errors.Count > before || problem is null || samples is null || hidden is null || generator is null)
        {
            return null;
        }

        var id = problem["id"]!.GetValue<string>();
        if (id != slug)
        {
            errors.Add($"{slug}/problem.yaml: id '{id}' does not match its folder name '{slug}'");
        }

        var sampleCases = Cases(samples);
        var hiddenCases = Cases(hidden);
        foreach (var dup in sampleCases.Concat(hiddenCases).GroupBy(c => c.Id).Where(g => g.Count() > 1).Select(g => g.Key))
        {
            errors.Add($"{slug}/tests: case id '{dup}' is used twice");
        }

        var entry = generator["entry"]!.GetValue<string>();
        var entryPath = Path.Combine(dir, "generators", entry);
        if (!File.Exists(entryPath))
        {
            errors.Add($"{slug}/generators/{entry}: generator not found");
            return null;
        }

        var model = new PublicProblem
        {
            Id = id,
            ContentVersion = version,
            Title = problem["title"]!.GetValue<string>(),
            StatementMd = File.ReadAllText(statementPath),
            Family = problem["family"]!.GetValue<string>(),
            Tags = Strings(problem["tags"]),
            Difficulty = Num<int>(problem["difficulty"]),
            IsBoss = problem["isBoss"]?.GetValue<bool>() ?? false,
            Comparator = problem["comparator"]!.GetValue<string>(),
            FloatTolerance = problem["floatTolerance"] is { } tolerance ? Num<double>(tolerance) : null,
            Limits = problem["limits"].Deserialize<ProblemLimits>(SenninConfigSource.Json)!,
            Target = problem["target"].Deserialize<ComplexityTarget>(SenninConfigSource.Json)!,
            Constraints = Strings(problem["constraints"]),
            Starters = problem["starters"]!.AsObject().ToDictionary(p => p.Key, p => p.Value!.GetValue<string>(), StringComparer.Ordinal),
            Samples = [.. sampleCases.Select(c => new SampleCase { Id = c.Id, Input = c.Input, Expected = c.Expected, Note = c.Note })],
            HiddenCaseCount = hiddenCases.Count,
            Demo = demo,
        };
        var cases = hiddenCases.Select(c => new HiddenCase
        {
            ProblemId = id,
            ContentVersion = version,
            CaseId = c.Id,
            Input = c.Input,
            Expected = c.Expected,
            Tags = c.Tags,
            Weight = c.Weight,
            RevealOnFail = c.RevealOnFail ?? !model.IsBoss,
        }).ToList();
        var gen = new ProblemGenerator
        {
            ProblemId = id,
            ContentVersion = version,
            Entry = entry,
            Source = File.ReadAllText(entryPath),
            Seed = Num<int>(generator["seed"]),
            Sizes = [.. generator["sizes"]!.AsArray().Select(n => Num<int>(n))],
            TargetComplexity = generator["targetComplexity"]!.GetValue<string>(),
        };
        return new ProblemPackage(model, cases, gen);
    }

    private sealed record RawCase(string Id, string Input, string Expected, string? Note, IReadOnlyList<string> Tags, double Weight, bool? RevealOnFail);

    private static List<RawCase> Cases(JsonNode file) =>
    [
        .. file["cases"]!.AsArray().Select(c => new RawCase(
            c!["id"]!.GetValue<string>(),
            c["input"]!.GetValue<string>(),
            c["expected"]!.GetValue<string>(),
            c["note"]?.GetValue<string>(),
            Strings(c["tags"]),
            c["weight"] is { } weight ? Num<double>(weight) : 1,
            c["revealOnFail"]?.GetValue<bool>())),
    ];

    // Numbers arrive as 64-bit integers or doubles; the serializer converts and range-checks them.
    private static T Num<T>(JsonNode? node)
        where T : struct => node.Deserialize<T>(SenninConfigSource.Json);

    private static List<string> Strings(JsonNode? node) =>
        node is JsonArray array ? [.. array.Select(n => n!.GetValue<string>())] : [];

    private static JsonNode? ReadChecked(string path, string schema, SchemaCatalog schemas, List<string> errors, string root)
    {
        if (!File.Exists(path))
        {
            errors.Add($"{Rel(path, root)}: file not found");
            return null;
        }

        try
        {
            var node = DataFile.Read(path);
            var problems = schemas.Validate(schema, node);
            errors.AddRange(problems.Select(p => $"{Rel(path, root)}: {p}"));
            return problems.Count == 0 ? node : null;
        }
        catch (FormatException error)
        {
            errors.Add($"{Rel(path, root)}: {error.Message}");
            return null;
        }
    }

    private static string Rel(string path, string root) => Path.GetRelativePath(root, path).Replace('\\', '/');
}
