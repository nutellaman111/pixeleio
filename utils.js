function DivideSquaresToPeople(squares, users)
{
  const width = squares.width;
  const height = squares.height;

  const userIds = Object.keys(users);


  squares.forEach(innerArray =>
    innerArray.forEach(square => {
      let randomId = userIds[Math.floor(Math.random()*userIds.length)];
      square.ownerId = randomId;
      console.log("gave square to " + users[randomId].name)
    })
  );
}

module.exports = { DivideSquaresToPeople };

