
let bucketSelected = false;

{

//clear tool---------------------------------------------------------
// Select the button
const clearButton = document.getElementById('clear');

// Timer and delay variables
let holdTimer;
const holdDuration = 0.75 * 1000; // 0.75 second

// Function to handle the button hold 
function heldFor1Second() {
  console.log("clear!");
  ClearAll()
  // Perform your desired action here
}

// Function to start the timer
function startHoldTimer() {
  console.log("hold start")
  holdTimer = setTimeout(heldFor1Second, holdDuration);
  PlayYippie();
}

// Function to clear the timer
function clearHoldTimer() {
  console.log("hold stop")
  clearTimeout(holdTimer);
  CutYippie();
}

// Event listeners for the button
clearButton.onpointerdown = startHoldTimer;
clearButton.onpointerup = clearHoldTimer;
//clearButton.addEventListener('mouseout', clearHoldTimer);


//bucket tool---------------------------------------------------
const bucketCheckbox = document.getElementById('bucket');

bucketCheckbox.addEventListener('change', (event) => {
  PlayMetal();
  bucketSelected = event.target.checked;
  RenderBoard();
});

function DeselectBucket()
{
  bucketSelected = false;
  bucketCheckbox.checked = false;
}

//mouse----------------------------------------------------------------
  const mouse = {
    0: false,
    2: false
  };
  document.addEventListener('dragstart', (e) => e.preventDefault());

  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();  // Prevent the default context menu
    return false;        // Return false to ensure default behavior is stopped
  });


  // Add event listeners to the grid squares
  document.addEventListener('mousedown', (e) => {

      mouse[e.button] = true;

      handleMouseAction(e);
  });

  document.addEventListener('mouseup', (e) => {

      mouse[e.button] = false;
  });

  grid.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click menu

  grid.addEventListener('mousemove', (e) => {
      handleMouseAction(e);
  });

//square pressed----------------------------------------------------------------------------

  function handleMouseAction(e) {

    if(squares == null)
    {
      return;
    }

    let square = SquareFromDiv(e.target) //return if not on a square
    if(square == null)
    {
      return;
    }

    //right click = color pick
    if(mouse[2]) //if holding both or neither butttons, return
    {
      selectColorByHex(square.color)
    }

    //left click = draw
    if(mouse[0])
    {

      if(!IsDrawableGameState()) //return if no one can draw rn
      {
        return;
      }

      if(!IsAllowedToPaintSquare(square)) //return if the square isnt owned by this user
      {
        return;
      }
    
      if(square.color == selectedColor) //return if the state of the square is equal to the input
      {
        return;
      }


      if(bucketSelected)
      {
        PlayBucket();
        DeselectBucket();
        socket.emit('f.squares', bucketFill(square.x, square.y, selectedColor));
        RenderBoard();
      }
      else
      {
        PlayTap();
        square.color = selectedColor;
        RenderSquare(square)
        socket.emit('f.squares', [square]);
      }

  
  
    }


  }

  function SquareFromDiv(element)
  {
    return squares.flat().find(square => square.div === element);
  }


  function bucketFill(startX, startY, newColor) {
    const changedSquares = []; // Array to store changed squares
  
    const startSquare = squares[startX][startY];
    const oldColor = startSquare.color;
    
    const stack = [{ x: startX, y: startY }];
  
    while (stack.length > 0) {
      const { x, y } = stack.pop();
  
      if (x < 0 || x >= squares.length || y < 0 || y >= squares[0].length) continue;
      const currentSquare = squares[x][y];
  
      if (currentSquare.color !== oldColor || !IsAllowedToPaintSquare(currentSquare)) continue;
  
      currentSquare.color = newColor;
      changedSquares.push(currentSquare);
  
      // Push adjacent squares onto the stack
      stack.push({ x: x + 1, y });
      stack.push({ x: x - 1, y });
      stack.push({ x, y: y + 1 });
      stack.push({ x, y: y - 1 });
    }
  
    return changedSquares;
  }

  function ClearAll()
  {
    let ownedColoredSquares = squares.flat().filter(x => IsAllowedToPaintSquare(x) && x.color != "#ffffff");
    ownedColoredSquares.forEach(square => {
      square.color = "#ffffff";
      RenderSquare(square)
    });
    socket.emit('f.squares', ownedColoredSquares);
  }
  
}

