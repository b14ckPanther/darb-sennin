using DarbSennin.Infrastructure.Import;
using MongoDB.Driver;

namespace DarbSennin.ContentCli;

/// <summary>
/// sennin-content validate &lt;set&gt; [--config dir] [--skip-generators] [--run-references]
/// sennin-content import &lt;set&gt; --mode demo|normal [--config dir] [--skip-generators]
/// The config folder comes from --config or SENNIN_CONFIG_PATH; MongoDB from SENNIN_MONGO_URI and
/// SENNIN_MONGO_DATABASE. Exit codes: 0 ok, 1 invalid content, 2 bad usage.
/// </summary>
public static class Cli
{
    private const string Usage =
        "usage:\n" +
        "  sennin-content validate <set-dir> [--config <dir>] [--skip-generators] [--run-references]\n" +
        "  sennin-content import <set-dir> --mode demo|normal [--config <dir>] [--skip-generators]\n";

    public static async Task<int> RunAsync(string[] args, TextWriter output, TextWriter error, CancellationToken cancellationToken)
    {
        if (args.Length < 2 || args[0] is not ("validate" or "import"))
        {
            await error.WriteAsync(Usage);
            return 2;
        }

        var set = args[1];
        var config = Option(args, "--config") ?? Environment.GetEnvironmentVariable("SENNIN_CONFIG_PATH");
        if (string.IsNullOrEmpty(config))
        {
            await error.WriteLineAsync("Set --config or SENNIN_CONFIG_PATH to the config folder.");
            return 2;
        }

        string? mode = null;
        if (args[0] == "import")
        {
            mode = Option(args, "--mode");
            if (mode is not ("demo" or "normal"))
            {
                await error.WriteLineAsync("import needs --mode demo or --mode normal.");
                return 2;
            }
        }

        var report = ContentValidator.Validate(set, config, new ValidateOptions
        {
            CheckGenerators = !args.Contains("--skip-generators"),
            RunReferences = args.Contains("--run-references"),
        });
        foreach (var note in report.Notes)
        {
            await output.WriteLineAsync($"note: {note}");
        }

        if (!report.Ok)
        {
            foreach (var problem in report.Errors)
            {
                await error.WriteLineAsync(problem);
            }

            await error.WriteLineAsync($"{report.Errors.Count} errors in {set}");
            return 1;
        }

        await output.WriteLineAsync($"{set}: {report.Problems.Count} problems, {report.Problems.Sum(p => p.HiddenCases.Count)} hidden cases, content version {report.Set.ContentVersion}: valid");
        if (mode is null)
        {
            return 0;
        }

        var uri = Environment.GetEnvironmentVariable("SENNIN_MONGO_URI");
        var database = Environment.GetEnvironmentVariable("SENNIN_MONGO_DATABASE");
        if (string.IsNullOrEmpty(uri) || string.IsNullOrEmpty(database))
        {
            await error.WriteLineAsync("Set SENNIN_MONGO_URI and SENNIN_MONGO_DATABASE (see .env.example).");
            return 2;
        }

        try
        {
            var db = new MongoClient(uri).GetDatabase(database);
            var result = await new ContentImporter(db).ImportAsync(report.Set, mode == "demo", cancellationToken);
            await output.WriteLineAsync($"imported {result.Problems} problems: {result.Inserted} inserted, {result.Updated} updated, {result.Removed} removed");
            return 0;
        }
        catch (InvalidOperationException refused)
        {
            await error.WriteLineAsync(refused.Message);
            return 1;
        }
    }

    private static string? Option(string[] args, string name)
    {
        var at = Array.IndexOf(args, name);
        return at >= 0 && at + 1 < args.Length ? args[at + 1] : null;
    }
}
