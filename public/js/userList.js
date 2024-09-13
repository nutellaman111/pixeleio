let users;
let thisUser;
const playersDiv = document.getElementById('players');
socket.on('b.users', (bUsers) => {
  users = bUsers;
  thisUser = users[socket.id];
  RenderUserList();
  UpdateMessagestSentTo();
  UpdateRerollBlock();
})

function RenderUserList()
{
    // Clear existing content
    playersDiv.innerHTML = '';

    const userIds = Object.keys(users);
  
  
    // Loop through players array and create player elements
    userIds.forEach(userId => {
  
        const player = users[userId];
        // Create a container for each player
        const playerDiv = document.createElement('div');
        playerDiv.classList.add('player');
        playerDiv.style.backgroundColor = player.color;
  
        // Create player icon/*

        const playerIcon = StateIconOfPlayer(player);
        playerIcon.classList.add('player-icon');
  
        // Create player name
        const playerName = document.createElement('span');
        playerName.textContent = player.name;
        playerName.classList.add('player-name');
  
        // Create player score
        const playerScore = document.createElement('span');
        playerScore.textContent = `Score: ${10}`;
        playerScore.classList.add('player-score');
  
        // Append elements to playerDiv
        playerDiv.appendChild(playerIcon);
        playerDiv.appendChild(playerName);
        //playerDiv.appendChild(playerScore);
  
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
    playerIcon.classList.add('fa-solid', 'fa-circle-question');
  }

  return playerIcon;
}
