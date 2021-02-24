const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const { verifyToken } = require("../middlewares/verifyToken");

//GET ALL MESSAGES
router.get("/", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find();
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

//ALL MESSAGES FROM A TOURNAMENT
router.get("/:tournamentID", verifyToken, async (req, res) => {
  const { tournamentID } = req.params;
  if (!tournamentID) {
    res.status(404).send("Not Found");
  }
  try {
    const messages = await Message.find({
      tournament: tournamentID
    }).populate("tournament");
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

//Post a new message to a tournament
router.post("/tournament/:tournamentID", verifyToken, async (req, res) => {
  const { body, isAnnouncement } = req.body;
  if (!body) {
    res.status(401).send("Message body and Announcement are required");
  }

  const { tournamentID } = req.params;
  if (!tournamentID) {
    res.status(404).send("Not Found");
  }

  //VALIDATE THE USER IS PART OF THE TOURNAMENT
  let tournament;
  try {
    tournament = await Tournament.findOne({ _id: tournamentID });
    if (!tournament.users.includes(req.user._id)) {
      return res.status(401).send("this user is not a part of this tournament");
    }
  } catch (error) {
    return res.status(500).send(error);
  }

  //ONCE EVERYTHING IS VALIDATED CONSTRUCT THE MESSAGE OBJECT
  const message = new Message({
    body: body,
    isAnnouncement: isAnnouncement,
    user: req.user._id,
    tournament: tournamentID
  });

  try {
    //SAVE THE MESSAGE
    const newMessage = await message.save();
    //ADD THE NEW MESSAGE TO THE TOURNAMENT
    tournament.messages.push(newMessage._id);
    await tournament.save();
    res.status(200).send(tournament);
  } catch (error) {
    res.status(500).send(error);
  }
});

//A users messages
router.get("/myMessages", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id });
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

//update message
router.get("/:messageId", verifyToken, async (req, res) => {
  const { messageId } = req.params;
  if (!messageId) {
    res.status(404).send("Not Found");
  }
  try {
    const messages = await Message.find({ user: req.user._id });
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
