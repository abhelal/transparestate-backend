const { Server } = require("socket.io");

let io;

function initialize(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.PORTAL],
      credentials: true,
    },
  });

  if (io) {
    console.log("Socket service initialized");
  } else console.error("Socket is not initialized");

  io.on("connection", (socket) => {
    console.log("New connection", socket.id);
    socket.on("disconnect", () => {
      console.log("User disconnected", socket.id);
    });
  });
}

function emitMessage(message) {
  if (io) io.emit("newMessage", message);
}

module.exports = {
  initialize,
  emitMessage,
};
