const darkGray = "#0f0f0f";
let selectedColor = darkGray;

{
const colors = [darkGray, '#7f7f7f', '#880015', '#ed1c24', 
    , '#ff7f27', '#fff200', '#22b14c', '#00a2e8', '#3f48cc',  '#a349a4',
    '#ffffff', '#c3c3c3', '#b97a57', '#ffaec9', '#ffc90e', '#efe4b0',
    '#b5e61d', '#99d9ea', '#7092be', '#c8bfe7'
]; // Add more colors as needed

function createColorButtons() {
  const colorPalette = document.getElementById('colorPalette');

  colors.forEach(color => {
    const button = document.createElement('button');
    button.className = 'color-button';
    button.hexColor = color;
    button.style.backgroundColor = color;
    button.dataset.selected = 'false'; // Default to not selected
    button.onclick = () => SelectColorByButton(button);

    //white - special border
    if(color == '#ffffff')
    {
      button.style.border = '1px solid #7f7f7f';
    }

    //black - select
    if(color == darkGray)
    {
      button.dataset.selected = 'true'; // Default to not selected
    }

    colorPalette.appendChild(button);
  });
}

function SelectColorByButton(button) {
  // Remove 'data-selected="true"' from all color buttons
  document.querySelectorAll('.color-button').forEach(btn => btn.dataset.selected = 'false');
  
  // Set 'data-selected="true"' on the clicked button
  button.dataset.selected = 'true';
  
  // Update the selected color
  selectedColor = button.hexColor;
  console.log(selectedColor);
}

function selectColorByHex(inputHex) {

  if(selectedColor != inputHex)
  {
    const matchingButton = Array.from(document.querySelectorAll('.color-button')).find(btn => btn.hexColor === inputHex);
    if (matchingButton) {
      SelectColorByButton(matchingButton);
    }
     else {
      console.log("Invalid hex color");
    }
  }
}

// Initialize the color buttons when the page loads
document.addEventListener('DOMContentLoaded', createColorButtons);
}