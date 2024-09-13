// Capture DOM elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const messagesContainer = document.getElementById('messages');
const messagesSentToElement = document.getElementById('sentTo');

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

    
    if (author) {
        //icon
        const playerIcon = StateIconOfPlayer(author);
        playerIcon.classList.add('message-icon');
    
        //username
        const authorName = document.createElement('strong');
        authorName.textContent = `${author.name}: `;
        authorName.classList.add('author-name');
    
        //content
        const messageContent = document.createElement('span');
        messageContent.textContent = message.content;
    
        // append all
        messageElement.style.color = author.color;
        messageElement.appendChild(playerIcon);
        messageElement.appendChild(authorName);
        messageElement.appendChild(messageContent);
    } else {
        //content
        const messageContent = document.createElement('strong');
        messageContent.textContent = message.content;
    
        //append all
        messageElement.classList.add('message-no-author');
        messageElement.appendChild(messageContent);
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the latest message
}




function UpdateMessagestSentTo()
{
    let textResult;
    if(thisUser.guessed)
    {
        textResult = "Messages visible to people who are drawing or have guessed the word"
    } else if(thisUser.drawing)
    {
        textResult = "Messages visible to people who have guessed the word"
    } else { //guessing
        textResult = "Messages visible to everyone"
    }
    messagesSentToElement.textContent = textResult;
}