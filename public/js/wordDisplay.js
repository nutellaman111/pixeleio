const wordDisplay = document.getElementById('wordDisplay');

socket.on('b.word', (word) => {
    wordDisplay.textContent = `"${word}"`;
});
