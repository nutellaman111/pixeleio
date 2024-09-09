const socket = io();


let user;
socket.on('b.user', (bNewUser) => {
  user = bNewUser;
})

