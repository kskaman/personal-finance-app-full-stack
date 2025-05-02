import { createClient } from "redis";

export default (() => {
  const client = createClient({
    url: process.env.REDIS_URL, // e.g. redis://redis:6379
    socket: { connectTimeout: 10000 }, // 10-second handshake window
  });

  // retry forever with exponential back-off
  client.on("error", (err) => console.error("Redis error", err));
  client.on("reconnecting", (d) =>
    console.log(`Redis reconnect in ${d.delay} ms, attempt ${d.attempt}`)
  );

  // Start connection but don’t crash on failure
  (async () => {
    let connected = false;
    while (!connected) {
      try {
        await client.connect();
        connected = true;
        console.log("Redis connected");
      } catch (e) {
        console.warn("Redis connect failed, retrying in 2 s");
        await new Promise((r) => setTimeout(r, 2000));
      }
    }
  })();

  return client;
})();
