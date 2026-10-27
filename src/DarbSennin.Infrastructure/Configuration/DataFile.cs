using System.Globalization;
using System.Text.Json.Nodes;
using YamlDotNet.Core;
using YamlDotNet.RepresentationModel;

namespace DarbSennin.Infrastructure.Configuration;

/// <summary>
/// Reads config and content files (YAML or JSON) into a JSON tree, so one JSON Schema validates
/// both formats and one serializer turns them into typed records.
/// </summary>
public static class DataFile
{
    public static JsonNode? Read(string path)
    {
        var text = File.ReadAllText(path);
        try
        {
            return Path.GetExtension(path).Equals(".json", StringComparison.OrdinalIgnoreCase)
                ? JsonNode.Parse(text)
                : ParseYaml(text);
        }
        catch (FormatException error)
        {
            throw new FormatException($"{path}: {error.Message}", error);
        }
        catch (System.Text.Json.JsonException error)
        {
            throw new FormatException($"{path}: {error.Message}", error);
        }
    }

    /// <summary>YAML 1.2 core schema: plain scalars become numbers, booleans or null; quoted ones stay text.</summary>
    public static JsonNode? ParseYaml(string text)
    {
        var stream = new YamlStream();
        try
        {
            stream.Load(new StringReader(text));
        }
        catch (YamlException error)
        {
            throw new FormatException($"line {error.Start.Line.ToString(CultureInfo.InvariantCulture)}: {error.Message}", error);
        }

        return stream.Documents.Count == 0 ? null : Convert(stream.Documents[0].RootNode);
    }

    private static JsonNode? Convert(YamlNode node) => node switch
    {
        YamlMappingNode map => ToObject(map),
        YamlSequenceNode list => new JsonArray([.. list.Children.Select(Convert)]),
        YamlScalarNode scalar => ToScalar(scalar),
        _ => throw new FormatException($"Unsupported YAML node at line {node.Start.Line.ToString(CultureInfo.InvariantCulture)}."),
    };

    private static JsonObject ToObject(YamlMappingNode map)
    {
        var result = new JsonObject();
        foreach (var (key, value) in map.Children)
        {
            var name = ((YamlScalarNode)key).Value ?? string.Empty;
            if (result.ContainsKey(name))
            {
                throw new FormatException($"duplicate key '{name}' at line {key.Start.Line.ToString(CultureInfo.InvariantCulture)}");
            }

            result[name] = Convert(value);
        }

        return result;
    }

    private static JsonValue? ToScalar(YamlScalarNode scalar)
    {
        var value = scalar.Value ?? string.Empty;
        if (scalar.Style is not ScalarStyle.Plain)
        {
            return JsonValue.Create(value);
        }

        switch (value)
        {
            case "" or "~" or "null" or "Null" or "NULL":
                return null;
            case "true" or "True" or "TRUE":
                return JsonValue.Create(true);
            case "false" or "False" or "FALSE":
                return JsonValue.Create(false);
        }

        if (long.TryParse(value, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var whole))
        {
            return JsonValue.Create(whole);
        }

        if (double.TryParse(value, NumberStyles.Float, CultureInfo.InvariantCulture, out var real) && double.IsFinite(real))
        {
            return JsonValue.Create(real);
        }

        return JsonValue.Create(value);
    }
}
