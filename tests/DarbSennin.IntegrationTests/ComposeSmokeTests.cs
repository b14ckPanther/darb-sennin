using Azure.Messaging.ServiceBus;
using MongoDB.Bson;
using MongoDB.Driver;

namespace DarbSennin.IntegrationTests;

/// <summary>
/// Phase 0 smoke: the local compose stack (deploy/compose/compose.yml) is up and reachable.
/// Requires: docker compose -f deploy/compose/compose.yml up -d
/// </summary>
[Trait("Category", "Integration")]
public sealed class ComposeSmokeTests
{
    [Fact]
    public async Task Mongo_IsReachable_AsReplicaSetPrimary()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = new MongoClient(LocalEnvironment.Require("SENNIN_MONGO_URI"));

        var hello = await client.GetDatabase("admin")
            .RunCommandAsync<BsonDocument>(new BsonDocument("hello", 1), cancellationToken: ct);

        hello["isWritablePrimary"].AsBoolean.ShouldBeTrue();
        hello.Contains("setName").ShouldBeTrue("transactions need a replica set (ARCHITECTURE.md 5)");
    }

    [Theory]
    [InlineData("SENNIN_QUEUE_JUDGE_JOBS")]
    [InlineData("SENNIN_QUEUE_JUDGE_RESULTS")]
    public async Task ServiceBusEmulator_RoundTripsMessage_OnQueue(string queueKey)
    {
        var ct = TestContext.Current.CancellationToken;
        var queue = LocalEnvironment.Require(queueKey);
        await using var client = new ServiceBusClient(LocalEnvironment.Require("SENNIN_SERVICEBUS_CONNECTION"));
        await using var sender = client.CreateSender(queue);
        await using var receiver = client.CreateReceiver(queue);
        var marker = Guid.NewGuid().ToString("N");

        await sender.SendMessageAsync(new ServiceBusMessage(marker), ct);
        var received = await receiver.ReceiveMessageAsync(TimeSpan.FromSeconds(30), ct);

        received.ShouldNotBeNull();
        received.Body.ToString().ShouldBe(marker);
        await receiver.CompleteMessageAsync(received, ct);
    }
}
