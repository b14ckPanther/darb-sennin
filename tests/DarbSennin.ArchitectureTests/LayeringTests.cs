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

public sealed class HiddenTestSeparationTests
{
    private static readonly System.Reflection.Assembly Api = typeof(Api.AssemblyMarker).Assembly;

    [Theory]
    [InlineData("DarbSennin.Domain.Judging")]
    [InlineData("DarbSennin.Infrastructure.Judging")]
    [InlineData("DarbSennin.Infrastructure.Import")]
    public void Api_NeverReferences_HiddenTestsOrTheImporter(string forbidden)
    {
        var result = Types.InAssembly(Api).ShouldNot().HaveDependencyOn(forbidden).GetResult();

        (result.FailingTypeNames ?? []).ShouldBeEmpty($"the API must not reach {forbidden}");
    }

    [Fact]
    public void PublicProblem_TypeGraph_HoldsNoHiddenTestType()
    {
        var seen = new HashSet<Type>();
        var queue = new Queue<Type>([typeof(Domain.Content.PublicProblem)]);
        while (queue.Count > 0)
        {
            var type = queue.Dequeue();
            if (!seen.Add(type))
            {
                continue;
            }

            (type.Namespace ?? string.Empty).StartsWith("DarbSennin.Domain.Judging", StringComparison.Ordinal).ShouldBeFalse($"{type} reaches the hidden tests");
            foreach (var next in type.GetProperties().Select(p => p.PropertyType).Concat(type.GenericTypeArguments))
            {
                queue.Enqueue(next);
            }
        }
    }
}
