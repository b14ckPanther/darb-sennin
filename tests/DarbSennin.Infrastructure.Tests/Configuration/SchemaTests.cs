using DarbSennin.Infrastructure.Configuration;

namespace DarbSennin.Infrastructure.Tests.Configuration;

/// <summary>
/// Every schema in config/schemas has a valid and at least one invalid example under
/// tests/fixtures/schemas/&lt;schema&gt;/. Valid ones must pass, invalid ones must fail.
/// </summary>
public sealed class SchemaTests
{
    private static readonly SchemaCatalog Catalog = SchemaCatalog.Load(RepoPaths.Schemas);

    public static TheoryData<string> SchemaNames()
    {
        var data = new TheoryData<string>();
        foreach (var file in Directory.GetFiles(RepoPaths.Schemas, "*.schema.json").Order(StringComparer.Ordinal))
        {
            data.Add(Path.GetFileName(file)[..^".schema.json".Length]);
        }

        return data;
    }

    public static TheoryData<string, string> Examples(string kind)
    {
        var data = new TheoryData<string, string>();
        var root = Path.Combine(RepoPaths.Fixtures, "schemas");
        foreach (var dir in Directory.GetDirectories(root).Order(StringComparer.Ordinal))
        {
            foreach (var file in Directory.GetFiles(dir, $"{kind}*.*").Order(StringComparer.Ordinal))
            {
                data.Add(Path.GetFileName(dir), Path.GetFileName(file));
            }
        }

        return data;
    }

    public static TheoryData<string, string> ValidExamples() => Examples("valid");

    public static TheoryData<string, string> InvalidExamples() => Examples("invalid");

    [Theory]
    [MemberData(nameof(SchemaNames))]
    public void EverySchema_HasValidAndInvalidExamples(string schema)
    {
        var dir = Path.Combine(RepoPaths.Fixtures, "schemas", schema);
        Directory.Exists(dir).ShouldBeTrue($"no examples for {schema}");
        Directory.GetFiles(dir, "valid*.*").ShouldNotBeEmpty();
        Directory.GetFiles(dir, "invalid*.*").ShouldNotBeEmpty();
    }

    [Theory]
    [MemberData(nameof(ValidExamples))]
    public void ValidExample_PassesItsSchema(string schema, string file)
    {
        var node = DataFile.Read(Path.Combine(RepoPaths.Fixtures, "schemas", schema, file));

        Catalog.Validate(schema, node).ShouldBeEmpty();
    }

    [Theory]
    [MemberData(nameof(InvalidExamples))]
    public void InvalidExample_FailsItsSchema(string schema, string file)
    {
        var node = DataFile.Read(Path.Combine(RepoPaths.Fixtures, "schemas", schema, file));

        Catalog.Validate(schema, node).ShouldNotBeEmpty();
    }

    [Fact]
    public void EveryRealConfigFile_PassesItsSchema()
    {
        var failures = new List<string>();
        foreach (var (relative, schema) in ConfigFiles.All)
        {
            var errors = Catalog.Validate(schema, DataFile.Read(Path.Combine(RepoPaths.Config, relative)));
            failures.AddRange(errors.Select(e => $"{relative}: {e}"));
        }

        failures.ShouldBeEmpty();
    }

    [Fact]
    public void UnknownSchema_IsAnError()
    {
        Should.Throw<KeyNotFoundException>(() => Catalog.Validate("no-such-schema", DataFile.Read(
            Path.Combine(RepoPaths.Config, "ranks.yaml"))));
    }
}
