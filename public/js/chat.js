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
            author: user,
            content: content
        }
        //displayMessage(message); // Display your own message  
        messageInput.value = ''; // Clear the input field

        socket.emit('f.message', message);
    }
}

socket.on('b.message', (message) => {
    if(/*message.author.id != user.id*/true)
    {
        displayMessage(message)
    }
})


// Function to display a message
function displayMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.innerHTML = `<strong>${message.author.name}:</strong> ${message.content}`;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the latest message
}
