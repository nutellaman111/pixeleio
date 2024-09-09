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

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.emit('b.canvas', squares);

  let newUser = NewUser(socket.id);
  socket.emit('b.user', newUser);

  socket.on('f.square', (fSquare) => {
    squares[fSquare.x][fSquare.y].on = fSquare.on;
    io.emit('b.square', squares[fSquare.x][fSquare.y]);
  });

  socket.on('f.message', (message) => {
    io.emit('b.message', message)
  })
}); 


server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

console.log("server farting");

