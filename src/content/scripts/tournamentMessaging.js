const deployed = true //* This should be set to TRUE before deployment
const connectionString = deployed
  ? 'https://hotshot-tournaments.herokuapp.com/'
  : 'http://localhost:8000'
const socket = io.connect(connectionString)

const form = document.querySelector('#send-message-form')
const message = document.querySelector('#input-message')
const tournamentID = document.querySelector('#tournamentID').textContent
const messagesContainer = document.querySelector('#messages-container')

const addDeleteEvent = (buttons) => {
  let selectedButtonId // This is the same as the message ID
  for (let button of buttons) {
    button.addEventListener('click', () => {
      console.log(button.id)
      selectedButtonId = button.id
      fetch(`/messages/deleteMessage/${selectedButtonId}`, {
        method: 'DELETE',
        body: {
          messageId: selectedButtonId
        }
      })
    })
  }
}

const buttons = document.getElementsByClassName('delete-btn')
addDeleteEvent(buttons)

socket.on('newMessage', (message) => {
  messagesContainer.innerHTML =
    messagesContainer.innerHTML +
    /*html*/ `
  <div class="card mb-3">
    <div class="card-body">
    <div class="d-flex">
    <h5 class="card-title mr-auto">${message.user.name}</h5>
    <button type="button" class="btn text-white delete-btn" id="${message._id}"> 
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        fill="currentColor"
        class="bi bi-x"
        viewBox="0 0 16 16"
      >
        <path
          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
        />
      </svg>
    </button>
  </div>
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
  document.getElementById(`message-${messagedId}`).remove()
})
