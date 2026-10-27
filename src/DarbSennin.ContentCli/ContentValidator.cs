using DarbSennin.Domain.Configuration;
using DarbSennin.Domain.Content;
using DarbSennin.Infrastructure.Configuration;
using DarbSennin.Infrastructure.Content;

namespace DarbSennin.ContentCli;

public sealed record ValidateOptions
{
    /// <summary>Run each generator twice and compare (on by default; authored repo code only).</summary>
    public bool CheckGenerators { get; init; } = true;

    /// <summary>Reference solutions run against the hidden tests in the sandbox from Phase 5.</summary>
    public bool RunReferences { get; init; }
}

public sealed record ValidationReport(ContentSet Set, IReadOnlyList<string> Errors, IReadOnlyList<string> Notes)
{
    public IReadOnlyList<ProblemPackage> Problems => Set.Problems;

    public bool Ok => Errors.Count == 0;
}

/// <summary>`sennin-content validate`: schemas, ids, case ids, tags, comparators, generators.</summary>
public static class ContentValidator
{
    public static ValidationReport Validate(string setDirectory, string configDirectory, ValidateOptions options)
    {
        var errors = new List<string>();
        var notes = new List<string>();
        var config = new SenninConfigSource(configDirectory);
        var schemas = SchemaCatalog.Load(Path.Combine(configDirectory, "schemas"));
        var (tags, tagErrors) = config.Load<TagsConfig>(ConfigFiles.Tags);
        var (limits, limitErrors) = config.Load<LimitsConfig>(ConfigFiles.Limits);
        errors.AddRange(tagErrors.Select(e => $"config/{ConfigFiles.Tags}: {e}"));
        errors.AddRange(limitErrors.Select(e => $"config/{ConfigFiles.Limits}: {e}"));

        var set = ContentLoader.Load(setDirectory, schemas);
        errors.AddRange(set.Errors);
        var knownTags = (tags?.Tags ?? []).Concat(tags?.Topics ?? []).Select(t => t.Id).ToHashSet(StringComparer.Ordinal);

        foreach (var package in set.Problems)
        {
            var problem = package.Problem;
            if (!Comparators.Known.Contains(problem.Comparator))
            {
                errors.Add($"{problem.Id}: comparator '{problem.Comparator}' is not one the judge knows ({string.Join(", ", Comparators.Known)})");
            }

            if (tags is not null)
            {
                foreach (var tag in problem.Tags.Where(t => !knownTags.Contains(t)))
                {
                    errors.Add($"{problem.Id}: tag '{tag}' is not in config/{ConfigFiles.Tags}");
                }
            }

            if (options.CheckGenerators && limits is not null)
            {
                errors.AddRange(GeneratorCheck.Run(setDirectory, package.Generator, limits.Content.GeneratorCheckTimeoutMs));
            }
        }

        if (!options.CheckGenerators)
        {
            notes.Add("generators: not run (--skip-generators)");
        }

        if (options.RunReferences)
        {
            notes.Add("references: running them against the hidden tests needs the sandbox, which arrives in Phase 5; skipped");
        }

        return new ValidationReport(set, errors, notes);
    }
}
