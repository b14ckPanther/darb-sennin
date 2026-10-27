namespace DarbSennin.Infrastructure.Configuration;

/// <summary>Every config file under config/ and the schema it must pass, checked at startup and in CI.</summary>
public static class ConfigFiles
{
    public const string Grading = "grading.yaml";
    public const string Rubric = "rubric/v1.yaml";
    public const string Tags = "tags.yaml";
    public const string Ranks = "ranks.yaml";
    public const string Progression = "progression.yaml";
    public const string SandboxProfiles = "sandbox/profiles.yaml";
    public const string SandboxImages = "sandbox/images.yaml";
    public const string Limits = "limits.yaml";

    public static IReadOnlyList<(string Path, string Schema)> All { get; } =
    [
        (Grading, "grading"),
        (Rubric, "rubric"),
        (Tags, "tags"),
        (Ranks, "ranks"),
        (Progression, "progression"),
        (SandboxProfiles, "sandbox-profiles"),
        (SandboxImages, "sandbox-images"),
        (Limits, "limits"),
        ("ui/behaviour.json", "ui-behaviour"),
        ("ui/languages.json", "ui-languages"),
        ("ui/locale.json", "ui-locale"),
        ("copy/en/ui.json", "copy"),
        ("copy/en/nav.json", "copy"),
        ("copy/en/states.json", "copy"),
        ("copy/en/library.json", "copy"),
        ("copy/en/workspace.json", "copy"),
        ("copy/en/weakness.json", "copy"),
        ("copy/en/boss.json", "copy"),
        ("copy/en/history.json", "copy"),
        ("copy/en/ranks.json", "copy"),
        ("copy/en/settings.json", "copy"),
        ("copy/en/profile.json", "copy"),
        ("copy/en/pseudo.json", "copy"),
    ];
}
