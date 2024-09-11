{
    const username = document.getElementById('usernameInput');
    const roomInput = document.getElementById('roomInput');
    const gameContainer = document.getElementById('gameContainer')
    const usernameOverlay = document.getElementById('usernameOverlay')
    const gameDisplayType = gameContainer.style.display;
    const grid = document.getElementById('grid')

    const colorPicker = document.getElementById('colorPicker');
    const maxAllowedColorLuminance = 60;
    colorPicker.value = hslToHex(getRandomHslColor(maxAllowedColorLuminance))
    username.style.color = colorPicker.value;

    colorPicker.addEventListener('input', (event) => {
        const color = event.target.value;
        const hsl = hexToHsl(color);
        const adjustedColor = adjustLuminance(hsl, 0, maxAllowedColorLuminance);
        colorPicker.value = hslToHex(adjustedColor);
        username.style.color = colorPicker.value;
    });

    document.getElementById('submitUsername').addEventListener('click', function() {
        usernameSubmit();
    });

    username.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            usernameSubmit();
        }
    });

    function usernameSubmit()
    {
        if (username.value && roomInput.value) {
            localStorage.setItem('username', username.value); // Save username to localStorage
            usernameOverlay.style.display = 'none'; // Hide overlay
            gameContainer.style.display = gameDisplayType;

            const newUser = {
                name: username.value,
                color: colorPicker.value
            };

            document.documentElement.style.setProperty('--userColor', newUser.color);
            roomCode = roomInput.value;
 
            socket.emit('f.user', {newUser,roomCode});
        } else {
            alert('Please enter things');
        }
    }

    // Display game content and hide overlay if username already exists
    window.onload = function() {
        
        if(false) //debug
        {
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            const name = alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)];

            username.value = name;

            const colorPicker = document.getElementById('colorPicker');
            const maxAllowedColorLuminance = 60;
            colorPicker.value = hslToHex(getRandomHslColor(maxAllowedColorLuminance))

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
}