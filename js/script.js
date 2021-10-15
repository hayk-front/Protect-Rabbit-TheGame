const board = document.querySelector(".board");
let matrix;

function getMatrixLength() {
  const value = document.querySelector("#select-size").value;
  return value ? parseInt(value) : parseInt(7);
}

function createMatrix(lenght) {
  return new Array(lenght).fill(0).map(() => new Array(lenght).fill(0));
}

function getRandomCoordinates(maxCoordinate) {
  const x = Math.floor(Math.random() * maxCoordinate);
  const y = Math.floor(Math.random() * maxCoordinate);
  return [x, y];
}

function setCoordinates(character) {
  const [x, y] = getRandomCoordinates(getMatrixLength());
  switch (character) {
    case "bunny":
      if (matrix[x][y] === 0) {
        return (matrix[x][y] = 1);
      } else {
        setCoordinates("bunny");
      }
      break;
    case "wolf":
      if (matrix[x][y] === 0) {
        return (matrix[x][y] = 2);
      } else {
        setCoordinates("wolf");
      }
      break;
    case "rock":
      if (matrix[x][y] === 0) {
        return (matrix[x][y] = 3);
      } else {
        setCoordinates("rock");
      }
      break;
    case "house":
      if (matrix[x][y] === 0) {
        return (matrix[x][y] = 4);
      } else {
        setCoordinates("house");
      }
      break;
  }
  return;
}

function startGame() {
  matrix = createMatrix(getMatrixLength());
  board.innerHTML = "";
  board.style.opacity = 1;
  document.getElementById("won").style.display = "none";

  matrix.forEach((arr) => arr.fill(0));
  const wolfsAndRocksCount = (getMatrixLength() * 40) / 100;
  for (let i = 0; i < wolfsAndRocksCount; i++) {
    setCoordinates("wolf");
    setCoordinates("rock");
  }

  setCoordinates("bunny");
  setCoordinates("house");

  return createUI();
}

function createBoardSquare(x, y, count) {
  const square = document.createElement("div");

  board.appendChild(square);
  square.className = "square";
  square.id = `${y}${x}`;

  if (count === 7) {
    square.style.width = 13 + "%";
  } else if (count === 10) {
    square.style.width = 9 + "%";
    square.style.height = 45 + "px";
  }

  return square;
}

function setCharacter(name, x, y) {
  const square = document.getElementById(`${y}${x}`);
  const character = document.createElement("div");
  character.className = name;
  return square.appendChild(character);
}

function createUI() {
  board.innerHTML = "";

  matrix.forEach((y, Yaxis) =>
    y.forEach((value, Xaxis) => {
      createBoardSquare(Xaxis, Yaxis, getMatrixLength());

      switch (value) {
        case 1:
          setCharacter("bunny", Xaxis, Yaxis);
          break;
        case 2:
          setCharacter("wolf", Xaxis, Yaxis);
          break;
        case 3:
          setCharacter("rock", Xaxis, Yaxis);
          break;
        case 4:
          setCharacter("house", Xaxis, Yaxis);
          break;
      }
    })
  );
  return isReady();
}

function getBunnyCoordinates() {
  const y = matrix.findIndex((arr) => arr.includes(1));
  const x = matrix[y].findIndex((el) => el === 1);
  return [x, y];
}

function getWolfCoordinates() {
  const allY = matrix.reduce((total, arr, i) => {
    if (arr.includes(2)) total.push(i);
    return total;
  }, []);
  const allX = matrix
    .map((arr) => arr.findIndex((el) => el === 2))
    .filter((el) => el !== -1);

  return [
    [allX[0], allY[0]],
    [allX[1], allY[1]],
    [allX[2], allY[2]],
  ];
}

