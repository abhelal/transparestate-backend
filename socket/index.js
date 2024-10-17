const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie");
const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const User = require("../models/userModel");
const { USER_ROLES } = require("../constants");

let io;
let onlineUsers = {};

function initialize(server) {
  io = new Server(server, {
    cors: {
      origin: [process.env.PORTAL, process.env.PORTAL_WWW],
      credentials: true,
    },
  });

  if (io) {
    console.log("Socket service initialized");
  } else console.error("Socket is not initialized");

  io.use(async (socket, next) => {
    try {
      const request = socket.request;
      const cookies = request.headers.cookie;
      if (!cookies) return next();
      const parsedCookies = cookieParser.parse(cookies);
      const accessToken = parsedCookies.accessToken;
      if (!accessToken) return next();
      const secret = process.env.JWT_SECRET;
      const user = jwt.verify(accessToken, secret);

      if (user) {
        socket.userId = user.userId;
        socket.user = user;
      }

      next();
    } catch (error) {
      console.log(error);
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket user", socket.userId ? socket.user.id : socket.id, "connected");

    socket.on("disconnect", () => {
      console.log("Socket user", socket.userId ? socket.user.id : socket.id, "disconnected");
      if (!socket.userId) return;
      delete onlineUsers[socket.user.id];
    });

    if (!socket.userId) return;
    onlineUsers[socket.user.id] = socket.id;

    const connectedUser = await User.findById(socket.user.id);
    if (!connectedUser) return;

    if (
      connectedUser.role === USER_ROLES.CLIENT ||
      connectedUser.role === USER_ROLES.MAINTAINER ||
      connectedUser.role === USER_ROLES.JANITOR
    ) {
      for (let property of connectedUser.properties) {
        socket.join(`property-room-${property}`);
      }
    }

    // send Message

    socket.on("sendMessage", async (data) => {
      try {
        const { conversationId, text, image, file } = data;
        if (!conversationId) return;
        if (!text && !image && !file) return;
        const sender = socket.user.id;
        if (!sender) return new Error("Not Authorised");
        const conversation = await Conversation.findOne({ conversationId });
        if (!conversation) return;
        const message = await Message.create({
          conversation: conversation._id,
          conversationId,
          sender,
          senderId: socket.userId,
          senderRole: socket.user.role,
          text,
          image,
          file,
        });
        conversation.messages.push(message._id);
        await conversation.save();
        io.to(onlineUsers[conversation.tenant]).to(`property-room-${conversation.property}`).emit("newMessage", message);
      } catch (error) {
        console.error("Error in sendNewMessage:", error);
      }
    });

    // Handle typing status
    socket.on("startTyping", (receiver) => {
      io.to(onlineUsers[receiver]).emit("typing", socket.userId, true);
    });
    socket.on("stopTyping", (receiver) => {
      io.to(onlineUsers[receiver]).emit("typing", socket.userId, false);
    });
  });
}

function emitMessage(message) {
  if (io) io.emit("newMessage", message);
}

function emitNotification(notification) {
  const receiver = notification.user.toString();
  if (io) io.to(onlineUsers[receiver]).emit("newNotification", notification);
}

module.exports = {
  initialize,
  emitMessage,
  emitNotification,
};
