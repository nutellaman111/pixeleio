const rerollCheckbox = document.getElementById('rerollCheckbox');
const rerollText = document.getElementById('rerollText');
const rerollBlock = document.getElementById('rerollBlock');
const rerollBlockOriginalDisplayStyle = rerollBlock.style.display;

rerollCheckbox.addEventListener('change', () => {
    thisUser.reroll = rerollCheckbox.checked;
    UpdateRerollBlock();
    socket.emit('f.reroll', thisUser)
});

let rerollUsed = false;
function UpdateRerollUsed(bRerollUsed)
{
    rerollUsed = bRerollUsed;
    if(rerollUsed)
    {
        showNotification("Word Re-rolled");
        console.log("showing notification");
    }
}

function UpdateRerollBlock()
{
    if(thisUser.drawing && !rerollUsed && (gameState == "inProgress"))
    {
        rerollCheckbox.checked = thisUser.reroll;
        rerollText.textContent = "Reroll: (" + GetUsersArray().filter(x => x.drawing && x.reroll).length + "/" +
        Math.ceil(GetUsersArray().filter(x => x.drawing).length * 0.75) + ")";
        rerollBlock.style.display = rerollBlockOriginalDisplayStyle;
    }
    else
    {
        rerollBlock.style.display = 'none';
    }
}

