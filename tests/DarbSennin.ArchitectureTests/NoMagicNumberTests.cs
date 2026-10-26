using System.Reflection;

namespace DarbSennin.ArchitectureTests;

/// <summary>
/// CLAUDE.md 1.2: code holds mechanisms, never numbers. Numeric const or static readonly
/// fields other than 0 and 1 are forbidden in Domain and Reviewer; values belong in config.
/// </summary>
public sealed class NoMagicNumberTests
{
    public static TheoryData<string> GuardedAssemblies =>
    [
        typeof(Domain.AssemblyMarker).Assembly.GetName().Name!,
        typeof(Reviewer.AssemblyMarker).Assembly.GetName().Name!,
    ];

    [Theory]
    [MemberData(nameof(GuardedAssemblies))]
    public void GuardedAssembly_HasNoNumericConstantsOtherThanZeroOrOne(string assemblyName)
    {
        var assembly = Assembly.Load(assemblyName);

        MagicNumberScanner.Find(assembly.GetTypes()).ShouldBeEmpty();
    }

    [Fact]
    public void Scanner_FlagsPlantedConstAndStaticReadonly_ButAllowsZeroAndOne()
    {
        var hits = MagicNumberScanner.Find([typeof(PlantedFixture)]);

        hits.ShouldBe(
            [$"{typeof(PlantedFixture).FullName}.MemoryLimitMb = 256", $"{typeof(PlantedFixture).FullName}.HalfLife = 7.5"],
            ignoreOrder: true);
    }

    // Test fixture only: the scanner must catch these.
#pragma warning disable CA1823, IDE0051, CS0414
    private static class PlantedFixture
    {
        private const int MemoryLimitMb = 256;
        private static readonly double HalfLife = 7.5;
        private const int Zero = 0;
        private static readonly long One = 1;
        private const string Name = "not numeric";
    }
#pragma warning restore CA1823, IDE0051, CS0414
}
