{
    const username = document.getElementById('usernameInput');
    const gameContainer = document.getElementById('gameContainer')
    const usernameOverlay = document.getElementById('usernameOverlay')
    const gameDisplay = gameContainer.style.display;

    const colorPicker = document.getElementById('colorPicker');
    const maxAllowedColorLuminance = 40;
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
        if (username.value) {
            localStorage.setItem('username', username.value); // Save username to localStorage
            usernameOverlay.style.display = 'none'; // Hide overlay
            gameContainer.style.display = gameDisplay;

            const newUser = {
                name: username.value,
                color: colorPicker.value
            };
            
            socket.emit('f.user', newUser);
        } else {
            alert('Please enter a username.');
        }
    }

    // Display game content and hide overlay if username already exists
    window.onload = function() {
        
        if(true)
        {
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            const name = alphabet[Math.floor(Math.random() * alphabet.length)] + alphabet[Math.floor(Math.random() * alphabet.length)];

            username.value = name;
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