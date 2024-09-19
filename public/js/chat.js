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


// Function to display a message
function DisplayMessage(message) {

    console.log("message " + message.authorId + " " + message.system + " " + message.content);

    let author = users[message.authorId];

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');


    if(!author){
        messageElement.classList.add('authorless');
    }
    if(message.system){
        messageElement.classList.add('system');
    }

    if(!message.system && author)
    {
        //icon
        const playerIcon = StateIconOfPlayer(author);
        playerIcon.classList.add('message-icon');
    
        //username
        const authorName = document.createElement('strong');
        authorName.textContent = `${author.name}: `;
        authorName.classList.add('author-name');

        messageElement.appendChild(playerIcon);
        messageElement.appendChild(authorName);
    }

    if(message.system)
    {
        const messageContent = document.createElement('strong');
        messageContent.textContent = message.content;
        messageElement.appendChild(messageContent);
    }
    else
    {
        const messageContent = document.createElement('span');
        messageContent.textContent = message.content;
        messageElement.appendChild(messageContent);
    }


    if(!message.system && author)
    {
        messageElement.style.color = author.color;
    }

    if(message.system && author)
    {
        //border
        messageElement.style.backgroundColor = author.color;
        messageElement.style.color = 'white';
    }
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the latest message
}




function UpdateMessagestSentTo()
{
    let textResult;
    if(thisUser.guessed && gameState == "inProgress")
    {
        textResult = "Messages visible to people who are drawing or have guessed the word"
    } else if(thisUser.drawing && gameState == "inProgress")
    {
        textResult = "Messages visible to people who have guessed the word"
    } else { //guessing or game not in progress
        textResult = "Messages visible to everyone"
    }
    messagesSentToElement.textContent = textResult;
}