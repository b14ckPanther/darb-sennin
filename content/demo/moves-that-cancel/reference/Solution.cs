var data = Console.In.ReadToEnd().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Select(long.Parse).ToArray();
var n = (int)data[0];
var firstAt = new Dictionary<long, int>();
for (var j = 0; j < n; j++)
{
    var value = data[1 + j];
    if (firstAt.TryGetValue(-value, out var i))
    {
        Console.WriteLine($"{i} {j}");
        return;
    }

    firstAt.TryAdd(value, j);
}

Console.WriteLine(-1);
