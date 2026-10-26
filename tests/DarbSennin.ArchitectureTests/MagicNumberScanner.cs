using System.Globalization;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace DarbSennin.ArchitectureTests;

/// <summary>Finds numeric const and static readonly fields whose value is not 0 or 1.</summary>
internal static class MagicNumberScanner
{
    private const BindingFlags AllStatic =
        BindingFlags.Static | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.DeclaredOnly;

    private static readonly HashSet<Type> NumericTypes =
    [
        typeof(byte), typeof(sbyte), typeof(short), typeof(ushort), typeof(int), typeof(uint),
        typeof(long), typeof(ulong), typeof(float), typeof(double), typeof(decimal), typeof(nint), typeof(nuint),
    ];

    public static IReadOnlyList<string> Find(IEnumerable<Type> types)
    {
        var hits = new List<string>();
        foreach (var type in types)
        {
            if (type.IsDefined(typeof(CompilerGeneratedAttribute), inherit: false) || type.IsEnum)
            {
                continue;
            }

            foreach (var field in type.GetFields(AllStatic))
            {
                if (!NumericTypes.Contains(field.FieldType) || field.IsDefined(typeof(CompilerGeneratedAttribute)))
                {
                    continue;
                }

                object? value = field.IsLiteral ? field.GetRawConstantValue()
                    : field.IsInitOnly ? field.GetValue(null)
                    : null;
                if (value is null)
                {
                    continue;
                }

                var number = Convert.ToDecimal(value, CultureInfo.InvariantCulture);
                if (number is not 0m and not 1m)
                {
                    hits.Add(string.Create(CultureInfo.InvariantCulture, $"{type.FullName}.{field.Name} = {value}"));
                }
            }
        }

        return hits;
    }
}
