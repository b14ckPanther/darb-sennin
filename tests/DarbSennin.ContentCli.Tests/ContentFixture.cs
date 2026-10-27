namespace DarbSennin.ContentCli.Tests;

/// <summary>A throwaway copy of content/demo, so a test can break one thing and validate.</summary>
internal sealed class ContentFixture : IDisposable
{
    public static string Root { get; } = FindRoot();

    public static string DemoSet => Path.Combine(Root, "content", "demo");

    public static string Config => Path.Combine(Root, "config");

    public string Set { get; } = Path.Combine(Path.GetTempPath(), "sennin-content-" + Guid.NewGuid().ToString("N"));

    public ContentFixture()
    {
        foreach (var file in Directory.GetFiles(DemoSet, "*", SearchOption.AllDirectories))
        {
            var target = Path.Combine(Set, Path.GetRelativePath(DemoSet, file));
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target);
        }
    }

    public void Edit(string relative, string from, string to)
    {
        var path = Path.Combine(Set, relative);
        var text = File.ReadAllText(path);
        text.ShouldContain(from);
        File.WriteAllText(path, text.Replace(from, to, StringComparison.Ordinal));
    }

    public void Write(string relative, string text) => File.WriteAllText(Path.Combine(Set, relative), text);

    public void Delete(string relative) => File.Delete(Path.Combine(Set, relative));

    public void Dispose() => Directory.Delete(Set, recursive: true);

    private static string FindRoot()
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
