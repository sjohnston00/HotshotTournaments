const deployed = true
const connectionString = deployed
  ? 'https://hotshot-tournaments.herokuapp.com/'
  : 'http://localhost:8000'
const socket = io.connect(connectionString)

const form = document.querySelector('#send-message-form')
const message = document.querySelector('#input-message')
const tournamentID = document.querySelector('#tournamentID').textContent

socket.on('newMessage', (message) => {
  const messagesContainer = document.querySelector('#messages-container')

  messagesContainer.innerHTML =
    messagesContainer.innerHTML +
    /*html*/ `
  <div class="card mb-3">
    <div class="card-body">
      <h5 class="card-title">${message.user.name}</h5>
      <p class="card-title">${message.body}</p>
    </div>
  </div>
`
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  const messageValue = message.value
  fetch(`/messages/tournament/${tournamentID}`, {
    method: 'POST',
    headers: {
      // "Content-Type": "application/json" //for when the application only accepts JSON input
      'Content-Type': 'application/x-www-form-urlencoded' //for when the application only accepts form urlencoded input
    },
    //when using FORM - URLENCODED use the URLSearchParams class fort the body
    body: new URLSearchParams({
      message: messageValue
    })
  })

  //set the value of the message box back to empty
  document.querySelector('#input-message').value = ''
})

socket.on('deletedMessage', (messagedId) => {
  /**
   * the message has been deleted in the database so now find the message card by the
   * ID the remove it from the DOM, beware that this event will fire even when someone deletes a message in another tournament
   * so find the DOM element by its ID first, if its there remove it, else return out of this function
   */
})
