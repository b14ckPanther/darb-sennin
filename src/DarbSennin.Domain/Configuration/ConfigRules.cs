namespace DarbSennin.Domain.Configuration;

/// <summary>Rules that span more than one value and that a JSON Schema cannot state.</summary>
public static class ConfigRules
{
    public static IEnumerable<string> Check(RanksConfig ranks)
    {
        if (ranks.Ranks.Count > 0 && ranks.Ranks[0].Threshold != 0)
        {
            yield return $"the first rank '{ranks.Ranks[0].Id}' must start at 0 points";
        }

        for (var i = 1; i < ranks.Ranks.Count; i++)
        {
            if (ranks.Ranks[i].Threshold <= ranks.Ranks[i - 1].Threshold)
            {
                yield return $"rank thresholds must rise: '{ranks.Ranks[i].Id}' is not above '{ranks.Ranks[i - 1].Id}'";
            }
        }

        foreach (var id in Duplicates(ranks.Ranks.Select(r => r.Id)))
        {
            yield return $"rank id '{id}' is used twice";
        }
    }

    public static IEnumerable<string> Check(RubricConfig rubric, GradingConfig grading)
    {
        if (!rubric.Severities.Contains(rubric.PraiseGate.MaxSeverity))
        {
            yield return $"praise gate severity '{rubric.PraiseGate.MaxSeverity}' is not one of the rubric severities";
        }

        foreach (var severity in rubric.Severities.Where(s => !grading.SeverityWeights.ContainsKey(s)))
        {
            yield return $"severity '{severity}' has no weight in grading.yaml";
        }

        foreach (var criterion in rubric.Criteria)
        {
            foreach (var kind in criterion.RequiredEvidence.Where(k => !rubric.EvidenceKinds.Contains(k)))
            {
                yield return $"criterion '{criterion.Id}' requires unknown evidence kind '{kind}'";
            }
        }
    }

    public static IEnumerable<string> Check(TagsConfig tags) =>
        Duplicates(tags.Tags.Select(t => t.Id)).Select(id => $"tag '{id}' is defined twice");

    public static IEnumerable<string> Check(SandboxProfilesConfig profiles) =>
        Duplicates(profiles.Profiles.Select(p => p.Id)).Select(id => $"sandbox profile '{id}' is defined twice");

    public static IEnumerable<string> Check(SandboxImagesConfig images) =>
        Duplicates(images.Images.Select(i => i.Language)).Select(l => $"language '{l}' has more than one image");

    private static IEnumerable<string> Duplicates(IEnumerable<string> values) =>
        values.GroupBy(v => v, StringComparer.Ordinal).Where(g => g.Skip(1).Any()).Select(g => g.Key);
}
