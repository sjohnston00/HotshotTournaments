const mongoose = require('mongoose')

const TeamSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    min: 3,
    max: 50
  },
  tournament: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'tournament'
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
  teamLeader: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'teamLeader'
  },
  limit: {
    type: Number,
    required: true
  }
})

module.exports = mongoose.model('teams', TeamSchema)
