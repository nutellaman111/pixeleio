const wordDisplay = document.getElementById('wordDisplay');

function DisplayWord(word)
{
    if((gameState === "roundEnding" || thisUser.guessed) && !thisUser.drawing) {
        // Add the underlined word display with no spaces
        wordDisplay.innerHTML = `"<span style="text-decoration: underline;">${word}</span>"`;
    }
    else {
        wordDisplay.textContent = `"${word}"`;
    }
}