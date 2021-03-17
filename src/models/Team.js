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
  users: [
    {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: 'users'
    }
  ]
})

module.exports = mongoose.model('teams', TeamSchema)
