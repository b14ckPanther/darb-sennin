using DarbSennin.Sandbox;

namespace DarbSennin.Sandbox.SecurityTests;

// Placeholder until Phase 5 adds the malicious-code corpus runner.
public sealed class AssemblySmokeTests
{
    [Fact]
    public void SandboxAssembly_IsReferenced()
    {
        typeof(AssemblyMarker).Assembly.GetName().Name.ShouldBe("DarbSennin.Sandbox");
    }
}
