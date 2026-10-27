using System.Text.Json;
using System.Text.Json.Nodes;
using Json.Schema;

namespace DarbSennin.Infrastructure.Configuration;

/// <summary>The JSON Schemas in config/schemas, by name (file name without ".schema.json").</summary>
public sealed class SchemaCatalog
{
    private const string Suffix = ".schema.json";
    private readonly Dictionary<string, JsonSchema> _schemas;

    private SchemaCatalog(Dictionary<string, JsonSchema> schemas) => _schemas = schemas;

    public IReadOnlyCollection<string> Names => _schemas.Keys;

    public static SchemaCatalog Load(string directory)
    {
        var options = new BuildOptions { SchemaRegistry = new SchemaRegistry() };
        var schemas = new Dictionary<string, JsonSchema>(StringComparer.Ordinal);
        foreach (var file in Directory.GetFiles(directory, "*" + Suffix))
        {
            var name = Path.GetFileName(file)[..^Suffix.Length];
            schemas[name] = JsonSchema.FromText(File.ReadAllText(file), options, new Uri(Path.GetFullPath(file)));
        }

        return new SchemaCatalog(schemas);
    }

    /// <summary>Plain-language errors with the place in the file they refer to; empty when valid.</summary>
    public IReadOnlyList<string> Validate(string schemaName, JsonNode? instance)
    {
        if (!_schemas.TryGetValue(schemaName, out var schema))
        {
            throw new KeyNotFoundException($"No schema named '{schemaName}'.");
        }

        using var document = JsonDocument.Parse(instance?.ToJsonString() ?? "null");
        var results = schema.Evaluate(document.RootElement, new EvaluationOptions { OutputFormat = OutputFormat.List });
        if (results.IsValid)
        {
            return [];
        }

        var errors = (results.Details ?? [])
            .Where(d => d.Errors is { Count: > 0 })
            .SelectMany(d => d.Errors!.Select(e => $"{Where(d.InstanceLocation.ToString())}: {e.Value}"))
            .Distinct(StringComparer.Ordinal)
            .ToList();
        return errors.Count > 0 ? errors : ["does not match its schema"];
    }

    private static string Where(string pointer) => pointer.Length == 0 ? "(root)" : pointer;
}
