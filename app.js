const {DivideSquaresToPeople} = require('./utils.js');
{

const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)
const port = 3000
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})


//my stuff!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

const x = 12; // Change this to the desired number of rows
const y = 20; // Change this to the desired number of columns

// Initialize the 2D array
const squares = Array.from({ length: x }, (row, rowIndex) =>
  Array.from({ length: y }, (col, colIndex) => ({
    on: false,
    x: rowIndex,
    y: colIndex
  }))
);

const users = {};
const systemUser = {
  id: 0,
  name: 'system',
  color: '#000000'
}
systemUser.name = '[system]'

io.on('connection', (socket) => {
  console.log('a user connected');

  //someone submitted their username and 
  socket.on('f.user', (fUser) => {
    users[socket.id] = {
        id: socket.id,
        name: fUser.name,
        color: fUser.color
    };
    //send the full canvas to the new player
    socket.emit('b.users', users)
    socket.emit('b.canvas', squares);

    //send the player list to the player
    OnPlayersChange()
  })
  console.log("hiii");

  socket.on('f.square', (fSquare) => {
    squares[fSquare.x][fSquare.y].on = fSquare.on;
    io.emit('b.square', squares[fSquare.x][fSquare.y]);
  });

  socket.on('f.message', (message) => {
    io.emit('b.message', message)
  })

  socket.on('disconnect', (reason) => {
    if(users[socket.id])
    {
      const message = {
        author: systemUser,
        content: users[socket.id].name + " has left"
      }
      io.emit('b.message', message)
  
      delete users[socket.id];
      OnPlayersChange();
    }
  })
}); 

function OnPlayersChange()
{
  io.emit('b.users', users)
  for (const userId in users) {
    if (users.hasOwnProperty(userId)) {
        const user = users[userId];
        // Process the user object here
        console.log(user.name);
    }
  }
  
  if(users)
  {
    DivideSquaresToPeople(squares, users);
    io.emit('b.canvas-ownership', squares)
  }
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

}
