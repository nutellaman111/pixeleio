const grid = document.getElementById('grid');
let squares = null;

socket.on('b.canvas', (bSquares) => {

  let width = bSquares.length;
  let height = bSquares[0].length;

  grid.innerHTML = '';

  grid.style.gridTemplateColumns = `repeat(${width}, 1fr)`;
  grid.style.gridTemplateRows = `repeat(${height}, 1fr)`;

  squares = bSquares;


  for(let y = 0; y < height; y++)
  {
    for(let x = 0; x < width; x++)
    {
      const squareDiv = document.createElement('div');
      squareDiv.classList.add('square');

      grid.appendChild(squareDiv);
      squares[x][y].div = squareDiv;
    }
  }

  RenderBoard();
  
})
socket.on('b.canvas-ownership', (bSquares) => {

    if(squares == null)
    {

    }
    else
    {
      let width = bSquares.length;
      let height = bSquares[0].length;
        
      for(let y = 0; y < height; y++)
      {
        for(let x = 0; x < width; x++)
        {
          squares[x][y].ownerId = bSquares[x][y].ownerId;
        }
      }
      
      RenderBoard();
    }
})



socket.on('b.squares', (bSquares) => {
  bSquares.forEach(bSquare => {
    squares[bSquare.x][bSquare.y].color = bSquare.color;
    RenderSquare(squares[bSquare.x][bSquare.y]);
  });
});

function RenderBoard()
{
  if(gameState == "roundEnding")
  {
    ApplyShine(grid);
    grid.setAttribute('data-complete', true);
  }
  else
  {
    console.log("glow disable");
    grid.setAttribute('data-complete', false);
  }

  let width = squares.length;
  let height = squares[0].length;
  
  for(let y = 0; y < height; y++)
  {
    for(let x = 0; x < width; x++)
    {
      RenderSquare(squares[x][y])
    }
  }
}

function RenderSquare(square) {

  let width = squares.length;
  let height = squares[0].length;

  square.div.style.backgroundColor = square.color;

  // Get the owner of the current square
  const ownerId = square.ownerId;
  let x = square.x;
  let y = square.y;

  // Initialize border settings
  let borderTop = '0';
  let borderRight = '0';
  let borderBottom = '0';
  let borderLeft = '0';

  if(gameState == "inProgress")
  {
    let ownedByThisUser = ownerId == socket.id;
    let color = users[ownerId] ? users[ownerId].color : '#ff00ff';
  
    const borderStyle = ownedByThisUser ? 'double' : 'solid';
    const small = `${ownedByThisUser ? '4px' : '2px'} ${borderStyle} ${color}`;
    const big = `${ownedByThisUser ? '6px' : '4px'} ${borderStyle} ${color}`;
    
    if (y - 1 < 0) {
      borderTop = big; // Set border width and color
    } else if (squares[x][y - 1].ownerId !== ownerId) {
      borderTop = small;
    }
    
    // Check the neighbor to the right
    if (x + 1 >= width) {
      borderRight = big;
    } else if (squares[x + 1][y].ownerId !== ownerId) {
      borderRight = small;
    }
    
    // Check the neighbor to the bottom
    if (y + 1 >= height) {
      borderBottom = big;
    } else if (squares[x][y + 1].ownerId !== ownerId) {
      borderBottom = small;
    }
    
    // Check the neighbor to the left
    if (x - 1 < 0) {
      borderLeft = big;
    } else if (squares[x - 1][y].ownerId !== ownerId) {
      borderLeft = small;
    }
  }  

  // Apply borders to the square
  const element = square.div;
  element.style.borderTop = borderTop;
  element.style.borderRight = borderRight;
  element.style.borderBottom = borderBottom;
  element.style.borderLeft = borderLeft;

  element.style.cursor = ((square.ownerId == socket.id) && IsDrawableGameState()) ? (bucketSelected? 'pointer' : 'crosshair' ) : 'no-drop';
}
