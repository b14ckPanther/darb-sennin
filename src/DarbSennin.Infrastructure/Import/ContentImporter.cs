using DarbSennin.Infrastructure.Content;
using DarbSennin.Infrastructure.Judging;
using DarbSennin.Infrastructure.Persistence;
using MongoDB.Driver;

namespace DarbSennin.Infrastructure.Import;

public sealed record ImportResult(int Problems, int Inserted, int Updated, int Removed);

/// <summary>
/// `sennin-content import`: upserts problems, hidden tests and generators under the set's content
/// version. Unchanged documents are left alone, so a re-import reports and changes nothing; cases
/// and problems that left the content are removed.
/// </summary>
public sealed class ContentImporter(IMongoDatabase database)
{
    private readonly IMongoCollection<ProblemDocument> _problems = database.GetCollection<ProblemDocument>(Collections.Problems);
    private readonly IMongoCollection<HiddenCaseDocument> _tests = database.GetCollection<HiddenCaseDocument>(Collections.ProblemTests);
    private readonly IMongoCollection<GeneratorDocument> _generators = database.GetCollection<GeneratorDocument>(Collections.ProblemGenerators);

    public async Task<ImportResult> ImportAsync(ContentSet set, bool demoMode, CancellationToken cancellationToken)
    {
        if (set.Errors.Count > 0)
        {
            throw new InvalidOperationException($"Content has {set.Errors.Count} errors; run validate first.");
        }

        if (set.Demo != demoMode)
        {
            throw new InvalidOperationException(set.Demo
                ? "This is a demo set; import it with --mode demo."
                : "This is not a demo set; demo mode only imports demo content.");
        }

        await EnsureIndexesAsync(cancellationToken);
        var inserted = 0;
        var updated = 0;
        var removed = 0;

        foreach (var package in set.Problems)
        {
            var p = package.Problem;
            (inserted, updated) = Add((inserted, updated), await UpsertAsync(_problems, d => d.Id == p.Id, ToDocument(set.SetId, package), cancellationToken));
            var generator = package.Generator;
            var genId = $"{generator.ProblemId}:{generator.ContentVersion}";
            (inserted, updated) = Add((inserted, updated), await UpsertAsync(_generators, d => d.Id == genId, new GeneratorDocument
            {
                Id = genId,
                ProblemId = generator.ProblemId,
                ContentVersion = generator.ContentVersion,
                Entry = generator.Entry,
                Source = generator.Source,
                Seed = generator.Seed,
                Sizes = [.. generator.Sizes],
                TargetComplexity = generator.TargetComplexity,
            }, cancellationToken));

            var keep = new List<string>();
            for (var i = 0; i < package.HiddenCases.Count; i++)
            {
                var c = package.HiddenCases[i];
                var id = HiddenCaseDocument.KeyFor(c.ProblemId, c.ContentVersion, c.CaseId);
                keep.Add(id);
                (inserted, updated) = Add((inserted, updated), await UpsertAsync(_tests, d => d.Id == id, new HiddenCaseDocument
                {
                    Id = id,
                    ProblemId = c.ProblemId,
                    ContentVersion = c.ContentVersion,
                    CaseId = c.CaseId,
                    Order = i,
                    Input = c.Input,
                    Expected = c.Expected,
                    Tags = [.. c.Tags],
                    Weight = c.Weight,
                    RevealOnFail = c.RevealOnFail,
                }, cancellationToken));
            }

            var gone = await _tests.DeleteManyAsync(
                t => t.ProblemId == p.Id && t.ContentVersion == p.ContentVersion && !keep.Contains(t.Id),
                cancellationToken);
            removed += (int)gone.DeletedCount;
        }

        var ids = set.Problems.Select(p => p.Problem.Id).ToList();
        var left = await _problems.DeleteManyAsync(p => p.Set == set.SetId && !ids.Contains(p.Id), cancellationToken);
        removed += (int)left.DeletedCount;
        return new ImportResult(set.Problems.Count, inserted, updated, removed);
    }

    private static (int Inserted, int Updated) Add((int Inserted, int Updated) totals, ReplaceOneResult result) =>
        (totals.Inserted + (result.UpsertedId is null ? 0 : 1), totals.Updated + (int)result.ModifiedCount);

    private static Task<ReplaceOneResult> UpsertAsync<T>(IMongoCollection<T> collection, System.Linq.Expressions.Expression<Func<T, bool>> filter, T document, CancellationToken cancellationToken) =>
        collection.ReplaceOneAsync(filter, document, new ReplaceOptions { IsUpsert = true }, cancellationToken);

    private static ProblemDocument ToDocument(string set, Domain.Content.ProblemPackage package)
    {
        var p = package.Problem;
        return new ProblemDocument
        {
            Id = p.Id,
            Set = set,
            ContentVersion = p.ContentVersion,
            Title = p.Title,
            StatementMd = p.StatementMd,
            Family = p.Family,
            Tags = [.. p.Tags],
            Difficulty = p.Difficulty,
            IsBoss = p.IsBoss,
            Comparator = p.Comparator,
            FloatTolerance = p.FloatTolerance,
            TimeMs = p.Limits.TimeMs,
            MemoryMb = p.Limits.MemoryMb,
            TargetLabel = p.Target.Label,
            TargetExponent = p.Target.Exponent,
            Constraints = [.. p.Constraints],
            Starters = new Dictionary<string, string>(p.Starters, StringComparer.Ordinal),
            Samples = [.. p.Samples.Select(s => new SampleDocument { Id = s.Id, Input = s.Input, Expected = s.Expected, Note = s.Note })],
            HiddenCaseCount = p.HiddenCaseCount,
            Demo = p.Demo,
        };
    }

    private async Task EnsureIndexesAsync(CancellationToken cancellationToken)
    {
        await _problems.Indexes.CreateManyAsync(
        [
            new CreateIndexModel<ProblemDocument>(Builders<ProblemDocument>.IndexKeys.Ascending(p => p.Tags).Ascending(p => p.Difficulty)),
            new CreateIndexModel<ProblemDocument>(Builders<ProblemDocument>.IndexKeys.Ascending(p => p.ContentVersion)),
        ], cancellationToken);
        await _tests.Indexes.CreateOneAsync(
            new CreateIndexModel<HiddenCaseDocument>(Builders<HiddenCaseDocument>.IndexKeys.Ascending(t => t.ProblemId).Ascending(t => t.ContentVersion).Ascending(t => t.Order)),
            cancellationToken: cancellationToken);
        await _generators.Indexes.CreateOneAsync(
            new CreateIndexModel<GeneratorDocument>(Builders<GeneratorDocument>.IndexKeys.Ascending(g => g.ProblemId)),
            cancellationToken: cancellationToken);
    }
}
