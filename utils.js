const packing = require("./data/packing.json");

function DivideSquaresToPeople(squares, users) {

  const width = squares.length;
  const height = squares[0].length;

  const userIds = Object.keys(users);

  // Assign random positions to each user
  let i = 0;
  userIds.forEach(userId => {

    users[userId].x = (packing[userIds.length][i].x + 0.5) * (width-1);
    users[userId].y = (packing[userIds.length][i].y + 0.5) * (height-1);
    console.log(users[userId].x + " " + users[userId].y)
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

      let nearestUserIds = [];
      let minDistance = Infinity; // Initialize with Infinity
      
      // Find the minimum distance
      userIds.forEach(userId => {
        const distance = getDistance(square.x, square.y, users[userId].x, users[userId].y);
        if (distance < minDistance - DISTANCE_THRESHOLD) {
          minDistance = distance;
          nearestUserIds = [userId]; // Start a new list with the current userId
        } else if (Math.abs(distance - minDistance) < DISTANCE_THRESHOLD) {
          nearestUserIds.push(userId); // Add to the list of nearest users
          console.log("tie!");
        }
      });
      
      const randomIndex = Math.floor(Math.random() * nearestUserIds.length);
      square.ownerId = nearestUserIds[randomIndex];
      
    })
  );
}

function GetUsersArray(users) {
  // Get the keys (user IDs) from the users object
  const userIds = Object.keys(users);
  
  // Map over the user IDs to get the user objects
  return userIds.map(id => users[id]);
}

module.exports = { DivideSquaresToPeople, GetUsersArray };

