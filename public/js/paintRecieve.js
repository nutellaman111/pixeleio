const grid = document.getElementById('grid');

let squares = null;

socket.on('b.canvas', (bSquares) => {

  const width = bSquares.length;
  const height = bSquares[0].length;

  grid.innerHTML = '';

  grid.style.gridTemplateColumns = `repeat(${width}, 50px)`;
  grid.style.gridTemplateRows = `repeat(${height}, 50px)`;

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
})


socket.on('b.square', (bSquare) => {
  squares[bSquare.x][bSquare.y].on = bSquare.on;
  RenderSquare(squares[bSquare.x][bSquare.y]);
});



function RenderSquare(square)
{
  square.div.style.backgroundColor = square.on? 'black' : 'white';
}
