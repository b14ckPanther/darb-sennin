namespace DarbSennin.ContentCli.Tests;

public sealed class AssemblySmokeTests
{
    [Fact]
    public void Marker_LivesInProductionAssembly_NamedAfterProject()
    {
        typeof(AssemblyMarker).Assembly.GetName().Name.ShouldBe("DarbSennin.ContentCli");
    }
}
