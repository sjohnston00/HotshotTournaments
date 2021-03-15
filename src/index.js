const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const mustache = require("mustache-express");
const passport = require("passport");
const flash = require("connect-flash");
const User = require("./models/User");
const Message = require("./models/Message");
require("dotenv").config();

//MIDDLEWARES
app.use(cors());
app.use(morgan("dev")); // For debugging which routes are being hit on the console
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.use(express.static("./src/content"));
app.set("views", __dirname + "/views");
// Passport Config
require("./config/passport")(passport);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
// Passport needs to be underneath the the express session
app.use(passport.initialize());
app.use(passport.session());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Using flash to have session variables and messages
app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  next();
});

//IMPORT THE ROUTERS
const tournamentsRouter = require("./routes/tournaments");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const teamsRouter = require("./routes/teams");
app.use("/tournaments", tournamentsRouter);
app.use("/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/messages", messagesRouter);
app.use("/api/teams", teamsRouter);

//BASIC ROUTE
app.get("/", (req, res) => {
  res.render("index");
});

//CONNECT TO DATABASE
mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  },
  (err) => {
    if (err) {
      return console.error(err);
    }
    console.log(
      `${new Date().toUTCString()}: Connected to MongoDB Atlas: Running on Mongoose version ${
        mongoose.version
      }`
    );
  }
);

//INITIALISE THE APP
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`App Started ===> Listening on port ${PORT}`);
});

const io = require("socket.io")(server);

io.on("connection", (socket) => {
  console.log("New user connected");
});

const connection = mongoose.connection;
connection.once("open", () => {
  const messagesChangeStream = connection.collection("messages").watch();

  messagesChangeStream.on("change", async (change) => {
    switch (change.operationType) {
      case "insert":
        const message = await Message.findById(
          change.fullDocument._id
        ).populate({ path: "user", model: "users", select: "-__v -password" });
        console.log(message);
        io.emit("newMessage", message);
        break;

      case "delete":
        console.log(
          `Deleted message: ${change.documentKey._id} from ${change.ns.db} collection ${change.ns.coll}`
        );
        io.emit("deletedMessage", change.documentKey._id);
        break;
    }
  });
});
