const express = require("express");
const router = express.Router();
const User = require("../models/User");

//TODO: Delete in production
router.get("/deleteAllUsers", async (req, res) => {
  try {
    const deletedUsers = await User.deleteMany({});
    res.send(deletedUsers);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.post("/login", (req, res) => {});

module.exports = router;
