namespace DarbSennin.Domain.Configuration;

// Typed views of config/*.yaml. Shapes only: every value comes from the files, never from code
// (CLAUDE.md 1.2). The JSON Schemas in config/schemas are the source of truth for each shape.

public sealed record GradingConfig
{
    public required int Version { get; init; }
    public required GradingComponents Components { get; init; }
    public required IReadOnlyDictionary<string, double> SeverityWeights { get; init; }
    public required string TranslatedTier { get; init; }
}

public sealed record GradingComponents
{
    public required TestsComponent Tests { get; init; }
    public required ComplexityComponent Complexity { get; init; }
    public required ReviewComponent Review { get; init; }
}

public sealed record TestsComponent
{
    public required int Max { get; init; }
    public required string Mode { get; init; }
}

public sealed record ComplexityComponent
{
    public required int Max { get; init; }
    public required double Tolerance { get; init; }
    public required bool RequiresAllTestsPass { get; init; }
}

public sealed record ReviewComponent
{
    public required int Max { get; init; }
}

public sealed record RubricConfig
{
    public required int Version { get; init; }
    public required string Voice { get; init; }
    public required IReadOnlyList<string> Severities { get; init; }
    public required IReadOnlyList<string> EvidenceKinds { get; init; }
    public required IReadOnlyList<RubricCriterion> Criteria { get; init; }
    public required IReadOnlyList<string> BannedPhrases { get; init; }
    public required PraiseGate PraiseGate { get; init; }
}

public sealed record RubricCriterion
{
    public required string Id { get; init; }
    public required string Description { get; init; }
    public required IReadOnlyList<string> RequiredEvidence { get; init; }
}

public sealed record PraiseGate
{
    public required bool AllTestsPass { get; init; }
    public required bool ComplexityFull { get; init; }
    public required string MaxSeverity { get; init; }
    public required int MaxPraiseWords { get; init; }
}

public sealed record TagsConfig
{
    /// <summary>Mistake taxonomy: every finding carries one.</summary>
    public required IReadOnlyList<MistakeTag> Tags { get; init; }

    /// <summary>Problem topics such as hashing or graphs.</summary>
    public required IReadOnlyList<MistakeTag> Topics { get; init; }
}

public sealed record MistakeTag
{
    public required string Id { get; init; }
    public required string Description { get; init; }
}

public sealed record RanksConfig
{
    public required IReadOnlyList<RankDefinition> Ranks { get; init; }
}

public sealed record RankDefinition
{
    public required string Id { get; init; }
    public required string Name { get; init; }
    public required int Threshold { get; init; }
    public required string Description { get; init; }
}

public sealed record ProgressionConfig
{
    public required StreakRules Streak { get; init; }
    public required WeaknessRules Weakness { get; init; }
    public required RecommendationRules Recommendations { get; init; }
    public required BossRules Boss { get; init; }
    public required PointRules Points { get; init; }
}

public sealed record StreakRules
{
    public required string DayEndsAt { get; init; }
    public required string TimeZone { get; init; }
    public required int FreezesPerMonth { get; init; }
    public required bool ResetLosesPoints { get; init; }
}

public sealed record WeaknessRules
{
    public required double HalfLifeDays { get; init; }
    public required int WeeksShown { get; init; }
    public required int ScoreMax { get; init; }
    public required double NitWeight { get; init; }
}

public sealed record RecommendationRules
{
    public required int Count { get; init; }
    public required double WeakestShare { get; init; }
    public required int ReviewAfterDays { get; init; }
}

public sealed record BossRules
{
    public required string WeekStartsOn { get; init; }
    public required bool CarryOverUnbeaten { get; init; }
    public required bool RevealInputs { get; init; }
}

public sealed record PointRules
{
    public required int PerPassedCase { get; init; }
    public required int CleanSolveBonus { get; init; }
    public required int BossDefeatBonus { get; init; }
}

public sealed record LimitsConfig
{
    public required SubmissionLimits Submission { get; init; }
    public required RunSampleLimits RunSamples { get; init; }
    public required ReviewerLimits Reviewer { get; init; }
    public required JudgeLimits Judge { get; init; }
    public required ContentLimits Content { get; init; }
}

public sealed record ContentLimits
{
    public required int GeneratorCheckTimeoutMs { get; init; }
}

public sealed record SubmissionLimits
{
    public required int MaxCodeBytes { get; init; }
    public required int PerUserPerHour { get; init; }
    public required int PerProblemPerHour { get; init; }
}

public sealed record RunSampleLimits
{
    public required int PerUserPerMinute { get; init; }
}

public sealed record ReviewerLimits
{
    public required int MaxInputTokensPerReview { get; init; }
    public required int MaxOutputTokensPerReview { get; init; }
    public required int ReviewsPerDay { get; init; }
    public required decimal MonthlySpendCapUsd { get; init; }
    public required double FallbackBelowShare { get; init; }
}

public sealed record JudgeLimits
{
    public required int MaxParallelRuns { get; init; }
    public required int QueueMaxDeliveries { get; init; }
}

public sealed record SandboxProfilesConfig
{
    public required SandboxDefaults Defaults { get; init; }
    public required IReadOnlyList<SandboxProfile> Profiles { get; init; }
}

public sealed record SandboxDefaults
{
    public required string User { get; init; }
    public required string SeccompProfile { get; init; }
    public required TmpfsSizes Tmpfs { get; init; }
    public required int PidsLimit { get; init; }
    public required double Cpus { get; init; }
    public required Ulimits Ulimits { get; init; }
    public required int OutputKb { get; init; }
    public required IReadOnlyList<string> EnvAllowList { get; init; }
}

public sealed record TmpfsSizes
{
    public required int WorkMb { get; init; }
    public required int TmpMb { get; init; }
}

public sealed record Ulimits
{
    public required int Nofile { get; init; }
    public required long FsizeBytes { get; init; }
    public required int Nproc { get; init; }
}

public sealed record SandboxProfile
{
    public required string Id { get; init; }
    public required string Language { get; init; }
    public required string Step { get; init; }
    public required int MemoryMb { get; init; }
    public required int WallTimeMs { get; init; }
    public int? PidsLimit { get; init; }
    public double? Cpus { get; init; }
}

public sealed record SandboxImagesConfig
{
    public required IReadOnlyList<SandboxImage> Images { get; init; }
}

public sealed record SandboxImage
{
    public required string Language { get; init; }
    public required string Image { get; init; }
    public required string Digest { get; init; }
    public IReadOnlyList<string>? Compile { get; init; }
    public required IReadOnlyList<string> Run { get; init; }
}
