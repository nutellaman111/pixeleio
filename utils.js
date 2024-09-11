const packing = require("./data/packing.json");

function DivideSquaresToPeople(squares, users) {

  const width = squares.length;
  const height = squares[0].length;

  // Assign random positions to each user
  let i = 0;
  users.forEach(user => {

    user.x = (packing[users.length][i].x + 0.5) * (width-1);
    user.y = (packing[users.length][i].y + 0.5) * (height-1);
    i = i+1;
  });



  // Helper function to calculate distance between two points
  function getDistance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  // Iterate through the squares and assign the nearest user
  squares.forEach(innerArray =>
    innerArray.forEach(square => {
      const DISTANCE_THRESHOLD = 0.01; // Define a small threshold to handle rounding errors

      let nearestUsers = [];
      let minDistance = Infinity; // Initialize with Infinity
      
      // Find the minimum distance
      users.forEach(user => {
        const distance = getDistance(square.x, square.y, user.x, user.y);
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

function GetUsersArray(users) {
  if(users)
  {
    // Get the keys (user IDs) from the users object
    const userIds = Object.keys(users);
    
    // Map over the user IDs to get the user objects
    return userIds.map(id => users[id]);
  }
  return [];

}

module.exports = { DivideSquaresToPeople, GetUsersArray };

