using System.Diagnostics;
using System.Globalization;
using DarbSennin.Domain.Content;

namespace DarbSennin.ContentCli;

/// <summary>
/// Proves a probe generator is deterministic for its seed by running it twice at its smallest
/// size. Generators are authored, reviewed content, never user code (ADR-052); they still run
/// with an empty environment, isolated Python, a scratch folder and a time limit. From Phase 5
/// the judge runs them only inside the sandbox.
/// </summary>
internal static class GeneratorCheck
{
    // Loads the generator file and prints make(n, Random(seed)). Passed with -c, so no file is written.
    private const string Driver =
        "import random, runpy, sys\n" +
        "module = runpy.run_path(sys.argv[1])\n" +
        "out = module['make'](int(sys.argv[2]), random.Random(int(sys.argv[3])))\n" +
        "if not isinstance(out, str): raise SystemExit('make() must return text')\n" +
        "sys.stdout.write(out)\n";

    public static IEnumerable<string> Run(string setDirectory, ProblemGenerator generator, int timeoutMs)
    {
        var file = Path.GetFullPath(Path.Combine(setDirectory, generator.ProblemId, "generators", generator.Entry));
        var folder = Path.GetFullPath(Path.Combine(setDirectory, generator.ProblemId, "generators")) + Path.DirectorySeparatorChar;
        if (!file.StartsWith(folder, StringComparison.Ordinal))
        {
            return [$"{generator.ProblemId}: generator entry '{generator.Entry}' is outside its folder"];
        }

        var size = generator.Sizes.Min();
        var first = Once(file, size, generator.Seed, timeoutMs);
        var second = Once(file, size, generator.Seed, timeoutMs);
        if (first.Error is not null)
        {
            return [$"{generator.ProblemId}: generator failed: {first.Error}"];
        }

        return first.Output == second.Output
            ? []
            : [$"{generator.ProblemId}: generator is not deterministic for seed {generator.Seed.ToString(CultureInfo.InvariantCulture)}: two runs at n={size.ToString(CultureInfo.InvariantCulture)} differ"];
    }

    private static (string Output, string? Error) Once(string file, int size, int seed, int timeoutMs)
    {
        var scratch = Directory.CreateTempSubdirectory("sennin-gen");
        try
        {
            var start = new ProcessStartInfo("python3")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
                WorkingDirectory = scratch.FullName,
            };
            start.Environment.Clear();
            start.Environment["PATH"] = Environment.GetEnvironmentVariable("PATH") ?? string.Empty;
            foreach (var arg in new[] { "-I", "-c", Driver, file, size.ToString(CultureInfo.InvariantCulture), seed.ToString(CultureInfo.InvariantCulture) })
            {
                start.ArgumentList.Add(arg);
            }

            using var process = Process.Start(start) ?? throw new InvalidOperationException("python3 did not start");
            var output = process.StandardOutput.ReadToEndAsync();
            var error = process.StandardError.ReadToEndAsync();
            if (!process.WaitForExit(timeoutMs))
            {
                process.Kill(entireProcessTree: true);
                return (string.Empty, $"timed out after {timeoutMs.ToString(CultureInfo.InvariantCulture)} ms");
            }

            return process.ExitCode == 0 ? (output.Result, null) : (string.Empty, error.Result.Trim());
        }
        catch (System.ComponentModel.Win32Exception)
        {
            return (string.Empty, "python3 is not installed; use --skip-generators");
        }
        finally
        {
            scratch.Delete(recursive: true);
        }
    }
}
