const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const { verifyToken } = require("../middlewares/verifyToken");

//GET ALL TOURNAMENTS
router.get("/", verifyToken, async (req, res) => {});

module.exports = router;
