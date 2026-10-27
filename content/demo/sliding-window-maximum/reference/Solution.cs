var data = Console.In.ReadToEnd().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Select(int.Parse).ToArray();
var n = data[0];
var k = data[1];
var readings = data.Skip(2).Take(n).ToArray();
var candidates = new LinkedList<int>();
var output = new List<int>();
for (var i = 0; i < readings.Length; i++)
{
    while (candidates.Count > 0 && readings[candidates.Last!.Value] <= readings[i])
    {
        candidates.RemoveLast();
    }

    candidates.AddLast(i);
    if (candidates.First!.Value <= i - k)
    {
        candidates.RemoveFirst();
    }

    if (i >= k - 1)
    {
        output.Add(readings[candidates.First.Value]);
    }
}

Console.WriteLine(string.Join(' ', output));
