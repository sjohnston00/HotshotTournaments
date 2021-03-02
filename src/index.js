//@ts-check
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

//Testing Heroku deploy
//MIDDLEWARES
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

//IMPORT THE ROUTERS
const tournamentsRouter = require("./routes/tournaments");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
const teamsRouter = require("./routes/teams");
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/teams", teamsRouter);

//BASIC ROUTE
app.get("/", (req, res) => {
  res.json({
    message:
      "Welcome to tournaments API please refer to documentation to learn about the different endpoints"
  });
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
