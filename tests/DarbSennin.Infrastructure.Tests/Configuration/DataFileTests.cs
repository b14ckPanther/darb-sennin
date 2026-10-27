using System.Text.Json.Nodes;
using DarbSennin.Infrastructure.Configuration;

namespace DarbSennin.Infrastructure.Tests.Configuration;

public sealed class DataFileTests
{
    [Fact]
    public void ParseYaml_TypesPlainScalars_AndKeepsQuotedOnesAsStrings()
    {
        var node = DataFile.ParseYaml("""
            count: 12
            ratio: 0.15
            on: true
            none: null
            quoted: "12"
            time: "04:00"
            list: [a, 2]
            """);

        node!["count"]!.GetValue<long>().ShouldBe(12);
        node["ratio"]!.GetValue<double>().ShouldBe(0.15);
        node["on"]!.GetValue<bool>().ShouldBeTrue();
        node["none"].ShouldBeNull();
        node["quoted"]!.GetValue<string>().ShouldBe("12");
        node["time"]!.GetValue<string>().ShouldBe("04:00");
        node["list"]!.AsArray().Count.ShouldBe(2);
    }

    [Fact]
    public void ParseYaml_KeepsBlockTextExactly()
    {
        var node = DataFile.ParseYaml("input: |\n  3\n  t1 215\n");

        node!["input"]!.GetValue<string>().ShouldBe("3\nt1 215\n");
    }

    [Fact]
    public void ParseYaml_RejectsDuplicateKeys()
    {
        Should.Throw<FormatException>(() => DataFile.ParseYaml("a: 1\na: 2\n"));
    }

    [Fact]
    public void Read_ParsesJsonFilesToo()
    {
        var path = Path.Combine(RepoPaths.Config, "ui", "locale.json");

        DataFile.Read(path).ShouldBeOfType<JsonObject>();
    }
}
