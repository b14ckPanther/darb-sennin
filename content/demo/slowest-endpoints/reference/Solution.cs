using System.Text;

var lines = Console.In.ReadToEnd().Split('\n');
var k = int.Parse(lines[0]);
var times = new Dictionary<string, List<long>>(StringComparer.Ordinal);
foreach (var line in lines.Skip(1))
{
    var parts = line.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
    if (parts.Length != 4 || !parts[2].All(char.IsAsciiDigit) || !parts[3].All(char.IsAsciiDigit))
    {
        continue;
    }

    var key = $"{parts[0]} {parts[1]}";
    if (!times.TryGetValue(key, out var list))
    {
        times[key] = list = [];
    }

    list.Add(long.Parse(parts[3]));
}

// Twice the median, so even counts stay whole numbers.
static long DoubleMedian(List<long> values)
{
    var sorted = values.Order().ToList();
    var mid = sorted.Count / 2;
    return sorted.Count % 2 == 1 ? sorted[mid] * 2 : sorted[mid - 1] + sorted[mid];
}

var ranked = times.Keys.OrderByDescending(e => DoubleMedian(times[e])).ThenBy(e => e, StringComparer.Ordinal).Take(k);
var output = new StringBuilder();
foreach (var endpoint in ranked)
{
    output.Append(endpoint).Append('\n');
}

Console.Out.Write(output.ToString());
