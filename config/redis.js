const { createClient } = require("redis");
const client = createClient();

// const client = createClient({
//   password: "EqIsn95oWxrJRy2UzFMg6GtOHrvr1ysn",
//   socket: {
//     host: "redis-14739.c274.us-east-1-3.ec2.cloud.redislabs.com",
//     port: 14739,
//   },
// });

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
