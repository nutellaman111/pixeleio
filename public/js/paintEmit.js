{
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

    if(square.ownerId != socket.id) //return if the square isnt owned by this user
    {
      return;
    }

    let leftClick = mouse[0];
    let colorToPaint = leftClick? selectedColor : "#ffffff";

    if(square.on == colorToPaint) //return if the state of the square is equal to the input
    {
      return;
    }

    square.on = colorToPaint;
    RenderSquare(square)

    console.log("painted square");

    socket.emit('f.square', square);
  }

  function SquareFromDiv(element)
  {
    return squares.flat().find(square => square.div === element);
  }
}