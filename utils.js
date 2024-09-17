const packing = require("./data/packing.json");

function DivideSquaresToPeople(squares, users, maintainOrder) {

  const width = squares.length;
  const height = squares[0].length;


  users.forEach(user => {
    console.log("before " + user.boardOwnershipOrder);
    user.boardOwnershipOrder = (user.boardOwnershipOrder && maintainOrder)? user.boardOwnershipOrder : Math.random();
    console.log("after " + user.boardOwnershipOrder);
  });
  users.sort((a,b) => a.boardOwnershipOrder-b.boardOwnershipOrder);

  // Assign random positions to each user
  let i = 0;
  users.forEach(user => {
    user.x = (packing[users.length][i].x) * (width);
    user.y = (packing[users.length][i].y) * (height);
    console.log(user.x);
    console.log(user.y);
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
      users.forEach(user => {
        const distance = getDistance(square.x + 0.5, square.y + 0.5, user.x, user.y); //from the center of the square
        if (distance < minDistance - DISTANCE_THRESHOLD) {
          minDistance = distance;
          nearestUsers = [user]; // Start a new list with the current userId
        } else if (Math.abs(distance - minDistance) < DISTANCE_THRESHOLD) {
          nearestUsers.push(user); // Add to the list of nearest users
          console.log("tie!");
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





module.exports = { DivideSquaresToPeople};

