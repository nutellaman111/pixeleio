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

function AreWordsEquivelent(originalWord1, originalWord2)
{
  const word1 = standardiseWord(originalWord1)
  const word2 = standardiseWord(originalWord2)
  return word1 == word2;
}

function AreWordsClose(originalWord1, originalWord2) {

  const word1 = standardiseWord(originalWord1)
  const word2 = standardiseWord(originalWord2)

  const len1 = word1.length;
  const len2 = word2.length;

  if (Math.abs(len1 - len2) > 1) {
      return false; // More than one letter difference in length means more than one change
  }

  let i = 0, j = 0;
  let foundDifference = false;

  while (i < len1 && j < len2) {
      if (word1[i] !== word2[j]) {
          if (foundDifference) return false;
          foundDifference = true;

          // Check for replacement or insertion/removal
          if (len1 > len2) {
              i++; // Removal case
          } else if (len2 > len1) {
              j++; // Insertion case
          } else {
              i++;
              j++; // Replacement case
          }
      } else {
          i++;
          j++;
      }
  }

  // Handle the case where the end of one string is reached
  if (i < len1 || j < len2) {
      if (foundDifference) return false;
      foundDifference = true;
  }

  return true;
}

function standardiseWord(str) {
  if (!str) return '';

  // Convert to lowercase
  const lowerCase = str.toLowerCase();

  // Remove non-letter characters
  const result = lowerCase.replace(/[^a-z]/g, '');

  return result;
}


module.exports = { DivideSquaresToPeople, AreWordsEquivelent, AreWordsClose  };

