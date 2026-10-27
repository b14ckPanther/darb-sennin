namespace DarbSennin.Infrastructure.Tests;

/// <summary>Finds the repository root (the folder holding DarbSennin.sln) from the test binary.</summary>
internal static class RepoPaths
{
    public static string Root { get; } = Find();

    public static string Config => Path.Combine(Root, "config");

    public static string Schemas => Path.Combine(Root, "config", "schemas");

    public static string Fixtures => Path.Combine(Root, "tests", "fixtures");

    private static string Find()
    {
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
        {
            if (File.Exists(Path.Combine(dir.FullName, "DarbSennin.sln")))
            {
                return dir.FullName;
            }
        }

        throw new InvalidOperationException("Repository root not found above the test binary.");
    }
}
