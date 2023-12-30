const { createClient } = require("redis");
const client = createClient();

client.on("connect", () => {
  console.log("Connected to Redis successfully");
});

client.on("error", (err) => {
  console.error("Redis connection error:", err);
});

client.on("end", () => {
  console.log("Connection to Redis ended");
});

module.exports = client;
