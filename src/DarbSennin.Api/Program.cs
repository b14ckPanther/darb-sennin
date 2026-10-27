using DarbSennin.Infrastructure.Configuration;

// API host. Endpoints arrive in Phase 9; the approved prototype came first (CLAUDE.md 1.8).
var builder = WebApplication.CreateBuilder(args);

// Every rule, limit and rank comes from config/ and is checked before the host accepts a request.
var configPath = builder.Configuration["SENNIN_CONFIG_PATH"]
    ?? throw new InvalidOperationException("SENNIN_CONFIG_PATH is not set; see .env.example.");
builder.Services.AddSenninConfig(configPath);

var app = builder.Build();
await app.RunAsync();

/// <summary>Entry point type, visible to WebApplicationFactory in the API tests.</summary>
public partial class Program;
