namespace DarbSennin.ContentCli.Tests;

/// <summary>The command line: exit codes and what it prints.</summary>
public sealed class CommandTests : IDisposable
{
    private readonly ContentFixture _fixture = new();

    public void Dispose() => _fixture.Dispose();

    private static async Task<(int Code, string Out, string Err)> Run(params string[] args)
    {
        using var output = new StringWriter();
        using var error = new StringWriter();
        var code = await Cli.RunAsync(args, output, error, TestContext.Current.CancellationToken);
        return (code, output.ToString(), error.ToString());
    }

    [Fact]
    public async Task NoArguments_PrintsUsage_AndFails()
    {
        var (code, _, err) = await Run();

        code.ShouldBe(2);
        err.ShouldContain("validate");
        err.ShouldContain("import");
    }

    [Fact]
    public async Task Validate_DemoSet_Succeeds()
    {
        var (code, output, _) = await Run("validate", ContentFixture.DemoSet, "--config", ContentFixture.Config);

        code.ShouldBe(0);
        output.ShouldContain("6 problems");
    }

    [Fact]
    public async Task Validate_BrokenSet_FailsWithTheErrors()
    {
        _fixture.Delete("fewest-tiles/statement.md");

        var (code, _, err) = await Run("validate", _fixture.Set, "--config", ContentFixture.Config);

        code.ShouldBe(1);
        err.ShouldContain("statement.md");
    }

    [Fact]
    public async Task Import_WithoutAMode_IsRefused()
    {
        var (code, _, err) = await Run("import", ContentFixture.DemoSet, "--config", ContentFixture.Config);

        code.ShouldBe(2);
        err.ShouldContain("--mode");
    }

    [Fact]
    public async Task Import_InvalidContent_NeverTouchesTheDatabase()
    {
        _fixture.Delete("fewest-tiles/statement.md");

        // No database is configured: a failed validation must stop the run before any connection.
        var (code, _, err) = await Run("import", _fixture.Set, "--config", ContentFixture.Config, "--mode", "demo", "--skip-generators");

        code.ShouldBe(1);
        err.ShouldContain("statement.md");
    }
}
