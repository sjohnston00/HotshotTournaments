const handlers = require('../middlewares/handlers')
const Message = require('../models/Message')
const Tournament = require('../models/Tournament')

exports.post_message_to_tournament = async (req, res) => {
  const { tournamentID } = req.params
  const message = new Message({
    user: req.user._id,
    isAnnouncement: req.body.isAnnouncement,
    createdAt: new Date(),
    tournament: tournamentID,
    name: req.user.name,
    body: req.body.message
  })

  try {
    const savedMessage = await message.save()
    await Tournament.updateOne(
      { _id: tournamentID },
      { $push: { messages: savedMessage._id } }
    )
    return res.json({ success: true, message: 'message successfully added' })
  } catch (error) {
    return handlers.response_handler(
      `/tournaments/${tournamentID}`,
      'error_msg',
      'Something went wrong, please try again later',
      req,
      res,
      error.message
    )
  }
}

exports.get_all_users_messages = async (req, res) => {
  try {
    const messages = await Message.find({ user: req.user._id })
    res.status(200).send(messages)
  } catch (error) {
    res.status(500).send(error)
  }
}
