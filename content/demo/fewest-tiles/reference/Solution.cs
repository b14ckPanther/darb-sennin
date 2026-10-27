var data = Console.In.ReadToEnd().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries);
var k = int.Parse(data[0]);
var length = int.Parse(data[1]);
var tiles = data.Skip(2).Take(k).Select(int.Parse).ToArray();
var best = new int[length + 1];
Array.Fill(best, length + 1);
best[0] = 0;
for (var size = 1; size <= length; size++)
{
    foreach (var t in tiles)
    {
        if (t <= size && best[size - t] + 1 < best[size])
        {
            best[size] = best[size - t] + 1;
        }
    }
}

Console.WriteLine(best[length] <= length ? best[length] : -1);
