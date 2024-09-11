const grid = document.getElementById('grid');
let squares = null;
let width;
let height;

socket.on('b.canvas', (bSquares) => {

  width = bSquares.length;
  height = bSquares[0].length;

  grid.innerHTML = '';

  const size = 400/(Math.max(width,height)); //480 for a perfect fit
  grid.style.gridTemplateColumns = `repeat(${width}, ${size}px)`;
  grid.style.gridTemplateRows = `repeat(${height}, ${size}px)`;

  squares = bSquares;


  for(let y = 0; y < height; y++)
  {
    for(let x = 0; x < width; x++)
    {
      const squareDiv = document.createElement('div');
      squareDiv.classList.add('square');

      grid.appendChild(squareDiv);
      squares[x][y].div = squareDiv;
      RenderSquare(squares[x][y])
    }
  }

  for(let y = 0; y < height; y++)
  {
    for(let x = 0; x < width; x++)
    {
      RenderSquare(squares[x][y])
    }
  }

  
})
socket.on('b.canvas-ownership', (bSquares) => {

    if(squares == null)
    {

    }
    else
    {
        const width = bSquares.length;
        const height = bSquares[0].length;
        
        for(let y = 0; y < height; y++)
        {
          for(let x = 0; x < width; x++)
          {
            squares[x][y].ownerId = bSquares[x][y].ownerId;
          }
        }
        
        for(let y = 0; y < height; y++)
        {
          for(let x = 0; x < width; x++)
          {
            RenderSquare(squares[x][y])
          }
        }
    }
})


socket.on('b.square', (bSquare) => {
  squares[bSquare.x][bSquare.y].on = bSquare.on;
  RenderSquare(squares[bSquare.x][bSquare.y]);
});



function RenderSquare(square) {

    square.div.style.backgroundColor = square.on;

    // Get the owner of the current square
    const ownerId = square.ownerId;
    let x = square.x;
    let y = square.y;

    // Initialize border settings
    let borderTop = '0';
    let borderRight = '0';
    let borderBottom = '0';
    let borderLeft = '0';

    let color = users[ownerId] ? users[ownerId].color : 'black';
    
    const small = `2px solid ${color}`
    const big = `5px solid ${color}`
    
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
    

    // Apply borders to the square
    const element = square.div;
    element.style.borderTop = borderTop;
    element.style.borderRight = borderRight;
    element.style.borderBottom = borderBottom;
    element.style.borderLeft = borderLeft;

    element.style.cursor = square.ownerId == socket.id ? 'crosshair' : 'no-drop';
}
