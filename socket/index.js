const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const client = require("../config/redis");
const cookieParser = require("cookie");
const Message = require("../models/MessageModel");
const Conversation = require("../models/ConversationModel");
const User = require("../models/userModel");
const { USER_ROLES } = require("../constants");

let io;
let onlineUsers = {};

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

  io.use(async (socket, next) => {
    try {
      const request = socket.request;
      const cookies = request.headers.cookie;
      const parsedCookies = cookieParser.parse(cookies);
      const accessToken = parsedCookies.accessToken;
      if (accessToken) {
        const secret = process.env.JWT_SECRET;
        const user = jwt.verify(accessToken, secret);
        const isValid = (await client.GET(`accessToken:${accessToken}`)) === user.userId.toString();
        if (user && isValid) {
          socket.userId = user.userId;
          socket.user = user;
        }
      }
      next();
    } catch (error) {
      console.log(error);
    }
  });

  io.on("connection", async (socket) => {
    console.log("Socket user", socket.userId ? socket.userId : socket.id, "connected");
    onlineUsers[socket.userId] = socket.id;

    socket.on("disconnect", () => {
      console.log("Socket user", socket.userId ? socket.userId : socket.id, "disconnected");
      delete onlineUsers[socket.userId];
    });

    if (!socket.userId) return;

    const connectedUser = await User.findById(socket.user.id);

    if (
      connectedUser.role === USER_ROLES.CLIENT ||
      connectedUser.role === USER_ROLES.MANAGER ||
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
          sender,
          senderId: socket.userId,
          senderRole: socket.user.role,
          text,
          image,
          file,
        });
        conversation.messages.push(message._id);
        await conversation.save();
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

module.exports = {
  initialize,
  emitMessage,
};
