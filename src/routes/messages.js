const express = require("express");
const router = express.Router();
const Tournament = require("../models/Tournament");
const Message = require("../models/Message");
const { ensureAuthenticated } = require("../config/auth");
const controller = require("../controllers/messagesController");

//GET ALL MESSAGES
//TODO: remove access to every user
router.get("/", ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("tournament", "-__v", "tournaments")
      .populate("user", "-_id -__v -pasword", "users");
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

//Post a new message to a tournament
router.post(
  "/tournament/:tournamentID",
  ensureAuthenticated,
  async (req, res) => {
    const { tournamentID } = req.params;
    const message = new Message({
      user: req.user._id,
      isAnnouncement: req.body.isAnnouncement,
      createdAt: new Date(),
      tournament: tournamentID,
      name: req.user.name,
      body: req.body.message
    });

    try {
      const savedMessage = await message.save();
      await Tournament.updateOne(
        { _id: tournamentID },
        { $push: { messages: savedMessage._id } }
      );
      return res.json({ success: true, message: "message successfully added" });
    } catch (error) {
      console.log(error.message);
      req.flash("error_msg", "Something went wrong, please try again later");
      return res.redirect(`/tournaments/${tournamentID}`);
    }
  }
);

//A users messages
router.get("/myMessages", ensureAuthenticated, async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id });
    res.status(200).send(messages);
  } catch (error) {
    res.status(500).send(error);
  }
});

//update message
router.put("/:messageId", ensureAuthenticated, async (req, res) => {
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

router.delete("/:messagedId", ensureAuthenticated, async (req, res) => {
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
