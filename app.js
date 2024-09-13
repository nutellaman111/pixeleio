const {DivideSquaresToPeople, GetUsersArray, AreWordsClose, AreWordsEquivelent} = require('./utils.js');
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

    this.gridWidth = 14; // Change this to the desired number of rows
    this.gridHeight = 14; // Chan ge this to the desired number of columns

    if(false)
    {
      this.roundDuration = 5 * 1000;
    }
    else
    {
      this.roundDuration = 140 * 1000;
    }
    
    this.users = {};
    this.words = require("./data/words.json");
    this.rerollUsed = false;
    this.waitingForPlayers = true;

    this.NewRound();
    this.PlayerConnected(creatorSocket, fUser);
    this.NewRound();
  }

  NewRound()
  {
    if(this.word)
    {
      this.SendMessageFromSystem('The word was ' + this.word)
    }

    GetUsersArray(this.users).forEach(x => {
      x.reroll = false;
      x.guessed = false;
    })
    this.AssignRoles();
    this.CreateBoard();
    this.DivideBoard();
    this.SetRandomWord();
    this.rerollUsed = false;

    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.RoundTimedOut(), this.roundDuration);
    this.RoundStartTime = new Date();
    EmitToUserObject(this.users, 'b.time', this.roundDuration);

    EmitToUserObject(this.users, 'b.rerollUsed', this.rerollUsed);
    this.EmitUsers()
    EmitToUserObject(this.users, 'b.canvas', this.squares);
    this.EmitWord();
  }

  RoundTimedOut()
  {
    this.NewRound();
  }

  AssignRoles()
  {
    const shuffledUsers = GetUsersArray(this.users).sort((a, b) => a.timesDrawing - b.timesDrawing );

    let drawersCount;
    if(shuffledUsers.length < 3)
    {
      drawersCount = 1;
    }
    else
    {
      let min = 2;
      let max = shuffledUsers.length - 1;
      drawersCount = Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffledUsers.forEach((user, index) => {
      user.drawing = index < drawersCount;
      user.timesDrawing += user.drawing? 1: 0;
    }); 

    return shuffledUsers; // return the modified array if needed
  }

  SetRandomWord()
  {
    const randomIndex = Math.floor(Math.random() * Math.min(this.words.length, 1000)); //words sorted from easy to hard - pick from the 1000 easiest
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


  CreateBoard()
  {
    this.squares = Array.from({ length: this.gridWidth }, (row, rowIndex) =>
      Array.from({ length: this.gridHeight }, (col, colIndex) => ({
        on: false,
        x: rowIndex,
        y: colIndex,
        color: '#ffffff'
      }))
    );
  }

  ClearBoard()
  {
    this.squares.flat().forEach(x => x.color = '#ffffff')
  }

  PlayerConnected(socket, fUser)
  {
    this.users[socket.id] = {
        id: socket.id,
        name: fUser.name,
        color: fUser.color,
        drawing: this.waitingForPlayers,
        guessed: false,
        timesDrawing: 0,
        x: 0,
        y: 0,
        reroll: false
    };
    let currentUser = this.users[socket.id]

    //send the full canvas to the new player
    socket.emit('b.users', this.users)
    socket.emit('b.canvas', this.squares);

    //send the player list to the player
    this.OnPlayersChangeIncludingDrawingStatus()
    this.EmitWord();

    socket.on('f.reroll', (fUser) => {
      let user = this.users[socket.id];
      user.reroll = fUser.reroll;

      let usersArray = GetUsersArray(this.users);
      if(usersArray.filter(x => x.drawing && x.reroll).length >= Math.ceil(usersArray.filter(x => x.drawing).length * 0.75))
      {
        this.rerollUsed = true;
        this.SetRandomWord();
        this.ClearBoard();
        this.EmitWord();
        EmitToUserObject(this.users, 'b.rerollUsed', this.rerollUsed);
        EmitToUserObject(this.users, 'b.canvas', this.squares);
        usersArray.forEach(x => x.reroll = false);
        this.SendMessageFromSystem("Word re-rolled")
      }

      this.EmitUsers()
    });

  
    socket.on('f.square', (fSquare) => {
      let square = this.squares[fSquare.x][fSquare.y];
      if(square.ownerId == socket.id && this.users[socket.id].drawing)
      {
        square.color = fSquare.color;
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
          EmitToUsersArray(sendTo, 'b.message', message)
        }
        else
        {
          if(currentUser.guessed)
          {
            sendTo = GetUsersArray(this.users).filter(x => x.guessed || x.drawing)
            EmitToUsersArray(sendTo, 'b.message', message)
          }
          else //guessing
          {
            if(AreWordsEquivelent(message.content, this.word))
            {
              console.log("words equivelent");
              this.SendMessageFromSystem(message.content + " is CORRECT!", [currentUser]);
              currentUser.guessed = true;
              this.EmitUsers();
            }
            else if(AreWordsClose(message.console, this.word)){
              this.SendMessageFromSystem(message.content + " is CLOSE!", [currentUser]);
            }
            else
            {
              console.log("sending to everyone");
              EmitToUserObject(this.users, 'b.message', message)
            }
          }
        }

      }
    })
  
    socket.on('disconnect', (reason) => {
      if(this.users[socket.id])
      {
        this.SendMessageFromSystem(this.users[socket.id].name + " has left")
    
        delete this.users[socket.id];
        this.OnPlayersChangeIncludingDrawingStatus();
      }
    })
  }

  SendMessageFromSystem(content, usersArr)
  {
    const message = {
      content: content
    }
    if(usersArr)
    {
      EmitToUsersArray(usersArr, 'n.message', message)
    }
    else
    {
      EmitToUserObject(this.users, 'b.message', message)
    }
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
      this.OnPlayersChangeIncludingDrawingStatus();
    }
    if(commandName == '/guess')
    {
      this.users[socketId].guessed = false;
      this.users[socketId].drawing = false;
      this.OnPlayersChangeIncludingDrawingStatus();
    }
    else if(commandName == '/guessed')
    {
      this.users[socketId].drawing = false;
      this.users[socketId].guessed = true;
      this.OnPlayersChangeIncludingDrawingStatus();
    }
    else if(commandName == '/time')
    {
      this.roundDuration = parameters[0] * 1000;
    }
    else if(commandName == '/size')
    {
      this.gridWidth = parameters[0];
      if(parameters[1])
      {
        this.gridHeight = parameters[1];
      }
      else
      {
        this.gridHeight = this.gridWidth;
      }
      this.CreateBoard();
      this.DivideBoard();
      EmitToUserObject(this.users, 'b.canvas', this.squares)
    }
    else if(commandName == '/round')
    {
      this.NewRound();
    }
  }

  EmitUsers(){
    EmitToUserObject(this.users, 'b.users', this.users)
  }

  OnPlayersChangeIncludingDrawingStatus()
  {
    EmitToUserObject(this.users, 'b.users', this.users)

    this.DivideBoard();

    EmitToUserObject(this.users, 'b.canvas-ownership', this.squares)
  }

  DivideBoard()
  {
    const usersArr = GetUsersArray(this.users).filter(user => user.drawing);
    DivideSquaresToPeople(this.squares, usersArr);
  }
}

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

}
