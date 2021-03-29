const mongoose = require('mongoose')

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
    default: 'single',
    min: 5,
    max: 255
  },
  bracket: {
    type: Object,
    required: true,
    default: {}
  },
  creator: {
    //the user ID of the tournament creator
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'users'
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
  },
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'messages'
    }
  ],

  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    }
  ],
  limit: {
    type: Number,
    max: 256, //maximum is a team tournament of 16 teams with 16 players
    min: 4, //minimun is a 4 user tournament
    required: true
  },
  teams: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'teams'
    }
  ],
  teamsSize: {
    type: Number,
    required: false
  },
  inviteCode: {
    type: String,
    required: false
  },
  inviteCodeExpiryDate: {
    type: Date,
    required: false
  }
})

module.exports = mongoose.model('tournaments', TournamentSchema)
