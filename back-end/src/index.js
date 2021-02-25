//@ts-check
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

//MIDDLEWARES
app.use(cors());
app.use(express.json());

//IMPORT THE ROUTERS
const tournamentsRouter = require("./routes/tournaments");
const authRouter = require("./routes/auth");
const usersRouter = require("./routes/users");
const messagesRouter = require("./routes/messages");
app.use("/api/tournaments", tournamentsRouter);
app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/messages", messagesRouter);

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
    console.log("Connected to cloud DB");
  }
);

//INITIALISE THE APP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App Started ===> Listening on port ${PORT}`);
});
