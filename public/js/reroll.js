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
socket.on('b.rerollUsed', (bRerollUsed) => {
    rerollUsed = bRerollUsed;
    UpdateRerollBlock();
});

function UpdateRerollBlock()
{
    if(thisUser.drawing && !rerollUsed)
    {
        rerollCheckbox.checked = thisUser.reroll;
        rerollText.textContent = "Reroll: (" + GetUsersArray(users).filter(x => x.drawing && x.reroll).length + "/" +
        Math.ceil(GetUsersArray(users).filter(x => x.drawing).length * 0.75) + ")";
        rerollBlock.style.display = rerollBlockOriginalDisplayStyle;
    }
    else
    {
        rerollBlock.style.display = 'none';
    }
}

function GetUsersArray(users) {
    if(users)
    {
      // Get the keys (user IDs) from the users object
      const userIds = Object.keys(users);
      
      // Map over the user IDs to get the user objects
      return userIds.map(id => users[id]);
    }
    return [];
  
}