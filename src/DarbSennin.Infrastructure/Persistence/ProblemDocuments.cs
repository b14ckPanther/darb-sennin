using MongoDB.Bson.Serialization.Attributes;

namespace DarbSennin.Infrastructure.Persistence;

/// <summary>Collection names (docs/ARCHITECTURE.md section 5).</summary>
public static class Collections
{
    public const string Problems = "problems";
    public const string ProblemTests = "problem_tests";
    public const string ProblemGenerators = "problem_generators";
}

/// <summary>A problem as stored. It has no field that could hold a hidden test.</summary>
[BsonIgnoreExtraElements]
public sealed record ProblemDocument
{
    [BsonId]
    public required string Id { get; init; }

    public required string Set { get; init; }
    public required string ContentVersion { get; init; }
    public required string Title { get; init; }
    public required string StatementMd { get; init; }
    public required string Family { get; init; }
    public required List<string> Tags { get; init; }
    public required int Difficulty { get; init; }
    public required bool IsBoss { get; init; }
    public required string Comparator { get; init; }
    public double? FloatTolerance { get; init; }
    public required int TimeMs { get; init; }
    public required int MemoryMb { get; init; }
    public required string TargetLabel { get; init; }
    public required double TargetExponent { get; init; }
    public required List<string> Constraints { get; init; }
    public required Dictionary<string, string> Starters { get; init; }
    public required List<SampleDocument> Samples { get; init; }
    public required int HiddenCaseCount { get; init; }
    public required bool Demo { get; init; }
}

public sealed record SampleDocument
{
    public required string Id { get; init; }
    public required string Input { get; init; }
    public required string Expected { get; init; }
    public string? Note { get; init; }
}

[BsonIgnoreExtraElements]
public sealed record GeneratorDocument
{
    [BsonId]
    public required string Id { get; init; }

    public required string ProblemId { get; init; }
    public required string ContentVersion { get; init; }
    public required string Entry { get; init; }
    public required string Source { get; init; }
    public required int Seed { get; init; }
    public required List<int> Sizes { get; init; }
    public required string TargetComplexity { get; init; }
}
