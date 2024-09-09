const socket = io();

/*let user;
socket.on('b.user', (bNewUser) => {
  user = bNewUser;
})*/

let users;
socket.on('b.users', (bUsers) => {
  users = bUsers;
})

