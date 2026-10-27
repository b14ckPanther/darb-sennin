using System.Text.Json;
using System.Text.Json.Serialization;

namespace DarbSennin.Infrastructure.Configuration;

/// <summary>
/// Reads config files from one directory: parse, schema-check, then bind to a typed record.
/// Errors are collected, never thrown here; the options factory turns them into a failed start.
/// </summary>
public sealed class SenninConfigSource(string directory)
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
        NumberHandling = JsonNumberHandling.Strict,
    };

    private readonly Lazy<SchemaCatalog> _schemas = new(() => SchemaCatalog.Load(Path.Combine(directory, "schemas")));

    public string Directory { get; } = directory;

    public (T? Value, IReadOnlyList<string> Errors) Load<T>(string relativePath)
        where T : class
    {
        var schema = ConfigFiles.All.FirstOrDefault(f => f.Path == relativePath).Schema
            ?? throw new ArgumentException($"{relativePath} is not a known config file.", nameof(relativePath));
        var path = Path.Combine(Directory, relativePath);
        if (!File.Exists(path))
        {
            return (null, [$"file not found at {path}"]);
        }

        try
        {
            var node = DataFile.Read(path);
            var errors = _schemas.Value.Validate(schema, node);
            if (errors.Count > 0)
            {
                return (null, errors);
            }

            var value = node.Deserialize<T>(Json);
            return value is null ? (null, ["file is empty"]) : (value, []);
        }
        catch (Exception error) when (error is FormatException or JsonException or IOException)
        {
            return (null, [error.Message]);
        }
    }
}
