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


//my stuff!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!! 

const x = 14; // Change this to the desired number of rows
const y = 14; // Chan ge this to the desired number of columns

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
  color: '#000000',
}
systemUser.name = '[system]'

io.on('connection', (socket) => {
  console.log('a user connected');

  //someone submitted their username and 
  socket.on('f.user', (fUser) => {
    users[socket.id] = {
        id: socket.id,
        name: fUser.name,
        color: fUser.color,
        x: 0,
        y: 0
    };
    //send the full canvas to the new player
    socket.emit('b.users', users)
    socket.emit('b.canvas', squares);

    //send the player list to the player
    OnPlayersChange()
  })
  console.log("hiii");

  socket.on('f.square', (fSquare) => {
    let square = squares[fSquare.x][fSquare.y];
    if(square.ownerId == socket.id)
    {
      square.on = fSquare.on;
      io.emit('b.square', square);
    }
    else
    {
      socket.emit('b.square', square);
    }
  });
//
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
  console.log("!! users " + users)  
  console.log("!! users is " + (users? true : false))  
  io.emit('b.users', users)
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
