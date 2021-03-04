//@ts-check
const express = require("express");
const app = express();
const session = require("express-session");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const mustache = require("mustache-express");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const flash = require("connect-flash");
require("dotenv").config();

//MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.urlencoded({ limit: "10mb", extended: false }));
app.engine("mustache", mustache());
app.set("view engine", "mustache");
app.set("views", __dirname + "/views");

//IMPORT THE ROUTERS
const tournamentsRouter = require("./routes/tournaments");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const teamsRouter = require("./routes/teams");
app.use("/tournaments", tournamentsRouter);
app.use("/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);
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
app.listen(PORT, () => {
  console.log(`App Started ===> Listening on port ${PORT}`);
});