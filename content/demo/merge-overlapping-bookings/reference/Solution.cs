using System.Text;

var data = Console.In.ReadToEnd().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
var n = data[0];
var spans = Enumerable.Range(0, n).Select(i => (Start: data[1 + (2 * i)], End: data[2 + (2 * i)])).OrderBy(s => s.Start).ThenBy(s => s.End).ToList();
var merged = new List<int[]>();
foreach (var (start, end) in spans)
{
    if (merged.Count > 0 && start <= merged[^1][1])
    {
        merged[^1][1] = Math.Max(merged[^1][1], end);
    }
    else
    {
        merged.Add([start, end]);
    }
}

var output = new StringBuilder();
foreach (var block in merged)
{
    output.Append(block[0]).Append(' ').Append(block[1]).Append('\n');
}

Console.Out.Write(output.ToString());
