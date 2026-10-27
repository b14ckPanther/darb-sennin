using System.Text.Json;
using DarbSennin.Infrastructure.Configuration;
using DarbSennin.Infrastructure.Content;
using DarbSennin.Infrastructure.Import;
using DarbSennin.Infrastructure.Judging;
using DarbSennin.Infrastructure.Persistence;
using MongoDB.Driver;
using Testcontainers.MongoDb;

namespace DarbSennin.IntegrationTests;

/// <summary>
/// `sennin-content import` against a throwaway MongoDB (Testcontainers): upserts with the content
/// version, re-import is idempotent, and the public catalog never returns hidden data.
/// </summary>
[Trait("Category", "Integration")]
public sealed class ContentImportTests : IAsyncLifetime
{
    private readonly MongoDbContainer _mongo = new MongoDbBuilder(LocalEnvironment.Require("SENNIN_MONGO_IMAGE")).Build();
    private IMongoDatabase _db = null!;
    private ContentSet _demo = null!;

    public async ValueTask InitializeAsync()
    {
        await _mongo.StartAsync(TestContext.Current.CancellationToken);
        _db = new MongoClient(_mongo.GetConnectionString()).GetDatabase("sennin-test");
        _demo = ContentLoader.Load(Repo.DemoSet, SchemaCatalog.Load(Path.Combine(Repo.Config, "schemas")));
        _demo.Errors.ShouldBeEmpty();
    }

    public async ValueTask DisposeAsync() => await _mongo.DisposeAsync();

    [Fact]
    public async Task Import_WritesProblemsTestsAndGenerators_WithTheContentVersion()
    {
        var result = await new ContentImporter(_db).ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);

        result.Problems.ShouldBe(6);
        result.Inserted.ShouldBeGreaterThan(0);
        var tests = _db.GetCollection<HiddenCaseDocument>(Collections.ProblemTests);
        (await tests.CountDocumentsAsync(t => t.ContentVersion == _demo.ContentVersion, cancellationToken: TestContext.Current.CancellationToken))
            .ShouldBe(_demo.Problems.Sum(p => p.HiddenCases.Count));
        var problems = _db.GetCollection<ProblemDocument>(Collections.Problems);
        (await problems.Find(p => p.Demo).CountDocumentsAsync(TestContext.Current.CancellationToken)).ShouldBe(6);
    }

    [Fact]
    public async Task Reimport_ChangesNothing()
    {
        var importer = new ContentImporter(_db);
        await importer.ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);
        var counts = await Counts();

        var again = await importer.ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);

        again.Inserted.ShouldBe(0);
        again.Updated.ShouldBe(0);
        again.Removed.ShouldBe(0);
        (await Counts()).ShouldBe(counts);
    }

    [Fact]
    public async Task Reimport_RemovesCasesThatLeftTheContent()
    {
        var importer = new ContentImporter(_db);
        await importer.ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);
        var first = _demo.Problems[0];
        var trimmed = _demo with
        {
            Problems = [first with { HiddenCases = first.HiddenCases.Skip(1).ToList() }, .. _demo.Problems.Skip(1)],
        };

        var result = await importer.ImportAsync(trimmed, demoMode: true, TestContext.Current.CancellationToken);

        result.Removed.ShouldBe(1);
    }

    [Fact]
    public async Task Import_Refuses_WhenTheModeDoesNotMatchTheSet()
    {
        await Should.ThrowAsync<InvalidOperationException>(
            () => new ContentImporter(_db).ImportAsync(_demo, demoMode: false, TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task PublicCatalog_ReturnsNoHiddenData()
    {
        await new ContentImporter(_db).ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);

        var catalog = new MongoProblemCatalog(_db);
        var all = await catalog.ListAsync(TestContext.Current.CancellationToken);
        var json = JsonSerializer.Serialize(all);

        all.Count.ShouldBe(6);
        foreach (var hidden in _demo.Problems.SelectMany(p => p.HiddenCases))
        {
            json.ShouldNotContain($"\"{hidden.CaseId}\"");
            var escaped = JsonSerializer.Serialize(hidden.Input).Trim('"');
            if (escaped.Length >= 12)
            {
                json.ShouldNotContain(escaped, customMessage: $"hidden input of {hidden.ProblemId}/{hidden.CaseId} leaked");
            }
        }

        var one = await catalog.GetAsync("fewest-tiles", TestContext.Current.CancellationToken);
        one.ShouldNotBeNull();
        one.Samples.ShouldNotBeEmpty();
        one.HiddenCaseCount.ShouldBeGreaterThan(0);
    }

    [Fact]
    public async Task HiddenTestReader_ReturnsTheCasesForTheJudge()
    {
        await new ContentImporter(_db).ImportAsync(_demo, demoMode: true, TestContext.Current.CancellationToken);
        var expected = _demo.Problems.Single(p => p.Problem.Id == "fewest-tiles").HiddenCases;

        var cases = await new MongoHiddenTestReader(_db).ForProblemAsync("fewest-tiles", _demo.ContentVersion, TestContext.Current.CancellationToken);

        cases.Select(c => c.CaseId).ShouldBe(expected.Select(c => c.CaseId));
        cases[0].Expected.ShouldBe(expected[0].Expected);
    }

    private async Task<(long Problems, long Tests, long Generators)> Counts() =>
        (await _db.GetCollection<ProblemDocument>(Collections.Problems).CountDocumentsAsync(FilterDefinition<ProblemDocument>.Empty, cancellationToken: TestContext.Current.CancellationToken),
         await _db.GetCollection<HiddenCaseDocument>(Collections.ProblemTests).CountDocumentsAsync(FilterDefinition<HiddenCaseDocument>.Empty, cancellationToken: TestContext.Current.CancellationToken),
         await _db.GetCollection<GeneratorDocument>(Collections.ProblemGenerators).CountDocumentsAsync(FilterDefinition<GeneratorDocument>.Empty, cancellationToken: TestContext.Current.CancellationToken));

    private static class Repo
    {
        public static string Root { get; } = Find();

        public static string DemoSet => Path.Combine(Root, "content", "demo");

        public static string Config => Path.Combine(Root, "config");

        private static string Find()
        {
            for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
            {
                if (File.Exists(Path.Combine(dir.FullName, "DarbSennin.sln")))
                {
                    return dir.FullName;
                }
            }

            throw new InvalidOperationException("Repository root not found.");
        }
    }
}
