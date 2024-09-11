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

    this.gridWidth = 12; // Change this to the desired number of rows
    this.gridHeight = 12; // Chan ge this to the desired number of columns
    
    this.users = {};
    this.systemUser = {
      id: 0,
      name: '[system]',
      color: '#000000',
    }
    this.words = require("./data/words.json");
    console.log(this.words);

    this.NewRound();
    this.PlayerConnected(creatorSocket, fUser);
  }

  NewRound()
  {
    this.ResetAndDivideBoard()
    this.SetRandomWord();
    EmitToUserObject(this.users, 'b.users', this.users)
    EmitToUserObject(this.users, 'b.canvas', this.squares);
    this.EmitWord();
  }

  SetRandomWord()
  {
    const randomIndex = Math.floor(Math.random() * Math.min(this.words.length, 1000)); //words sorted from easy to hard - pick from the 1000 easiest
    console.log(randomIndex + " ?")
    console.log(this.words + " ?")
    console.log(this.words[randomIndex] + " ?")
    this.word = this.words[randomIndex].replace('-',' ');
    this.words.splice(randomIndex, 1);
  }
  
  EmitWord()
  {
    let allowedPeople = GetUsersArray(this.users).filter(x=>x.drawing || x.guessed)
    EmitToUsersArray(allowedPeople, 'b.word', this.word)

    let censoredWord = this.word.replace(' ', '-').replace(/[a-zA-Z]/g, " _ ");
    let unallowedPeople = GetUsersArray(this.users).filter(x=>!x.drawing && !x.guessed)
    EmitToUsersArray(unallowedPeople, 'b.word', censoredWord)
  }

  ResetAndDivideBoard()
  {
    this.squares = Array.from({ length: this.gridWidth }, (row, rowIndex) =>
      Array.from({ length: this.gridHeight }, (col, colIndex) => ({
        on: false,
        x: rowIndex,
        y: colIndex
      }))
    );
    this.DivideSquares();
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
    this.EmitWord();
  
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
        if(currentUser.drawing)
        {
          sendTo = GetUsersArray(this.users).filter(x => x.guessed || x.id == socket.id)
        }
        else
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
    const parts = message.content.trim().split(/\s+/); // Split by spaces
    const commandName = parts[0]; // First part is the command name
    const parameters = parts.slice(1).map(param => {
        if (!isNaN(param)) {
            return Number(param); // Convert to number if it's a valid number
        }
        return param; // Leave it as a string if it's not a number
    });

    if(commandName == '/draw')
    {
      this.users[socketId].guessed = false;
      this.users[socketId].drawing = true;
      this.OnPlayersChange();
    }
    if(commandName == '/guess')
    {
      this.users[socketId].guessed = false;
      this.users[socketId].drawing = false;
      this.OnPlayersChange();
    }
    else if(commandName == '/guessed')
    {
      this.users[socketId].drawing = false;
      this.users[socketId].guessed = true;
      this.OnPlayersChange();
    }
    else if(commandName == '/size')
    {
      this.gridWidth = parameters[0];
      this.gridHeight = parameters[1];
      this.ResetAndDivideBoard();
      EmitToUserObject(this.users, 'b.canvas', this.squares)
    }
    else if(commandName == '/round')
    {
      this.NewRound();
    }
  }

  OnPlayersChange()
  {
    EmitToUserObject(this.users, 'b.users', this.users)

    this.DivideSquares();

    EmitToUserObject(this.users, 'b.canvas-ownership', this.squares)
  }

  DivideSquares()
  {
    const usersArr = GetUsersArray(this.users).filter(user => user.drawing);
    DivideSquaresToPeople(this.squares, usersArr);
  }
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

}
