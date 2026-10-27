using DarbSennin.Domain.Content;
using MongoDB.Driver;

namespace DarbSennin.Infrastructure.Persistence;

/// <summary>Public problem reads. It only knows the problems collection.</summary>
public sealed class MongoProblemCatalog(IMongoDatabase database) : IProblemCatalog
{
    private readonly IMongoCollection<ProblemDocument> _problems = database.GetCollection<ProblemDocument>(Collections.Problems);

    public async Task<IReadOnlyList<PublicProblem>> ListAsync(CancellationToken cancellationToken)
    {
        var docs = await _problems.Find(FilterDefinition<ProblemDocument>.Empty).SortBy(p => p.Id).ToListAsync(cancellationToken);
        return [.. docs.Select(ToPublic)];
    }

    public async Task<PublicProblem?> GetAsync(string problemId, CancellationToken cancellationToken)
    {
        var doc = await _problems.Find(p => p.Id == problemId).FirstOrDefaultAsync(cancellationToken);
        return doc is null ? null : ToPublic(doc);
    }

    private static PublicProblem ToPublic(ProblemDocument d) => new()
    {
        Id = d.Id,
        ContentVersion = d.ContentVersion,
        Title = d.Title,
        StatementMd = d.StatementMd,
        Family = d.Family,
        Tags = d.Tags,
        Difficulty = d.Difficulty,
        IsBoss = d.IsBoss,
        Comparator = d.Comparator,
        FloatTolerance = d.FloatTolerance,
        Limits = new ProblemLimits { TimeMs = d.TimeMs, MemoryMb = d.MemoryMb },
        Target = new ComplexityTarget { Label = d.TargetLabel, Exponent = d.TargetExponent },
        Constraints = d.Constraints,
        Starters = d.Starters,
        Samples = [.. d.Samples.Select(s => new SampleCase { Id = s.Id, Input = s.Input, Expected = s.Expected, Note = s.Note })],
        HiddenCaseCount = d.HiddenCaseCount,
        Demo = d.Demo,
    };
}
