using DarbSennin.ContentCli;

// sennin-content: validate content and import it into MongoDB (docs/PLAN.md Phase 4).
using var cancel = new CancellationTokenSource();
Console.CancelKeyPress += (_, e) =>
{
    e.Cancel = true;
    cancel.Cancel();
};
return await Cli.RunAsync(args, Console.Out, Console.Error, cancel.Token);
