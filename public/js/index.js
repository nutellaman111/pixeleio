const socket = io();

/*let user;
socket.on('b.user', (bNewUser) => {
  user = bNewUser;
})*/

let users;
const playersDiv = document.getElementById('players');
socket.on('b.users', (bUsers) => {
  users = bUsers;

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
      const playerIcon = document.createElement('img');
      playerIcon.src = "player.icon";
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
      //playerDiv.appendChild(playerIcon);
      playerDiv.appendChild(playerName);
      //playerDiv.appendChild(playerScore);

      // Append playerDiv to the player list
      playersDiv.appendChild(playerDiv);
  });

})

