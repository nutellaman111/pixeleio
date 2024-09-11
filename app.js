const {DivideSquaresToPeople, GetUsersArray} = require('./utils.js');
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

const gameRooms = {};
io.on('connection', (socket) => {
  console.log('a user connected');

  //someone submitted their username and 
  socket.on('f.user', (data) => {
    const { newUser, roomCode } = data;
    if(gameRooms[roomCode])
    {
      gameRooms[roomCode].PlayerConnected(socket, newUser)
    }
    else
    {
      gameRooms[roomCode] = new GameRoom(socket, newUser, roomCode);
    }
  });

}); 

function EmitToUsersArray(usersToEmit, eventName, eventData)
{
  usersToEmit.forEach(user => {
    io.to(user.id).emit(eventName, eventData);
  });
}

function EmitToUserObject(usersToEmit, eventName, eventData)
{
  EmitToUsersArray(GetUsersArray(usersToEmit), eventName, eventData);
}


//my stuff!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!! 
class GameRoom {
  constructor(creatorSocket, fUser, roomCode)
  {
    this.roomCode = roomCode;

    const x = 10; // Change this to the desired number of rows
    const y = 10; // Chan ge this to the desired number of columns
    
    // Initialize the 2D array
    this.squares = Array.from({ length: x }, (row, rowIndex) =>
      Array.from({ length: y }, (col, colIndex) => ({
        on: false,
        x: rowIndex,
        y: colIndex
      }))
    );

    this.users = {};
    this.systemUser = {
      id: 0,
      name: '[system]',
      color: '#000000',
    }

    this.PlayerConnected(creatorSocket, fUser)
  }

  PlayerConnected(socket, fUser)
  {
    this.users[socket.id] = {
        id: socket.id,
        name: fUser.name,
        color: fUser.color,
        drawing: false,
        guessed: false,
        x: 0,
        y: 0
    };
    let currentUser = this.users[socket.id]

    //send the full canvas to the new player
    socket.emit('b.users', this.users)
    socket.emit('b.canvas', this.squares);

    //send the player list to the player
    this.OnPlayersChange()
  
    socket.on('f.square', (fSquare) => {
      let square = this.squares[fSquare.x][fSquare.y];
      if(square.ownerId == socket.id && this.users[socket.id].drawing)
      {
        square.on = fSquare.on;
        EmitToUserObject(this.users, 'b.square', square);
      }
      else
      {
        socket.emit('b.square', square);
      }
    });
    
    socket.on('f.message', (message) => {
      if(message.content[0]=='/')
      {
        this.HandleCommand(socket.id, message);
      }
      else
      {
        let sendTo;
        if(!currentUser.drawing)
        {
          if(currentUser.guessed)
          {
            sendTo = GetUsersArray(this.users).filter(x => x.guessed || x.drawing)
          }
          else
          {
            sendTo = GetUsersArray(this.users);
          }
        }
        else
        {
          sendTo = GetUsersArray(this.users).filter(x => x.guessed)
        }
        EmitToUsersArray(sendTo, 'b.message', message)
      }
    })
  
    socket.on('disconnect', (reason) => {
      if(this.users[socket.id])
      {
        const message = {
          author: this.systemUser,
          content: this.users[socket.id].name + " has left"
        }
        EmitToUserObject(this.users, 'b.message', message)
    
        delete this.users[socket.id];
        this.OnPlayersChange();
      }
    })
  }

  HandleCommand(socketId, message)
  {
    const content = message.content;
    if(content == '/draw')
    {
      this.users[socketId].drawing = true;
      this.OnPlayersChange();
    }
    if(content == '/guess')
    {
      this.users[socketId].drawing = false;
      this.OnPlayersChange();
    }
    else if(content == '/guessed')
    {
      this.users[socketId].guessed = true;
      this.OnPlayersChange();
    }
  }

  OnPlayersChange()
  {
    EmitToUserObject(this.users, 'b.users', this.users)

    const usersArr = GetUsersArray(this.users).filter(user => user.drawing);

    DivideSquaresToPeople(this.squares, usersArr);
    EmitToUserObject(this.users, 'b.canvas-ownership', this.squares)
  }
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

}
