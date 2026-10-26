namespace DarbSennin.IntegrationTests;

/// <summary>
/// Reads settings for the local compose stack: process env vars first, then the repo-root .env
/// (git-ignored). Nothing is hardcoded; .env.example documents every key.
/// </summary>
internal static class LocalEnvironment
{
    private static readonly Lazy<IReadOnlyDictionary<string, string>> DotEnv = new(LoadDotEnv);

    public static string Require(string key) =>
        Get(key) ?? throw new InvalidOperationException(
            $"{key} is not set. Copy .env.example to .env and run: docker compose -f deploy/compose/compose.yml up -d");

    public static string? Get(string key) =>
        Environment.GetEnvironmentVariable(key) is { Length: > 0 } fromEnv ? fromEnv
            : DotEnv.Value.TryGetValue(key, out var fromFile) ? fromFile
            : null;

    private static Dictionary<string, string> LoadDotEnv()
    {
        var values = new Dictionary<string, string>(StringComparer.Ordinal);
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
        {
            var path = Path.Combine(dir.FullName, ".env");
            if (!File.Exists(Path.Combine(dir.FullName, "DarbSennin.sln")))
            {
                continue;
            }

            if (File.Exists(path))
            {
                foreach (var line in File.ReadAllLines(path))
                {
                    var trimmed = line.Trim();
                    if (trimmed.Length == 0 || trimmed.StartsWith('#'))
                    {
                        continue;
                    }

                    var split = trimmed.IndexOf('=', StringComparison.Ordinal);
                    if (split > 0)
                    {
                        values[trimmed[..split].Trim()] = trimmed[(split + 1)..].Trim().Trim('"');
                    }
                }
            }

            break;
        }

        return values;
    }
}
