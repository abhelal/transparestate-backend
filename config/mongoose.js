const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI);

const connection = mongoose.connection;

connection.on("error", (error) => {
  console.error("MongoDB Connection error:", error);
});

connection.once("open", () => {
  console.log("Connected to MongoDB");
});

module.exports = connection;
