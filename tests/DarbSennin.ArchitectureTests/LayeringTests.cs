using NetArchTest.Rules;

namespace DarbSennin.ArchitectureTests;

public sealed class LayeringTests
{
    private static readonly System.Reflection.Assembly Domain = typeof(Domain.AssemblyMarker).Assembly;

    [Theory]
    [InlineData("DarbSennin.Infrastructure")]
    [InlineData("DarbSennin.Api")]
    [InlineData("DarbSennin.Judge")]
    [InlineData("DarbSennin.Sandbox")]
    [InlineData("DarbSennin.Reviewer")]
    [InlineData("Microsoft.AspNetCore")]
    [InlineData("MongoDB")]
    [InlineData("Azure")]
    [InlineData("Docker")]
    public void Domain_DoesNotDependOn_OuterLayersOrIo(string forbidden)
    {
        var result = Types.InAssembly(Domain).ShouldNot().HaveDependencyOn(forbidden).GetResult();

        (result.FailingTypeNames ?? []).ShouldBeEmpty($"Domain must stay pure C# (no {forbidden})");
    }
}
