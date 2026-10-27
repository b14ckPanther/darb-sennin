namespace DarbSennin.Domain.Content;

// The content model (docs/ARCHITECTURE.md section 6).

public sealed record ProblemLimits
{
    public required int TimeMs { get; init; }
    public required int MemoryMb { get; init; }
}

public sealed record ComplexityTarget
{
    public required string Label { get; init; }
    public required double Exponent { get; init; }
}

public sealed record SampleCase
{
    public required string Id { get; init; }
    public required string Input { get; init; }
    public required string Expected { get; init; }
    public string? Note { get; init; }
}

/// <summary>
/// Everything about a problem that a visitor may see. It holds no hidden test and no type that
/// could carry one (the hidden tests live in DarbSennin.Domain.Judging, which the API never references).
/// </summary>
public sealed record PublicProblem
{
    public required string Id { get; init; }
    public required string ContentVersion { get; init; }
    public required string Title { get; init; }
    public required string StatementMd { get; init; }
    public required string Family { get; init; }
    public required IReadOnlyList<string> Tags { get; init; }
    public required int Difficulty { get; init; }
    public required bool IsBoss { get; init; }
    public required string Comparator { get; init; }
    public double? FloatTolerance { get; init; }
    public required ProblemLimits Limits { get; init; }
    public required ComplexityTarget Target { get; init; }
    public required IReadOnlyList<string> Constraints { get; init; }
    public required IReadOnlyDictionary<string, string> Starters { get; init; }
    public required IReadOnlyList<SampleCase> Samples { get; init; }
    public required int HiddenCaseCount { get; init; }
    public required bool Demo { get; init; }
}

/// <summary>The probe generator: input sizes and a seed for the complexity fit.</summary>
public sealed record ProblemGenerator
{
    public required string ProblemId { get; init; }
    public required string ContentVersion { get; init; }
    public required string Entry { get; init; }
    public required string Source { get; init; }
    public required int Seed { get; init; }
    public required IReadOnlyList<int> Sizes { get; init; }
    public required string TargetComplexity { get; init; }
}

/// <summary>One problem as loaded from content/&lt;set&gt;/&lt;slug&gt;/.</summary>
public sealed record ProblemPackage(PublicProblem Problem, IReadOnlyList<Judging.HiddenCase> HiddenCases, ProblemGenerator Generator);

/// <summary>Comparators the judge implements (Phase 5). Content may only name these.</summary>
public static class Comparators
{
    public static IReadOnlySet<string> Known { get; } = new HashSet<string>(StringComparer.Ordinal)
    {
        "exact", "trimmed", "float", "unordered-lines",
    };
}
