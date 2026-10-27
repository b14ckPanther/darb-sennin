using DarbSennin.Domain.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;

namespace DarbSennin.Infrastructure.Configuration;

public static class ConfigServiceCollectionExtensions
{
    /// <summary>
    /// Binds every config file to <see cref="IOptions{TOptions}"/> and checks them all when the host
    /// starts: a missing file, a schema error or a broken cross-value rule stops startup with the
    /// file and field named (fail fast, CLAUDE.md 1.2).
    /// </summary>
    public static IServiceCollection AddSenninConfig(this IServiceCollection services, string directory)
    {
        var source = new SenninConfigSource(directory);
        services.AddSingleton(source);
        Add<GradingConfig>(services, source, ConfigFiles.Grading, (_, _) => []);
        Add<RubricConfig>(services, source, ConfigFiles.Rubric, (rubric, src) =>
            src.Load<GradingConfig>(ConfigFiles.Grading).Value is { } grading ? ConfigRules.Check(rubric, grading) : []);
        Add<TagsConfig>(services, source, ConfigFiles.Tags, (tags, _) => ConfigRules.Check(tags));
        Add<RanksConfig>(services, source, ConfigFiles.Ranks, (ranks, _) => ConfigRules.Check(ranks));
        Add<ProgressionConfig>(services, source, ConfigFiles.Progression, (_, _) => []);
        Add<LimitsConfig>(services, source, ConfigFiles.Limits, (_, _) => []);
        Add<SandboxProfilesConfig>(services, source, ConfigFiles.SandboxProfiles, (p, _) => ConfigRules.Check(p));
        Add<SandboxImagesConfig>(services, source, ConfigFiles.SandboxImages, (i, _) => ConfigRules.Check(i));
        return services;
    }

    private static void Add<T>(
        IServiceCollection services,
        SenninConfigSource source,
        string path,
        Func<T, SenninConfigSource, IEnumerable<string>> rules)
        where T : class
    {
        services.AddSingleton<IOptionsFactory<T>>(new FileOptionsFactory<T>(source, path, rules));
        services.AddOptions<T>().ValidateOnStart();
    }

    private sealed class FileOptionsFactory<T>(
        SenninConfigSource source,
        string path,
        Func<T, SenninConfigSource, IEnumerable<string>> rules) : IOptionsFactory<T>
        where T : class
    {
        public T Create(string name)
        {
            var (value, errors) = source.Load<T>(path);
            var problems = value is null ? errors : [.. errors, .. rules(value, source)];
            if (problems.Count > 0 || value is null)
            {
                throw new OptionsValidationException(name, typeof(T), problems.Select(p => $"{path}: {p}"));
            }

            return value;
        }
    }
}
