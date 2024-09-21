const {DivideSquaresToPeople, AssignRolesAndDivideBoard} = require('./utils.js');
const { GetDictionary } = require('./dictionaries.js');


const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io');
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
    const { newUser, roomCode, language } = data;
    if(gameRooms[roomCode])
    {
      gameRooms[roomCode].PlayerConnected(socket, newUser)
    }
    else
    {
      gameRooms[roomCode] = new GameRoom(socket, newUser, roomCode, language);
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

  constructor(creatorSocket, fUser, roomCode, language)
  {
    this.roomCode = roomCode;
    this.dictionary = GetDictionary(language);

    this.maxHintsPercent = 0.4;

    this.gridWidth = 14; // Change this to the desired number of rows 
    this.gridHeight = 14; // Chan ge this to the desired number of columns

    if(false)
    {
      this.roundDuration = 10 * 1000;
      this.roundEndingDuration = 1 * 1000;
    }
    else
    {
      this.roundDuration = 140 * 1000;
      this.roundEndingDuration = 6 * 1000;
    }

    
    this.users = {};
    this.rerollUsed = false;
    this.gameState = "waitingForPlayers";

    this.WaitForPlayers();
    this.PlayerConnected(creatorSocket, fUser);
    //this.NewRound();

    this.currentWaitStart;
    this.currentWaitDuration;
  }

  WaitForPlayers()
  {
    clearInterval(this.hintsInterval);
    this.SetGameTimeAndEmit(() => {}, 0);

    if(this.wordObject)
    {
      let message = {
        content: 'The word was ' + this.wordObject.revealed,
        system: true
      }
      this.SendMessage(message)
    }

    this.GetUsersArray().forEach(x => {
      x.reroll = false;
      x.guessed = false;
      x.drawing = true;
    })
    this.CreateBoard();

    //this.DivideBoard(false);

    this.rerollUsed = false;
    this.gameState = "waitingForPlayers"
    this.EmitToEveryone('b.gameState', this.gameState)
    this.EmitUsersToEveryone()
    this.EmitToEveryone('b.canvas', this.squares);

  }


  NewRound()
  {
    if(!this.GetUsersArray().length)
    {
      this.KillRoom();
    }
    if(this.dead)
    {
      return;
    }

    clearInterval(this.hintsInterval);

    if(this.wordObject)
    {
      let message = {
        content: 'The word was ' + this.wordObject.revealed,
        system: true
      }
      this.SendMessage(message)
    }

    this.GetUsersArray().forEach(x => {
      x.reroll = false;
      x.guessed = false;
    })
    this.CreateBoard();
    AssignRolesAndDivideBoard(this.squares, this.GetUsersArray())
    this.SetRandomWord();
    this.rerollUsed = false;
    this.gameState = "inProgress";

    this.EmitToEveryone('b.gameState', this.gameState)
    this.SetGameTimeAndEmit(() => this.RoundTimedOut(), this.roundDuration)
    this.RoundStartTime = new Date();
    this.EmitToEveryone('b.rerollValue', this.rerollUsed);
    this.EmitUsersToEveryone()
    this.EmitToEveryone('b.canvas', this.squares);
    this.EmitWordToEveryone();

    this.hintsInterval = setInterval(() => {
      this.UpdateHints();
    }, 100);
  }

  RoundTimedOut()
  {
    this.RoundEnd();
  }

  RoundEnd()
  {
    clearInterval(this.hintsInterval);
    this.gameState = "roundEnding"
    this.EmitToEveryone('b.gameState',this.gameState)
    this.EmitWordToEveryone();
    this.SetGameTimeAndEmit(() => this.NewRound(), this.roundEndingDuration)
  }

  //EMISSION------------------------------------------------------------------------------------------------------------------------
  EmitToEveryone(eventName, eventData)
  {
    EmitToUsersArray(this.GetUsersArray(), eventName, eventData);
  }

  //TIME------------------------------------------------------------------------------------------------------------------------------------

  GetTimeRemainingMS()
  {
    return this.currentWaitDuration - this.GetTimePassedMS();
  }

  GetTimePassedMS()
  {
    return new Date() - this.currentWaitStart
  }

  SetGameTimeAndEmit(onFinish, timeToWaitMS)
  {
    clearTimeout(this.timer);
    this.currentWaitStart = new Date();
    this.currentWaitDuration = timeToWaitMS;
    this.timer = setTimeout(onFinish, timeToWaitMS);
    this.EmitToEveryone('b.time', this.GetTimeRemainingMS());
  }



  //REROLL--------------------------------------------------------------------------------------------------------------------------------------------

  HandleReroll(socket, fUser)
  {

    if(this.gameState != "inProgress")
      {
        socket.emit('b.users',this.users);
        return;
      }

    let user = this.users[socket.id];

    user.reroll = fUser.reroll;

    let usersArray = this.GetUsersArray();
    if(usersArray.filter(x => x.drawing && x.reroll).length >= Math.ceil(usersArray.filter(x => x.drawing).length * 0.75))
    {
      //activate reroll

      let oldWord = this.wordObject;
      this.rerollUsed = true;
      this.SetRandomWord();
      this.ClearBoard();
      this.EmitWordToEveryone();
      this.EmitToEveryone('b.rerollValue', this.rerollUsed);
      this.EmitToEveryone('b.reroll', null);
      this.EmitToEveryone('b.canvas', this.squares);
      usersArray.forEach(x => x.reroll = false);
      let message = {
        content: '"' + oldWord.revealed + '" was re-rolled',
        system: true
      }
      this.SendMessage(message)
    }

    this.EmitUsersToEveryone()
  };

  //WORD---------------------------------------------------------------------------------------------------------------------------------------------
  SetRandomWord()
  {
    this.wordObject = this.dictionary.PopRandomWord();
  }
  
  EmitWordToEveryone()
  {
    let usersArray = this.GetUsersArray();

    usersArray.forEach(user => {
        if (user.drawing || user.guessed || this.gameState !== "inProgress") {
            EmitToUsersArray([user], 'b.word', this.wordObject.revealed); // Emit actual word
        } else {
            EmitToUsersArray([user], 'b.word', this.wordObject.censored); // Emit censored word
        }
    });
  }

  UpdateHints()
  {
    try {

      let percentage = Math.min(this.maxHintsPercent, 1.25 * this.maxHintsPercent * (this.GetTimePassedMS() / this.currentWaitDuration));
      if(this.wordObject.UpdateRevealedPercentage(percentage)){
        this.EmitWordToEveryone();
      };

    } catch (error) {console.error(error)}

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
    const usersArr = this.GetUsersArray().filter(user => user.drawing);
    DivideSquaresToPeople(this.squares, usersArr, maintainOrder);
  }

  HandlePaintingSquares(socket, fSquares) {
    try {

      let acceptedSquares = [];
      let rejectedSquares = [];
    
      fSquares.forEach(fSquare => {

        let square = this.squares[fSquare.x][fSquare.y];

        if (
              (
                this.gameState === "waitingForPlayers"
                ||
                (
                  square.ownerId === socket.id
                  && 
                  this.gameState === "inProgress"
                ) 
              ) 
              &&
              this.users[socket.id].drawing
            )
        {
          square.color = fSquare.color;
          acceptedSquares.push(square);
        } else {
          rejectedSquares.push(square);
        }

      });
    
      // Emit accepted squares as an array
      if (acceptedSquares.length > 0) {
        this.EmitToEveryone('b.squares', acceptedSquares);
      }
    
      // Emit rejected squares as an array
      if (rejectedSquares.length > 0) {
        socket.emit('b.squares', rejectedSquares);
      }
    } catch (error) {console.error(error)}
  }
  
  //PLAYERS---------------------------------------------------------------------------------------------------------------------------------------------------------

  GetUsersArray()
  {
    if(this.users)
      {
        // Get the keys (user IDs) from the users object
        const userIds = Object.keys(this.users);
        
        // Map over the user IDs to get the user objects
        return userIds.map(id => this.users[id]);
      }
      return [];
  }


  OnPlayersChangeIncludingDrawingStatus()
  {
    let playersArr = this.GetUsersArray();

    this.EmitUsersToEveryone();

    if(this.gameState == "inProgress")
    {
      if (!playersArr.some(x => x.drawing)) {

        this.RoundEnd();
  
      } else {
  
        this.DivideBoard(true);
        this.EmitToEveryone('b.canvas-ownership', this.squares)
      }
    }


  }

  EmitUsersToEveryone(){
    this.EmitToEveryone('b.users', this.users)
  }

  //INDIVIDUAL PLAYER------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  PlayerConnected(socket, fUser)
  {
    try {
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

      socket.emit('b.languageDirection', this.dictionary.languageDirection)
      socket.emit('b.users', this.users)
      socket.emit('b.gameState', this.gameState)
      socket.emit('b.canvas', this.squares);
      socket.emit('b.time', this.GetTimeRemainingMS());
      socket.emit('b.rerollValue', this.rerollUsed);

      //send the player list to the player
      this.OnPlayersChangeIncludingDrawingStatus()
      if(this.gameState == "inProgress")
      {
        this.EmitWordToEveryone();
      }

      socket.on('f.reroll', (fUser) => this.HandleReroll(socket, fUser));
      socket.on('f.squares', (fSquares) => this.HandlePaintingSquares(socket, fSquares));
      socket.on('f.message', (fMessage) => this.HandleMessage(socket, fMessage));
    
      socket.on('disconnect', (reason) => {
        this.HandleDisconnect(socket, reason)

      })
    } catch (error) {console.error(error)}

  }

  HandleDisconnect(socket, reason)
  {
    try {

      let message = {
        content: this.users[socket.id].name + " has left",
        system: true
      }
      this.SendMessage(message)
  
      delete this.users[socket.id];

      if(!this.GetUsersArray().length)
      {
        this.KillRoom();
      }
  
      this.OnPlayersChangeIncludingDrawingStatus();

    } catch (error) {console.error(error)}
  
  }

  KillRoom()
  {
    this.dead = true;
    delete gameRooms[this.roomCode];
    console.log("room " + this.roomCode + " died");
  }


  //CHAT------------------------------------------

  HandleMessage(socket, fMessage)
  {
    try {
          let currentUser = this.users[socket.id]; 
          fMessage.authorId = socket.id;
          fMessage.system = false;
      
          if(fMessage.content[0]=='/')
          {
            this.HandleCommand(socket.id, fMessage);
          }
          else
          {
            let sendTo;
      
            if(this.gameState == "inProgress")
            {
              //drawing - send to people who guessed
              if(currentUser.drawing)
                {
                  sendTo = this.GetUsersArray().filter(x => x.guessed || x.id == socket.id)
                  EmitToUsersArray(sendTo, 'b.message', fMessage)
                }
          
                //guessed - send to people who guessed or are drawing
                else if(currentUser.guessed)
                {
                  sendTo = this.GetUsersArray().filter(x => x.guessed || x.drawing)
                  EmitToUsersArray(sendTo, 'b.message', fMessage)
                }
          
                //guessing - send to everyone unless its correct or close
                else 
                {
                  if(this.wordObject.IsEquivelentToString(fMessage.content))
                  {
                    this.UserGuessedRight(currentUser);
                  }
                  else if(this.wordObject.IsCloseToString(fMessage.content)){
                    let message = {
                      content: fMessage.content + " is CLOSE!",
                      system: true
                    }
                    this.SendMessage(message, [currentUser]);
                  }
                  else
                  {
                    this.EmitToEveryone('b.message', fMessage)
                  }
                }
            }
            else
            {
              this.EmitToEveryone('b.message', fMessage)
            }
          }
    } catch (error) {console.error(error)}
  }

  UserGuessedRight(guesser)
  {
    let usersArray = this.GetUsersArray();

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

    let message = {
      content: this.wordObject.revealed + " is CORRECT! (+" + scoreForGuesser + ")",
      system: true
    }
    this.SendMessage(message, [guesser]);
    message = {
      content: guesser.name + " guessed it!",
      system: true,
      authorId: guesser.id
    }
    this.SendMessage(message, this.GetUsersArray().filter(x=>x.id != guesser.id));


    this.EmitUsersToEveryone();
    this.EmitToEveryone('b.guessed', null)

    console.log("filtered users = " + usersArray.filter(x=>!x.drawing && !x.guessed));
    if(!usersArray.filter(x=>!x.drawing && !x.guessed).length) //if no onbe is still guessing
    {
      this.RoundEnd();
    }
    else
    {
      //reveal the word to the user who got it right
      EmitToUsersArray([guesser],'b.word', this.wordObject.revealed)
    }

  }

  SendMessage(message, usersArr)
  {
    if(usersArr)
    {
      EmitToUsersArray(usersArr, 'b.message', message)
    }
    else
    {
      this.EmitToEveryone('b.message', message)
    }
  }


  //slash commands ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


  HandleCommand(socketId, message) {
    const parts = message.content.trim().split(/\s+/); // Split by spaces
    const commandName = parts[0]; // First part is the command name
    const parameters = parts.slice(1).map(param => {
        return isNaN(param) ? param : Number(param); // Convert to number if valid
    });

    // Input validation for each command
    switch (commandName) {
        case '/draw':
            this.users[socketId].guessed = false;
            this.users[socketId].drawing = true;
            this.EmitToEveryone(this.users[socketId], 'b.rerollValue', this.rerollUsed);
            this.OnPlayersChangeIncludingDrawingStatus();
            break;

        case '/guess':
            this.users[socketId].guessed = false;
            this.users[socketId].drawing = false;
            this.OnPlayersChangeIncludingDrawingStatus();
            break;

        case '/guessed':
            this.users[socketId].drawing = false;
            this.users[socketId].guessed = true;
            this.OnPlayersChangeIncludingDrawingStatus();
            break;

        case '/time':
            if (parameters.length === 1 && !isNaN(parameters[0]) && parameters[0] > 0) {
                this.roundDuration = parameters[0] * 1000;
            } else {
                console.error("Invalid time parameter.");
            }
            break;

        case '/size':
            const width = parameters[0];
            const height = parameters[1];

            if (parameters.length >= 1 && !isNaN(width) && width > 0 && width <= 20) {
                this.gridWidth = width;
                if (parameters.length > 1 && !isNaN(height) && height > 0 && height <= 20) {
                    this.gridHeight = height;
                } else {
                    this.gridHeight = this.gridWidth; // Default to gridWidth if height is invalid
                }
                this.CreateBoard();
                this.DivideBoard(true);
                this.EmitToEveryone('b.canvas', this.squares);
            } else {
                console.error("Invalid size parameters.");
            }
            break;

        case '/end':
            this.RoundEnd();
            break;

        case '/restart':
            this.NewRound();
            break;

        case '/difficulty':
            if (parameters.length === 1 && !isNaN(parameters[0]) && parameters[0] > 0) {
                this.maxHintsPercent = parameters[0];
            } else {
                console.error("Invalid difficulty parameter.");
            }
            break;

        default:
            console.error("Unknown command.");
            break;
    }
}

}



server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

