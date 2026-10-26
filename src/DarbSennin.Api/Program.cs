// API host. Endpoints arrive in Phase 9; the approved prototype comes first (CLAUDE.md 1.8).
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();
await app.RunAsync();
