const socket = io();

const grid = document.getElementById('grid');
document.addEventListener('dragstart', (e) => e.preventDefault());

let squares = null;

socket.on('b.canvas', (bSquares) => {
  squares = bSquares;
  for(let y = 0; y < 10; y++)
  {
    for(let x = 0; x < 10; x++)
    {
      const squareDiv = document.createElement('div');
      squareDiv.classList.add('square');

      grid.appendChild(squareDiv);
      squares[x][y].div = squareDiv;
      RenderSquare(squares[x][y])

    }
  }
})

const mouse = {
  0: false,
  2: false
};

// Add event listeners to the grid squares
grid.addEventListener('mousedown', (e) => {
    e.preventDefault();

    mouse[e.button] = true;

    handleMouseAction(e);
});

grid.addEventListener('mouseup', (e) => {

    mouse[e.button] = false;
});

grid.addEventListener('contextmenu', (e) => e.preventDefault()); // Disable right-click menu

grid.addEventListener('mousemove', (e) => {
    handleMouseAction(e);
});

function handleMouseAction(e) {

  if(mouse[0] == mouse[2]) //if holding both or neither butttons, return
  {
    return
  }

  let square = SquareFromDiv(e.target) //return if not on a square
  if(square == null)
  {
    return;
  }

  let leftClick = mouse[0];
  if(square.on == leftClick) //return if the state of the square is equal to the input
  {
    return;
  }

  square.on = leftClick;
  RenderSquare(square)

  socket.emit('f.square', square);
}

socket.on('b.square', (bSquare) => {
  squares[bSquare.x][bSquare.y].on = bSquare.on;
  RenderSquare(squares[bSquare.x][bSquare.y]);
});

function SquareFromDiv(element)
{
  return squares.flat().find(square => square.div === element);
}

function RenderSquare(square)
{
  square.div.style.backgroundColor = square.on? 'black' : 'white';
}
