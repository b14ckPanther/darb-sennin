// Judge worker host. The judge-jobs consumer arrives in Phase 5.
var builder = Host.CreateApplicationBuilder(args);
var host = builder.Build();
await host.RunAsync();
