// Capture DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages');

// Event listener for sending a message
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Function to send a message
function sendMessage() {

    const content =  messageInput.value.trim()
    if(content)
    {
        const message = {
            authorId: socket.id,
            content: content
        }
        messageInput.value = ''; // Clear the input field

        socket.emit('f.message', message);
    }
}

socket.on('b.message', (message) => {
    displayMessage(message)
})


// Function to display a message
function displayMessage(message) {

    let author = users[message.authorId];

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${author.name}:</strong> ${message.content}`;
    messageElement.style.color = author.color;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the latest message
}
