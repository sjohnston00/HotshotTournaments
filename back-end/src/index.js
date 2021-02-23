const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

//IMPORT THE ROUTERS
const tournamentsRouter = require("./routes/tournaments");
app.use("/api/tournaments", tournamentsRouter);

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
  () => {
    console.log("Connected to cloud DB");
  }
);

//MIDDLEWARES
app.use(express.json());

//INITIALISE THE APP
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`App Started ===> Listening on port ${PORT}`);
});
