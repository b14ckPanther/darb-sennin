using DarbSennin.Domain.Configuration;
using DarbSennin.Infrastructure.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace DarbSennin.Infrastructure.Tests.Configuration;

public sealed class StartupValidationTests : IDisposable
{
    private readonly string _copy = Path.Combine(Path.GetTempPath(), "sennin-config-" + Guid.NewGuid().ToString("N"));

    public StartupValidationTests()
    {
        foreach (var file in Directory.GetFiles(RepoPaths.Config, "*", SearchOption.AllDirectories))
        {
            var target = Path.Combine(_copy, Path.GetRelativePath(RepoPaths.Config, file));
            Directory.CreateDirectory(Path.GetDirectoryName(target)!);
            File.Copy(file, target);
        }
    }

    public void Dispose() => Directory.Delete(_copy, recursive: true);

    private static IHost BuildHost(string configDir)
    {
        var builder = Host.CreateApplicationBuilder();
        builder.Services.AddSenninConfig(configDir);
        return builder.Build();
    }

    private void Edit(string relative, string from, string to)
    {
        var path = Path.Combine(_copy, relative);
        var text = File.ReadAllText(path);
        text.ShouldContain(from);
        File.WriteAllText(path, text.Replace(from, to, StringComparison.Ordinal));
    }

    [Fact]
    public async Task Start_WithTheRepoConfig_BindsTypedOptions()
    {
        using var host = BuildHost(RepoPaths.Config);
        await host.StartAsync(TestContext.Current.CancellationToken);

        var services = host.Services;
        var grading = services.GetRequiredService<IOptions<GradingConfig>>().Value;
        var expected = DataFile.Read(Path.Combine(RepoPaths.Config, ConfigFiles.Grading))!;
        ((long)grading.Components.Tests.Max).ShouldBe(expected["components"]!["tests"]!["max"]!.GetValue<long>());
        grading.SeverityWeights.Keys.ShouldBe(["critical", "major", "minor", "nit"], ignoreOrder: true);

        services.GetRequiredService<IOptions<RanksConfig>>().Value.Ranks.ShouldNotBeEmpty();
        services.GetRequiredService<IOptions<RubricConfig>>().Value.PraiseGate.MaxSeverity.ShouldNotBeNullOrEmpty();
        services.GetRequiredService<IOptions<TagsConfig>>().Value.Tags.ShouldNotBeEmpty();
        services.GetRequiredService<IOptions<ProgressionConfig>>().Value.Streak.TimeZone.ShouldNotBeNullOrEmpty();
        services.GetRequiredService<IOptions<LimitsConfig>>().Value.Reviewer.MonthlySpendCapUsd.ShouldBeGreaterThanOrEqualTo(0);
        services.GetRequiredService<IOptions<SandboxProfilesConfig>>().Value.Profiles.ShouldNotBeEmpty();
        services.GetRequiredService<IOptions<SandboxImagesConfig>>().Value.Images.ShouldNotBeEmpty();

        await host.StopAsync(TestContext.Current.CancellationToken);
    }

    [Fact]
    public async Task Start_FailsFast_WhenAFileBreaksItsSchema()
    {
        Edit(ConfigFiles.Limits, "maxCodeBytes: 65536", "maxCodeBytes: 0");
        using var host = BuildHost(_copy);

        var error = await Should.ThrowAsync<OptionsValidationException>(
            () => host.StartAsync(TestContext.Current.CancellationToken));

        error.Message.ShouldContain("limits.yaml");
        error.Message.ShouldContain("maxCodeBytes");
    }

    [Fact]
    public async Task Start_FailsFast_WhenAFileIsMissing()
    {
        File.Delete(Path.Combine(_copy, ConfigFiles.Ranks));
        using var host = BuildHost(_copy);

        var error = await Should.ThrowAsync<OptionsValidationException>(
            () => host.StartAsync(TestContext.Current.CancellationToken));

        error.Message.ShouldContain("ranks.yaml");
    }

    [Fact]
    public async Task Start_FailsFast_WhenRankThresholdsDoNotRise()
    {
        Edit(ConfigFiles.Ranks, "threshold: 1600", "threshold: 700");
        using var host = BuildHost(_copy);

        var error = await Should.ThrowAsync<OptionsValidationException>(
            () => host.StartAsync(TestContext.Current.CancellationToken));

        error.Message.ShouldContain("rise");
    }

    [Fact]
    public async Task Start_FailsFast_WhenTheFirstRankDoesNotStartAtZero()
    {
        Edit(ConfigFiles.Ranks, "threshold: 0", "threshold: 50");
        using var host = BuildHost(_copy);

        await Should.ThrowAsync<OptionsValidationException>(() => host.StartAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Start_FailsFast_WhenTwoSandboxProfilesShareAnId()
    {
        Edit(ConfigFiles.SandboxProfiles, "id: csharp-run", "id: python-run");
        using var host = BuildHost(_copy);

        var error = await Should.ThrowAsync<OptionsValidationException>(
            () => host.StartAsync(TestContext.Current.CancellationToken));

        error.Message.ShouldContain("python-run");
    }

    [Fact]
    public async Task Start_FailsFast_WhenThePraiseGateNamesASeverityTheRubricDoesNotHave()
    {
        Edit(ConfigFiles.Rubric, "severities: [critical, major, minor, nit]", "severities: [critical, major, minor]");
        using var host = BuildHost(_copy);

        await Should.ThrowAsync<OptionsValidationException>(() => host.StartAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Start_FailsFast_WhenALanguageHasTwoImages()
    {
        Edit(ConfigFiles.SandboxImages, "  - language: javascript", "  - language: python");
        using var host = BuildHost(_copy);

        await Should.ThrowAsync<OptionsValidationException>(() => host.StartAsync(TestContext.Current.CancellationToken));
    }
}
