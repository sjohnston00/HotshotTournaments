const mongoose = require("mongoose");
const MessageSchema = mongoose.Schema({
  body: {
    type: String,
    required: true,
    min: 1,
    max: 255
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user"
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "tournament"
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: "team"
  },
  isAnnouncement: {
    type: Boolean,
    required: false,
    default: false
  },
  createdAt: {
    type: Date,
    required: true
  }
});

module.exports = mongoose.model("messages", MessageSchema);
