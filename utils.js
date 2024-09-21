const packing = require("./data/packing.json");

function AssignRolesAndDivideBoard(squares, usersArr)
{
  AssignRoles(usersArr);
  DivideSquaresToPeople(squares, usersArr.filter(x=>x.drawing), false)

  usersArr.forEach(user => {
    //make sure no one is "drawing" yet has 0 squares
    user.drawing = squares.flat().some(square => square.ownerId == user.id);
    //makes them less likely to draw in the future
    if(user.drawing)
    {
      user.timesDrawing++;
    }
    //decays the thing so it doesnt last forever if new players join
    user.timesDrawing /= 2;
  })

}
function AssignRoles(usersArr) {

  const shuffledUsers = usersArr.sort(() => Math.random() - 0.5).sort((a, b) => a.timesDrawing - b.timesDrawing );

  let drawersCount;
  if(shuffledUsers.length <= 2)
  {
    drawersCount = 1;
  }
  else
  {
    let min = 2;
    let max = shuffledUsers.length - 1;
    drawersCount = PickAmountOfDrawers(min, max);
  }

  shuffledUsers.forEach((user, index) => {
    user.drawing = index < drawersCount;
  }); 

}
function DivideSquaresToPeople(squares, usersArr, maintainOrder) {

  const width = squares.length;
  const height = squares[0].length;

  usersArr.forEach(user => {
    user.boardOwnershipOrder = (user.boardOwnershipOrder && maintainOrder)? user.boardOwnershipOrder : Math.random();
  });
  usersArr.sort((a,b) => a.boardOwnershipOrder-b.boardOwnershipOrder);

  // Assign random positions to each user
  let i = 0;
  usersArr.forEach(user => {
    user.x = (packing[usersArr.length][i].x) * (width);
    user.y = (packing[usersArr.length][i].y) * (height);

    i = i+1;
  });

  // Helper function to calculate distance between two points
  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // Iterate through the squares and assign the nearest user
  squares.forEach(innerArray =>
    innerArray.forEach(square => {
      const DISTANCE_THRESHOLD = 0.001; // Define a small threshold to handle rounding errors

      let nearestUsers = [];
      let minDistance = Infinity; // Initialize with Infinity
      
      // Find the minimum distance
      usersArr.forEach(user => {
        const distance = getDistance(square.x + 0.5, square.y + 0.5, user.x, user.y); //from the center of the square
        if (distance < minDistance - DISTANCE_THRESHOLD) {
          minDistance = distance;
          nearestUsers = [user]; // Start a new list with the current userId
        } else if (Math.abs(distance - minDistance) < DISTANCE_THRESHOLD) {
          nearestUsers.push(user); // Add to the list of nearest users
        }
      });
      
      if(nearestUsers.length)
      {
        const randomIndex = Math.floor(Math.random() * nearestUsers.length);
        square.ownerId = nearestUsers[randomIndex].id;
      }
      else
      {
        square.ownerId = null;
      }

      
    })
  );
}

function AmountOfDrawersWeightFunction(x, m = 1, s = 0.4) {
  //desmos \frac{1}{x}+m\cdot e^{-s(x-2.5)^{2}}
  return (1 / x) + m * Math.exp(-s * Math.pow(x - 2.5, 2));
}

function AmountOfDrawersWeightFunction2(x, min, max)
{
  return max - x + 1;
}

function PickAmountOfDrawers(min, max) {
  // Step 1: Create an array of weights for each number in the range
  let weights = [];
  for (let i = min; i <= max; i++) {
      weights.push(AmountOfDrawersWeightFunction2(i, min, max));
  }

  // Step 2: Normalize the weights to ensure they sum to 1
  let totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let normalizedWeights = weights.map(weight => weight / totalWeight);

  // Step 3: Create a cumulative distribution
  let cumulativeWeights = [];
  normalizedWeights.reduce((sum, weight, i) => cumulativeWeights[i] = sum + weight, 0);

  // Step 4: Pick a random number based on the cumulative weights
  let randomValue = Math.random();
  for (let i = 0; i < cumulativeWeights.length; i++) {
      if (randomValue < cumulativeWeights[i]) {
          return min + i;
      }
  }
}



module.exports = { DivideSquaresToPeople, AssignRolesAndDivideBoard};