function changeWolfCooridnates() {
  const [a, b] = getBunnyCoordinates();
  const wolfesCoordinates = getWolfCoordinates();
  for (let i = 0; i < 3; i++) {
    const [x, y] = wolfesCoordinates[i];
    let newX,
      newY = null;
        console.log(x,y);
        console.log(a,b);
    if (b === y) {
      a > x ? (newX = x + 1) : (newX = x - 1);
      moveWolf(x, y, newX, y);
    } else {
      b > y ? (newY = y + 1) : (newY = y - 1);
      moveWolf(x, y, x, newY);
    }
  }
}

function moveWolf(oldX, oldY, x, y) {
  const oldSquare = document.getElementById(`${oldY}${oldX}`);
  const square = document.getElementById(`${y}${x}`);
  console.log(square);
  if(square){
    return square.appendChild(oldSquare.childNodes[0]);
  }
}

function changeBunnyPosition(oldX, oldY, x, y) {
  const oldSquare = document.getElementById(
    `${oldX !== null ? y.toString() + oldX : oldY.toString() + x}`
  );
  const square = document.getElementById(`${y}${x}`);
  return square.appendChild(oldSquare.childNodes[0]);
}

function moveLeft() {
  const [x, y] = getBunnyCoordinates();
  if (x !== 0 && matrix[y][x - 1] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y].splice(x - 1, 1, 1);
    changeBunnyPosition(x, null, x - 1, y);
  } else if (x !== 0 && matrix[y][x - 1] === 4) {
    return youWon();
  } else if (x === 0 && matrix[y][matrix[y].length - 1] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y].splice(matrix[y].length - 1, 1, 1);
    changeBunnyPosition(x, null, matrix[y].length - 1, y);
  } else if (x === 0 && matrix[y][matrix[y].length - 1] === 4) {
    return youWon();
  }
  return changeWolfCooridnates();
}

function moveRight() {
  const [x, y] = getBunnyCoordinates();
  if (x !== matrix[y].length - 1 && matrix[y][x + 1] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y].splice(x + 1, 1, 1);
    changeBunnyPosition(x, null, x + 1, y);
  } else if (x !== matrix[y].length - 1 && matrix[y][x + 1] === 4) {
    return youWon();
  } else if (x === matrix[y].length - 1 && matrix[y][0] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y].splice(0, 1, 1);
    changeBunnyPosition(x, null, 0, y);
  } else if (x === matrix[y].length - 1 && matrix[y][0] === 4) {
    return youWon();
  }
  return changeWolfCooridnates();
}

function moveUp() {
  const [x, y] = getBunnyCoordinates();
  if (y !== 0 && matrix[y - 1][x] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y - 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, y - 1);
  } else if (y !== 0 && matrix[y - 1][x] === 4) {
    return youWon();
  } else if (y === 0 && matrix[matrix.length - 1][x] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[matrix.length - 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, matrix.length - 1);
  } else if (y === 0 && matrix[matrix.length - 1][x] === 4) {
    return youWon();
  }
  return changeWolfCooridnates();
}
function moveDown() {
  const [x, y] = getBunnyCoordinates();
  if (y !== matrix.length - 1 && matrix[y + 1][x] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[y + 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, y + 1);
  } else if (y !== matrix[y].length - 1 && matrix[y + 1][x] === 4) {
    return youWon();
  } else if (y === matrix.length - 1 && matrix[0][x] === 0) {
    matrix[y].splice(x, 1, 0);
    matrix[0].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, 0);
  } else if (y === matrix[y].length - 1 && matrix[0][x] === 4) {
    return youWon();
  }
  return changeWolfCooridnates();
}

function youWon() {
  board.style.opacity = "0.3";
  board.innerHTML = "";
  return (document.getElementById("won").style.display = "block");
}

function moveBunny(e) {
  getWolfCoordinates();
  if (!board.innerHTML) {
    e.stopPropagation;
    e.preventDefault;
    return;
  }
  switch (e.keyCode) {
    case 37:
      moveLeft();
      break;
    case 39:
      moveRight();
      break;
    case 38:
      moveUp();
      break;
    case 40:
      moveDown();
      break;
  }
}

function isReady() {
  window.addEventListener("keydown", moveBunny);
}
