const mongoose = require('mongoose')
const Message = require('./models/Message.js')

exports.createConnection = (server) => {
  const io = require('socket.io')(server)
  io.on('connection', (socket) => {
    console.log('User connected')
  })

  const connection = mongoose.connection
  connection.once('open', () => {
    const messagesChangeStream = connection.collection('messages').watch()

    messagesChangeStream.on('change', async (change) => {
      switch (change.operationType) {
        case 'insert':
          const message = await Message.findById(
            change.fullDocument._id
          ).populate({ path: 'user', model: 'users', select: '-__v -password' })
          if (message.team) {
            io.emit(`messageTeam:${message.team}`, message)
            break
          }
          io.emit('newMessage', message)
          break

        case 'delete':
          io.emit('deletedMessage', change.documentKey._id)
          break
      }
    })
  })
}
