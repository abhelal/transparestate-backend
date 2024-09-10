const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { createServer } = require("node:http");

const app = express();
const server = createServer(app);
dotenv.config();

app.use(helmet.noSniff());
app.use(helmet.frameguard());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

let corsOptions = {
  origin: [process.env.PORTAL, process.env.PORTAL_WWW],
  credentials: true,
};

app.use(cors(corsOptions));

const socket = require("./socket");
const client = require("./config/redis");
const connection = require("./config/mongoose");
const apiRoutes = require("./routes");
const errorHandlers = require("./handlers/errorHandlers");
const { createSuperAdmin } = require("./utils/seeder");

app.use("/api", apiRoutes);

app.use(errorHandlers.notFound);
app.use(errorHandlers.productionErrors);

const initializeApplication = async () => {
  app.set("port", process.env.PORT || 8888);
  socket.initialize(server);

  await client.connect();
  server.listen(app.get("port"), () => {
    console.log(`Application running → On PORT : ${server.address().port}`);
  });

  connection.once("open", async () => {
    console.log("MongoDB database connection established successfully");
    await createSuperAdmin();
  });

  connection.on("error", (err) => {
    console.log("MongoDB connection error. Please make sure MongoDB is running." + err);
    process.exit();
  });
};

initializeApplication();
