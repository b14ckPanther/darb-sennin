using DarbSennin.ContentCli;
using DarbSennin.Domain.Content;

namespace DarbSennin.ContentCli.Tests;

/// <summary>`sennin-content validate` on the real demo set and on copies broken one way each.</summary>
public sealed class ValidateTests : IDisposable
{
    private readonly ContentFixture _fixture = new();

    public void Dispose() => _fixture.Dispose();

    private ValidationReport Validate(string? set = null) =>
        ContentValidator.Validate(set ?? _fixture.Set, ContentFixture.Config, new ValidateOptions());

    [Fact]
    public void DemoSet_IsValid()
    {
        var report = ContentValidator.Validate(ContentFixture.DemoSet, ContentFixture.Config, new ValidateOptions());

        report.Errors.ShouldBeEmpty();
        report.Problems.Count.ShouldBe(6);
    }

    [Fact]
    public void DemoSet_HasSamplesHiddenTestsGeneratorAndThreeReferences()
    {
        foreach (var dir in Directory.GetDirectories(ContentFixture.DemoSet))
        {
            File.Exists(Path.Combine(dir, "tests", "sample.yaml")).ShouldBeTrue(dir);
            File.Exists(Path.Combine(dir, "tests", "hidden.yaml")).ShouldBeTrue(dir);
            File.Exists(Path.Combine(dir, "generators", "generator.yaml")).ShouldBeTrue(dir);
            foreach (var reference in new[] { "solution.py", "Solution.cs", "solution.mjs" })
            {
                File.Exists(Path.Combine(dir, "reference", reference)).ShouldBeTrue($"{dir} {reference}");
            }
        }
    }

    [Fact]
    public void SchemaError_IsReported_WithFileAndField()
    {
        _fixture.Edit("fewest-tiles/problem.yaml", "difficulty: 2", "difficulty: 9");

        Validate().Errors.ShouldContain(e => e.Contains("fewest-tiles/problem.yaml", StringComparison.Ordinal) && e.Contains("difficulty", StringComparison.Ordinal));
    }

    [Fact]
    public void DuplicateCaseIds_AcrossSampleAndHidden_AreReported()
    {
        _fixture.Edit("fewest-tiles/tests/hidden.yaml", "id: case-01", "id: sample-1");

        Validate().Errors.ShouldContain(e => e.Contains("sample-1", StringComparison.Ordinal) && e.Contains("twice", StringComparison.Ordinal));
    }

    [Fact]
    public void UnknownComparator_IsReported()
    {
        // The schema lists comparators too; this checks the validator against the judge's own list.
        Comparators.Known.ShouldContain("trimmed");
        _fixture.Edit("fewest-tiles/problem.yaml", "comparator: trimmed", "comparator: fuzzy");

        Validate().Errors.ShouldContain(e => e.Contains("fewest-tiles/problem.yaml", StringComparison.Ordinal) && e.Contains("/comparator", StringComparison.Ordinal));
    }

    [Fact]
    public void UnknownTag_IsReported()
    {
        _fixture.Edit("fewest-tiles/problem.yaml", "tags: [dynamic-programming, wrong-algorithm]", "tags: [dynamic-programming, telepathy]");

        Validate().Errors.ShouldContain(e => e.Contains("telepathy", StringComparison.Ordinal));
    }

    [Fact]
    public void FolderAndIdMismatch_IsReported()
    {
        _fixture.Edit("fewest-tiles/problem.yaml", "id: fewest-tiles", "id: fewest-bricks");

        Validate().Errors.ShouldContain(e => e.Contains("fewest-bricks", StringComparison.Ordinal));
    }

    [Fact]
    public void MissingStatement_IsReported()
    {
        _fixture.Delete("fewest-tiles/statement.md");

        Validate().Errors.ShouldContain(e => e.Contains("statement.md", StringComparison.Ordinal));
    }

    [Fact]
    public void MissingReference_IsReported()
    {
        _fixture.Delete("fewest-tiles/reference/Solution.cs");

        Validate().Errors.ShouldContain(e => e.Contains("Solution.cs", StringComparison.Ordinal));
    }

    [Fact]
    public void GeneratorThatIsNotDeterministic_IsReported()
    {
        _fixture.Write("fewest-tiles/generators/generate.py",
            "import random\ndef make(n, rng):\n    return str(random.random())\n");

        Validate().Errors.ShouldContain(e => e.Contains("deterministic", StringComparison.Ordinal));
    }

    [Fact]
    public void GeneratorThatEscapesItsFolder_IsReported()
    {
        _fixture.Edit("fewest-tiles/generators/generator.yaml", "entry: generate.py", "entry: ../../../escape.py");

        Validate().Errors.ShouldNotBeEmpty();
    }

    [Fact]
    public void ReferenceRuns_AreStubbed_UntilTheSandboxExists()
    {
        var report = ContentValidator.Validate(ContentFixture.DemoSet, ContentFixture.Config, new ValidateOptions { RunReferences = true });

        report.Notes.ShouldContain(n => n.Contains("Phase 5", StringComparison.Ordinal));
        report.Errors.ShouldBeEmpty();
    }
}
