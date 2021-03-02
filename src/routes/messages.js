const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const { verifyToken } = require("../middlewares/verifyToken");

//GET ALL MESSAGES
//TODO: remove access to every user
router.get("/", verifyToken, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("tournament", "-__v", "tournaments")
      .populate("user", "-_id -__v -pasword", "users");
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//ALL MESSAGES FROM A TOURNAMENT
router.get("/tournament/:tournamentID", verifyToken, async (req, res) => {
  const { tournamentID } = req.params;
  if (!tournamentID) {
    res.status(404).send("Not Found");
  }
  try {
    const messages = await Message.find({
      tournament: tournamentID
    })
      .sort([["createdAt", -1]]) //FOUND THIS ON STACK OVERFLOW, BUT I HAVE NO IDEA HOW IT WORKS
      .populate("user", "-_id -__v -pasword", "users");
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error.message);
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
    tournament = await Tournament.findOne({
      _id: tournamentID
    });
    if (!tournament) {
      return res.status(404).send("Invalid Tournament ID");
    }
    if (!tournament.users.includes(req.user._id)) {
      return res
        .status(401)
        .send("Not allowed to send a message to this tournament");
    }
  } catch (error) {
    return res.status(500).send(error);
  }

  //ONCE EVERYTHING IS VALIDATED CONSTRUCT THE MESSAGE OBJECT
  const message = new Message({
    body: body,
    isAnnouncement: isAnnouncement,
    user: req.user._id,
    tournament: tournamentID,
    createdAt: new Date()
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
router.put("/:messageId", verifyToken, async (req, res) => {
  const { messageId } = req.params;
  const { body } = req.body;
  if (!body) {
    res.status(401).send("Message body and Announcement are required");
  }
  try {
    const updatedMessage = await Message.updateOne(
      { _id: messageId },
      {
        $set: {
          body: body,
          isAnnouncement: isAnnouncement
        }
      }
    );

    res.status(200).send(updatedMessage);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.delete("/:messagedId", verifyToken, async (req, res) => {
  const { messageId } = req.params;

  try {
    const checkUserId = await Message.findOne({
      _id: messageId,
      user: req.user._id
    });
    if (!checkUserId) {
      return res.status(401).send("Not your message to delete");
    }

    const deletedMessage = await Message.deleteOne({ _id: messageId });
    res.status(200).send({
      message: "Message has been deleted",
      deletedMessage: deletedMessage
    });
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
