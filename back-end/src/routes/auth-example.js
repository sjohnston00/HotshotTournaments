const { Router } = require("express");
const User = require("../models/User");
const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  //VALIDATE DATA BEFORE WE SEND USER
  const { error } = registerValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //MAKE SURE A USER WITH THE SAME EMAIL DOESN'T ALREADY EXIST
  const userWithEmail = await User.findOne({ email: req.body.email });
  if (userWithEmail) {
    return res.status(401).send("Email already exists");
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    name: req.body.name,
    email: req.body.email,
    password: hashedPassword
  });

  //SAVED THE NEW USER TO THE DATABASE
  try {
    const savedUser = await user.save();
    const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
    res.status(201).send({
      user_id: savedUser._id,
      token: token
    });
  } catch (error) {
    res.status(400).send(`Error creating the user ${error}`);
  }
});

router.post("/login", async (req, res) => {
  //VALIDATE DATA BEFORE WE SEND USER
  const { error } = loginValidation(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  //MAKE SURE THE EMAIL IN THE BODY IS THE SAME AS ONE IN THE DATABASE
  //COMPARE THE HASHED PASSWORD IN THE DATABASE TO THE PASSWORD IN THE BODY USING BCRYPT
  const userWithEmail = await User.findOne({ email: req.body.email });
  const validPassword = await bcrypt.compare(
    req.body.password,
    userWithEmail.password
  );
  if (!userWithEmail || !validPassword) {
    return res.status(401).send("Invalid Login Credentials");
  }

  //CREATE A JSON WEB TOKEN FOR THE USER
  const token = jwt.sign({ _id: userWithEmail._id }, process.env.JWT_SECRET);

  res.send({
    user_id: userWithEmail._id,
    token: token
  });
});
module.exports = router;
