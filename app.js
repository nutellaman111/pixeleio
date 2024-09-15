const {DivideSquaresToPeople, GetUsersArray, AreWordsClose, AreWordsEquivelent} = require('./utils.js');


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


//my stuff!!!!!!!!!! !!!!!!!!!!!!!!!!!!!!!!! 
class GameRoom {

  //GAME LOOP-----------------------------------------------------------------------------------------------------------------------------------------

  constructor(creatorSocket, fUser, roomCode)
  {
    this.roomCode = roomCode;

    this.gridWidth = 14; // Change this to the desired number of rows
    this.gridHeight = 14; // Chan ge this to the desired number of columns

    if(false)
    {
      this.roundDuration = 5 * 1000;
      this.roundEndingDuration = 3 * 1000;
    }
    else
    {
      this.roundDuration = 140 * 1000;
      this.roundEndingDuration = 5 * 1000;
    }

    
    this.users = {};
    this.words = require("./data/words.json");
    this.rerollUsed = false;
    this.gameState = "waitingForPlayers";

    this.NewRound();
    this.PlayerConnected(creatorSocket, fUser);
    this.NewRound();

    this.currentWaitStart;
    this.currentWaitDuration;
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
    this.DivideBoard(false);
    this.SetRandomWord();
    this.rerollUsed = false;
    this.gameState = "inProgress";

    this.EmitToUserObject('b.gameState', this.gameState)
    this.SetTimer(() => this.RoundTimedOut(), this.roundDuration)
    this.RoundStartTime = new Date();
    this.EmitToUserObject('b.rerollUsed', this.rerollUsed);
    this.EmitUsers()
    this.EmitToUserObject('b.canvas', this.squares);
    this.EmitWord();
  }

  RoundTimedOut()
  {
    this.RoundEnd();
  }

  RoundEnd()
  {
    this.gameState = "roundEnding"
    this.EmitToUserObject('b.gameState',this.gameState)
    this.EmitWord();
    this.SetTimer(() => this.NewRound(), this.roundEndingDuration)
  }

  //EMISSION------------------------------------------------------------------------------------------------------------------------
  EmitToUserObject(eventName, eventData)
  {
    EmitToUsersArray(GetUsersArray(this.users), eventName, eventData);
  }

  //TIME------------------------------------------------------------------------------------------------------------------------------------

  GetTimeRemainingMS()
  {
    return this.currentWaitDuration - (new Date() - this.currentWaitStart)
  }

  SetTimer(onFinish, timeToWaitMS)
  {
    clearTimeout(this.timer);
    this.currentWaitStart = new Date();
    this.currentWaitDuration = timeToWaitMS;
    this.timer = setTimeout(onFinish, timeToWaitMS);
    this.EmitToUserObject('b.time', this.GetTimeRemainingMS());
  }



  //REROLL--------------------------------------------------------------------------------------------------------------------------------------------

  HandleReroll(socket, fUser)
  {
    let user = this.users[socket.id];

    if(this.gameState != "inProgress")
    {
      socket.emit('b.users',this.users);
      return;
    }
    user.reroll = fUser.reroll;

    let usersArray = GetUsersArray(this.users);
    if(usersArray.filter(x => x.drawing && x.reroll).length >= Math.ceil(usersArray.filter(x => x.drawing).length * 0.75))
    {
      this.rerollUsed = true;
      this.SetRandomWord();
      this.ClearBoard();
      this.EmitWord();
      this.EmitToUserObject('b.rerollUsed', this.rerollUsed);
      this.EmitToUserObject('b.canvas', this.squares);
      usersArray.forEach(x => x.reroll = false);
      this.SendMessageFromSystem("Word re-rolled")
    }

    this.EmitUsers()
  };

  //WORD---------------------------------------------------------------------------------------------------------------------------------------------
  SetRandomWord()
  {
    const randomIndex = Math.floor(Math.random() * Math.min(this.words.length, 1000)); //words sorted from easy to hard - pick from the 1000 easiest
    this.word = this.words[randomIndex].replace('-',' ');
    this.words.splice(randomIndex, 1);
  }
  
  EmitWord()
  {
    let usersArray = GetUsersArray(this.users);

    usersArray.forEach(user => {
        if (user.drawing || user.guessed || this.gameState !== "inProgress") {
            EmitToUsersArray([user], 'b.word', this.word); // Emit actual word
        } else {
            let censoredWord = this.word.replace(' ', '-').replace(/[a-zA-Z]/g, " _ ");
            EmitToUsersArray([user], 'b.word', censoredWord); // Emit censored word
        }
    });
  }

  //BOARD------------------------------------------------------------------------------------------------------------------------------------------
  CreateBoard()
  {
    this.squares = Array.from({ length: this.gridWidth }, (row, rowIndex) =>
      Array.from({ length: this.gridHeight }, (col, colIndex) => ({
        on: false,
        x: rowIndex,
        y: colIndex,
        color: '#ffffff',
      }))
    );
  }

  ClearBoard()
  {
    this.squares.flat().forEach(x => x.color = '#ffffff')
  }

  DivideBoard(maintainOrder)
  {
    const usersArr = GetUsersArray(this.users).filter(user => user.drawing);
    DivideSquaresToPeople(this.squares, usersArr, maintainOrder);
  }

