const {NewUser} = require('./js/newUser.js');


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


const x = 10; // Change this to the desired number of rows
const y = 10; // Change this to the desired number of columns

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
  name: 'system'
}
systemUser.name = '[system]'

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('b.canvas', squares);

  socket.on('f.user', (fUser) => {
    users[socket.id] = {
        id: socket.id,
        name: fUser.name
    };
  })
  console.log("hiii");

  socket.on('f.square', (fSquare) => {
    squares[fSquare.x][fSquare.y].on = fSquare.on;
    io.emit('b.square', squares[fSquare.x][fSquare.y]);
  });

  socket.on('f.message', (message) => {
    message.author = users[socket.id];
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
    }
  })
}); 



server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log("server farting");

