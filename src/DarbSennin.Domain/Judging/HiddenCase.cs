namespace DarbSennin.Domain.Judging;

// Hidden tests and the only interface that reads them. The API must never reference this
// namespace (architecture test); only the judge and the content importer do.

/// <summary>A hidden test. Read only by the judge; never part of any API response.</summary>
public sealed record HiddenCase
{
    public required string ProblemId { get; init; }
    public required string ContentVersion { get; init; }
    public required string CaseId { get; init; }
    public required string Input { get; init; }
    public required string Expected { get; init; }
    public required IReadOnlyList<string> Tags { get; init; }
    public required double Weight { get; init; }
    public required bool RevealOnFail { get; init; }
}

/// <summary>Reads hidden tests for the judge. Its MongoDB role is read-only (SECURITY.md section 3).</summary>
public interface IHiddenTestReader
{
    Task<IReadOnlyList<HiddenCase>> ForProblemAsync(string problemId, string contentVersion, CancellationToken cancellationToken);
}