  HandlePaintingSquares(socket, fSquares) {
    let acceptedSquares = [];
    let rejectedSquares = [];
  
    fSquares.forEach(fSquare => {
      console.log(fSquare.x + " " + fSquare.y);
      let square = this.squares[fSquare.x][fSquare.y];
      if ((this.gameState === "inProgress" || this.gameState === "waitingForPlayers") &&
          square.ownerId === socket.id && this.users[socket.id].drawing) {
        square.color = fSquare.color;
        acceptedSquares.push(square);
      } else {
        rejectedSquares.push(square);
      }
    });
  
    // Emit accepted squares as an array
    if (acceptedSquares.length > 0) {
      this.EmitToUserObject('b.squares', acceptedSquares);
    }
  
    // Emit rejected squares as an array
    if (rejectedSquares.length > 0) {
      socket.emit('b.squares', rejectedSquares);
    }
  }
  
  //PLAYERS---------------------------------------------------------------------------------------------------------------------------------------------------------

  AssignRoles()
  {
    //decay the amount of times drawn
    let usersArr = GetUsersArray(this.users);
    usersArr.forEach(user => {
      user.timesDrawing /= 2;
    })

    const shuffledUsers = GetUsersArray(this.users).sort(() => Math.random() - 0.5).sort((a, b) => a.timesDrawing - b.timesDrawing );

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

  OnPlayersChangeIncludingDrawingStatus()
  {
    this.EmitToUserObject('b.users', this.users)

    this.DivideBoard(true);

    this.EmitToUserObject('b.canvas-ownership', this.squares)
  }



  EmitUsers(){
    this.EmitToUserObject('b.users', this.users)
  }

  //INDIVIDUAL PLAYER------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  PlayerConnected(socket, fUser)
  {
    this.users[socket.id] = {
        id: socket.id,
        name: fUser.name,
        color: fUser.color,
        drawing: this.gameState == "waitingForPlayers",
        guessed: false,
        timesDrawing: 0,
        x: 0,
        y: 0,
        reroll: false,
        score: 0
    };

    socket.emit('b.gameState', this.gameState)
    socket.emit('b.users', this.users)
    socket.emit('b.canvas', this.squares);
    socket.emit('b.time', this.GetTimeRemainingMS());

    //send the player list to the player
    this.OnPlayersChangeIncludingDrawingStatus()
    this.EmitWord();

    socket.on('f.reroll', (fUser) => this.HandleReroll(socket, fUser));
    socket.on('f.squares', (fSquares) => this.HandlePaintingSquares(socket, fSquares));
    socket.on('f.message', (fMessage) => this.HandleMessage(socket, fMessage));
  
    socket.on('disconnect', (reason) => {
      if(this.users[socket.id])
      {
        this.SendMessageFromSystem(this.users[socket.id].name + " has left")
    
        delete this.users[socket.id];
        this.OnPlayersChangeIncludingDrawingStatus();
      }
    })
  }


  //CHAT------------------------------------------

  HandleMessage(socket, fMessage)
  {
    let currentUser = this.users[socket.id]; 

    if(fMessage.content[0]=='/')
    {
      this.HandleCommand(socket.id, fMessage);
    }
    else
    {
      let sendTo;

      //drawing - send to people who guessed
      if(currentUser.drawing)
      {
        sendTo = GetUsersArray(this.users).filter(x => x.guessed || x.id == socket.id)
        EmitToUsersArray(sendTo, 'b.message', fMessage)
      }

      //guessed - send to people who guessed or are drawing
      else if(currentUser.guessed)
      {
        sendTo = GetUsersArray(this.users).filter(x => x.guessed || x.drawing)
        EmitToUsersArray(sendTo, 'b.message', fMessage)
      }

      //guessing - send to everyone unless its correct or close
      else 
      {
        if(AreWordsEquivelent(fMessage.content, this.word))
        {
          this.UserGuessedRight(currentUser);
        }
        else if(AreWordsClose(fMessage.content, this.word)){
          this.SendMessageFromSystem(fMessage.content + " is CLOSE!", [currentUser]);
        }
        else
        {
          this.EmitToUserObject('b.message', fMessage)
        }
      }
    }
  }

  UserGuessedRight(guesser)
  {
    let usersArray = GetUsersArray(this.users);

    guesser.guessed = true;
    let timeLeft = this.GetTimeRemainingMS();
    let scoreForGuesser = 100*(timeLeft/this.roundDuration);
    let scoreForDrawers = scoreForGuesser / usersArray.filter(x=>!x.drawing).length

    scoreForGuesser = Math.ceil(scoreForGuesser);
    scoreForDrawers = Math.ceil(scoreForDrawers);

    guesser.score += scoreForGuesser;

    usersArray.forEach(user => {
      if(user.drawing)
      {
        user.score += scoreForDrawers;
      }
    });

    this.SendMessageFromSystem(this.word + " is CORRECT! (+" + scoreForGuesser + ")", [guesser]);

    this.EmitUsers();

    console.log("filtered users = " + usersArray.filter(x=>!x.drawing && !x.guessed));
    if(!usersArray.filter(x=>!x.drawing && !x.guessed).length) //if no onbe is still guessing
    {
      console.log("MEOW");
      this.RoundEnd();
    }
    else
    {
      EmitToUsersArray([guesser],'b.word', this.word)
    }

  }

  SendMessageFromSystem(content, usersArr)
  {
    const message = {
      content: content
    }
    if(usersArr)
    {
      EmitToUsersArray(usersArr, 'b.message', message)
    }
    else
    {
      this.EmitToUserObject('b.message', message)
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
      this.EmitToUserObject(this.users[socketId], 'b.rerollUsed', this.rerollUsed)
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
      this.gridHeight = parameters[1] || this.gridWidth;
      this.CreateBoard();
      this.DivideBoard(true);
      this.EmitToUserObject('b.canvas', this.squares)
    }
    else if(commandName == '/end')
    {
      this.RoundEnd();
    }
    else if(commandName == '/restart')
    {
      this.NewRound();
    }
  }
}



server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

