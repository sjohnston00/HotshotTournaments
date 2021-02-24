const mongoose = require("mongoose");

const TournamentSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 5,
    max: 255
  },
  description: {
    type: String,
    required: false,
    min: 5,
    max: 1024
  },
  game: {
    type: String,
    required: true,
    min: 5,
    max: 255
  },
  type: {
    type: String,
    required: true,
    default: "single",
    min: 5,
    max: 255
  },
  dateCreated: {
    type: Date,
    required: false,
    default: Date.now
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date,
    required: true
  }
  // discussionBoardID: {
  //   type: String,
  //   required: true,
  //   ref: "DiscussionBoards"
  // },
  // users: [
  //   {
  //     type: mongoose.Schema.Types.ObjectId,
  //     ref: "users"
  //   }
  // ]
});

module.exports = mongoose.model("tournaments", TournamentSchema);
