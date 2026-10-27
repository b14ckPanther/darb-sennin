var data = Console.In.ReadToEnd().Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Select(long.Parse).ToArray();
var m = (int)data[0];
var start = data[1];
var goal = data[2];
var pos = 3;
var lines = new List<HashSet<long>>();
for (var i = 0; i < m; i++)
{
    var c = (int)data[pos];
    lines.Add([.. data.Skip(pos + 1).Take(c)]);
    pos += 1 + c;
}

if (start == goal)
{
    Console.WriteLine(0);
    return;
}

var byStation = new Dictionary<long, List<int>>();
for (var i = 0; i < lines.Count; i++)
{
    foreach (var s in lines[i])
    {
        if (!byStation.TryGetValue(s, out var list))
        {
            byStation[s] = list = [];
        }

        list.Add(i);
    }
}

var first = byStation.GetValueOrDefault(start) ?? [];
var queue = new Queue<(int Line, int Changes)>(first.Select(l => (l, 0)));
var seenLines = new HashSet<int>(first);
var seenStations = new HashSet<long> { start };
while (queue.Count > 0)
{
    var (line, changes) = queue.Dequeue();
    if (lines[line].Contains(goal))
    {
        Console.WriteLine(changes);
        return;
    }

    foreach (var s in lines[line])
    {
        if (!seenStations.Add(s))
        {
            continue;
        }

        foreach (var next in byStation[s])
        {
            if (seenLines.Add(next))
            {
                queue.Enqueue((next, changes + 1));
            }
        }
    }
}

Console.WriteLine(-1);
