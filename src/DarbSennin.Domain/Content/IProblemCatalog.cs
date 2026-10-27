namespace DarbSennin.Domain.Content;

/// <summary>Public problem reads for the API. It returns only <see cref="PublicProblem"/>.</summary>
public interface IProblemCatalog
{
    Task<IReadOnlyList<PublicProblem>> ListAsync(CancellationToken cancellationToken);

    Task<PublicProblem?> GetAsync(string problemId, CancellationToken cancellationToken);
}
