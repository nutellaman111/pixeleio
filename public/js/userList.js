let users;
let thisUser;
const playersDiv = document.getElementById('players');

function UpdateUsers(bUsers)
{
  users = bUsers;
  thisUser = users[socket.id];
}

function GetUsersArray() {
  if(users)
  {
    // Get the keys (user IDs) from the users object
    const userIds = Object.keys(users);
    
    // Map over the user IDs to get the user objects
    return userIds.map(id => users[id]);
  }
  return [];

}

function RenderUserList()
{
    // Clear existing content
    playersDiv.innerHTML = '';

    const guessingUsers = GetUsersArray().sort((a, b) => b.score - a.score);
  
    // Loop through players array and create player elements
    guessingUsers.forEach(player => {
  
        // Create a container for each player
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
  
        // Create player icon/*

        const playerIcon = StateIconOfPlayer(player);
        playerIcon.classList.add('player-icon');
  
        // Create player name
        const playerName = document.createElement('span');
        playerName.textContent = player.name;
        playerName.classList.add('player-name');
  
        // Create player score
        const playerScore = document.createElement('span');
        playerScore.textContent = `(${player.score})`;
        playerScore.classList.add('player-score');
  
        // Append elements to playerDiv
        playerDiv.appendChild(playerIcon);
        playerDiv.appendChild(playerName);
        playerDiv.appendChild(playerScore);

        if(player.guessed)
        {
          playerDiv.style.backgroundColor = player.color;
          playerDiv.style.color = "white";
        }
        else
        {
          playerDiv.style.backgroundColor = "white";
          playerDiv.style.color = player.color;
        }

        if(!player.drawing)
        {
          playerDiv.style.border = `2px solid ${player.color}`; // Add this line for the border
        }


  
        // Append playerDiv to the player list
        playersDiv.appendChild(playerDiv);
    });
}

function StateIconOfPlayer(player) {
  const playerIcon = document.createElement('i');

  if(player.guessed)
  {
    playerIcon.classList.add('fa-solid', 'fa-check');
  }
  else if(player.drawing)
  {
    playerIcon.classList.add('fa-solid', 'fa-paintbrush');
  }
  else
  {
    playerIcon.classList.add('fa-solid', 'fa-comment');
  }

  return playerIcon;
}
