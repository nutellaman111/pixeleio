const username = document.getElementById('usernameInput');
const gameContainer = document.getElementById('gameContainer')
const usernameOverlay = document.getElementById('usernameOverlay')
const gameDisplay = gameContainer.style.display;
const debug = true;

document.getElementById('submitUsername').addEventListener('click', function() {
    usernameSubmit();
});

function usernameSubmit()
{
    if (username.value) {
        localStorage.setItem('username', username.value); // Save username to localStorage
        usernameOverlay.style.display = 'none'; // Hide overlay
        gameContainer.style.display = gameDisplay;

        const newUser = {
            name: username.value
        };
        
        socket.emit('f.user', newUser);
    } else {
        alert('Please enter a username.');
    }
}

// Display game content and hide overlay if username already exists
window.onload = function() {
    
    if(debug)
    {
        username.value = "debug guy";
        usernameSubmit();
    }
    else
    {
        if (localStorage.getItem('username')) {
            username.value = localStorage.getItem('username')
        }
    
        document.getElementById('usernameOverlay').style.display = 'flex';
        gameContainer.style.display = 'none';  
    }
  
};