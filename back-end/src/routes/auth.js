const express = require("express");
const router = express.Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  //VALIDATE BODY
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(401).send("Name, Email and Password are required");
  }

  //VALIDATE USER HAS EMAIL
  const userWithEmail = await User.findOne({ email: email });
  if (userWithEmail) {
    return res.status(401).send(`User with email: ${email} already exists`);
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  try {
    const user = new User({
      name: name,
      email: email,
      password: hashedPassword
    });

    const savedUser = await user.save();

    res.status(201).send(savedUser);
  } catch (error) {
    res.status(500).send({ "Error Message": error });
  }
});

router.post("/login", async (req, res) => {
  //VALIDATE BODY
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(401).send("Email and Password are required");
  }
  //MAKE SURE THE EMAIL IN THE BODY IS THE SAME AS ONE IN THE DATABASE
  //COMPARE THE HASHED PASSWORD IN THE DATABASE TO THE PASSWORD IN THE BODY USING BCRYPT
  const userWithEmail = await User.findOne({ email: email });
  if (!userWithEmail) {
    return res.status(401).send("Invalid Login Credentials");
  }
  const validPassword = await bcrypt.compare(password, userWithEmail.password);
  if (!validPassword) {
    return res.status(401).send("Invalid Login Credentials");
  }

  //CREATE A JSON WEB TOKEN FOR THE USER
  const token = jwt.sign({ _id: userWithEmail._id }, process.env.JWT_SECRET);

  res.status(200).send({
    message: "Login successful",
    token: token
  });
});

module.exports = router;
