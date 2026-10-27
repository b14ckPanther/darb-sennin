using DarbSennin.Domain.Judging;
using DarbSennin.Infrastructure.Persistence;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

namespace DarbSennin.Infrastructure.Judging;

/// <summary>A hidden test as stored in problem_tests, a collection the public API never reads.</summary>
[BsonIgnoreExtraElements]
public sealed record HiddenCaseDocument
{
    [BsonId]
    public required string Id { get; init; }

    public required string ProblemId { get; init; }
    public required string ContentVersion { get; init; }
    public required string CaseId { get; init; }
    public required int Order { get; init; }
    public required string Input { get; init; }
    public required string Expected { get; init; }
    public required List<string> Tags { get; init; }
    public required double Weight { get; init; }
    public required bool RevealOnFail { get; init; }

    public static string KeyFor(string problemId, string contentVersion, string caseId) => $"{problemId}:{contentVersion}:{caseId}";
}

/// <summary>The judge's read of hidden tests (read-only MongoDB role in production).</summary>
public sealed class MongoHiddenTestReader(IMongoDatabase database) : IHiddenTestReader
{
    private readonly IMongoCollection<HiddenCaseDocument> _tests = database.GetCollection<HiddenCaseDocument>(Collections.ProblemTests);

    public async Task<IReadOnlyList<HiddenCase>> ForProblemAsync(string problemId, string contentVersion, CancellationToken cancellationToken)
    {
        var docs = await _tests.Find(t => t.ProblemId == problemId && t.ContentVersion == contentVersion)
            .SortBy(t => t.Order)
            .ToListAsync(cancellationToken);
        return
        [
            .. docs.Select(d => new HiddenCase
            {
                ProblemId = d.ProblemId,
                ContentVersion = d.ContentVersion,
                CaseId = d.CaseId,
                Input = d.Input,
                Expected = d.Expected,
                Tags = d.Tags,
                Weight = d.Weight,
                RevealOnFail = d.RevealOnFail,
            }),
        ];
    }
}
