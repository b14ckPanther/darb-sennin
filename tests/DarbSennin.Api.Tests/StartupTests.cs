using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.Options;

namespace DarbSennin.Api.Tests;

public sealed class StartupTests
{
    private static string RepoConfig()
    {
        for (var dir = new DirectoryInfo(AppContext.BaseDirectory); dir is not null; dir = dir.Parent)
        {
            if (File.Exists(Path.Combine(dir.FullName, "DarbSennin.sln")))
            {
                return Path.Combine(dir.FullName, "config");
            }
        }

        throw new InvalidOperationException("Repository root not found.");
    }

    [Fact]
    public void Api_Starts_WithTheRepoConfig()
    {
        using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(b => b.UseSetting("SENNIN_CONFIG_PATH", RepoConfig()));

        Should.NotThrow(() => factory.CreateClient());
    }

    [Fact]
    public void Api_RefusesToStart_WhenConfigIsMissing()
    {
        var empty = Directory.CreateTempSubdirectory("sennin-empty-config").FullName;
        using var factory = new WebApplicationFactory<Program>()
            .WithWebHostBuilder(b => b.UseSetting("SENNIN_CONFIG_PATH", empty));

        // Every missing file is reported at once, each as an options validation failure.
        var error = Should.Throw<AggregateException>(() => factory.CreateClient());
        var failures = error.Flatten().InnerExceptions;
        failures.ShouldAllBe(e => e is OptionsValidationException);
        error.Message.ShouldContain("grading.yaml");
        error.Message.ShouldContain("ranks.yaml");
        Directory.Delete(empty, recursive: true);
    }
}
