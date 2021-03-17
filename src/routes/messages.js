const express = require("express");
const router = express.Router();
const Message = require("../models/Message");
const { ensureAuthenticated } = require("../config/auth");
const controller = require("../controllers/messagesController");

//Post a new message to a tournament
router.post(
  "/tournament/:tournamentID",
  ensureAuthenticated,
  controller.post_message_to_tournament
);

//A users messages
router.get("/myMessages", ensureAuthenticated, controller.get_all_users_messages);

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
