const wordDisplay = document.getElementById('wordDisplay');
let languageDirection = 'ltr';

function UpdateLanguageDirection(bLanguageDirection)
{
    languageDirection = bLanguageDirection;
    wordDisplay.style.direction = languageDirection;
}

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