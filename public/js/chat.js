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
        // Create and style the icon
        const playerIcon = document.createElement('img');
        playerIcon.classList.add('message-icon');
        playerIcon.src = StateIconOfPlayer(author);
        playerIcon.style.filter = colorToFilter(author.color);
        // Create the strong element for the author's name
        const authorName = document.createElement('strong');
        authorName.textContent = `${author.name}: `;
        authorName.style.color = author.color;
        authorName.style.marginRight = "3px";

        // Create the message content element
        const messageContent = document.createElement('span');
        messageContent.textContent = message.content;
        messageContent.style.color = author.color;

        // Create a container for the message and icon
        const contentContainer = document.createElement('div');
        contentContainer.style.display = 'flex';
        contentContainer.style.alignItems = 'center';

        // Append the icon and content to the container
        contentContainer.appendChild(playerIcon);
        contentContainer.appendChild(authorName);
        contentContainer.appendChild(messageContent);

        // Append the container to the message element
        messageElement.appendChild(contentContainer);
    } else {
        const messageContent = document.createElement('strong');
        messageContent.textContent = message.content;
        messageContent.style.color = 'black';
        messageContent.style.textAlign = 'center';
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