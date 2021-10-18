const board = document.querySelector(".board");
let wolfsAndRocksCount;
let MATRIX;

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
      if (MATRIX[x][y] === 0) {
        return (MATRIX[x][y] = 1);
      } else {
        setCoordinates("bunny");
      }
      break;
    case "wolf":
      if (MATRIX[x][y] === 0) {
        return (MATRIX[x][y] = 2);
      } else {
        setCoordinates("wolf");
      }
      break;
    case "rock":
      if (MATRIX[x][y] === 0) {
        return (MATRIX[x][y] = 3);
      } else {
        setCoordinates("rock");
      }
      break;
    case "house":
      if (MATRIX[x][y] === 0) {
        return (MATRIX[x][y] = 4);
      } else {
        setCoordinates("house");
      }
      break;
  }
  return;
}

function startGame() {
  MATRIX = createMatrix(getMatrixLength());
  wolfsAndRocksCount = (getMatrixLength() * 40) / 100;
  board.innerHTML = "";
  board.style.opacity = 1;
  document.getElementById("won").style.display = "none";
  document.getElementById("lose").style.display = "none";

  MATRIX.forEach((arr) => arr.fill(0));
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

  MATRIX.forEach((y, Yaxis) =>
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
  const y = MATRIX.findIndex((arr) => arr.includes(1));
  const x = MATRIX[y].findIndex((el) => el === 1);
  return [x, y];
}

function getWolfCoordinates() {
  const allY = MATRIX.reduce((total, arr, i) => {
    arr.forEach((el, index) => {
      if (el === 2) {
        total.push(i);
      }
    });
    return total;
  }, []);

  const allX = [];
  MATRIX.map((arr) =>
    arr.forEach((el, index) => {
      if (el === 2) {
        allX.push(index);
      }
    })
  );
  const wolfCoordinates = [];
  for(let i = 0; i < wolfsAndRocksCount; i ++){
    wolfCoordinates.push([allX[i], allY[i]])
  }
  return wolfCoordinates;
}

function changeWolfCooridnates() {
  const [a, b] = getBunnyCoordinates();
  const wolfesCoordinates = getWolfCoordinates();
  for (let i = 0; i < wolfsAndRocksCount; i++) {
    const [x, y] = wolfesCoordinates[i];
    let newX,
      newY = null;

    if (b === y) {
      a > x ? (newX = x + 1) : (newX = x - 1);
      if (MATRIX[y][newX] === 0) {
        MATRIX[y].splice(x, 1, 0);
        MATRIX[y].splice(newX, 1, 2);
        moveWolf(x, y, newX, y);
      } else if (MATRIX[y][newX] === 1) {
        return endGame("lose");
      } else {
        if (MATRIX[y + 1][x] === 0) {
          MATRIX[y].splice(x, 1, 0);
          MATRIX[y + 1].splice(x, 1, 2);
          moveWolf(x, y, x, y + 1);
        } else if (MATRIX[y - 1][x] === 0) {
          MATRIX[y].splice(x, 1, 0);
          MATRIX[y - 1].splice(x, 1, 2);
          moveWolf(x, y, x, y - 1);
        }
      }
    } else {
      b > y ? (newY = y + 1) : (newY = y - 1);
      if (MATRIX[newY][x] === 0) {
        MATRIX[y].splice(x, 1, 0);
        MATRIX[newY].splice(x, 1, 2);
        moveWolf(x, y, x, newY);
      } else if (MATRIX[newY][x] === 1) {
        return endGame("lose");
      } else {
        if (a > x) {
          if (MATRIX[y][x + 1] === 0) {
            MATRIX[y].splice(x, 1, 0);
            MATRIX[y].splice(x + 1, 1, 2);
            moveWolf(x, y, x + 1, y);
          } else if (MATRIX[y][x + 1] === 1) {
            return endGame("lose");
          }
        } else if (MATRIX[y][x - 1] === 0) {
          MATRIX[y].splice(x, 1, 0);
          MATRIX[y].splice(x - 1, 1, 2);
          moveWolf(x, y, x - 1, y);
        } else if (MATRIX[y][x - 1] === 1) {
          return endGame("lose");
        }
      }
    }
  }
}

function moveWolf(oldX, oldY, x, y) {
  const oldSquare = document.getElementById(`${oldY}${oldX}`);
  const square = document.getElementById(`${y}${x}`);
  const child = square.childNodes[0];
  if (child && child.classList.contains("bunny")) {
    return endGame("lose");
  } else if (
    !child &&
    oldSquare.childNodes[0] &&
    oldSquare.childNodes[0].classList.contains("wolf")
  ) {
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
  if (x !== 0 && MATRIX[y][x - 1] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y].splice(x - 1, 1, 1);
    changeBunnyPosition(x, null, x - 1, y);
  } else if (x !== 0 && MATRIX[y][x - 1] === 2) {
    return endGame("lose");
  } else if (x !== 0 && MATRIX[y][x - 1] === 4) {
    return endGame("won");
  } else if (x === 0 && MATRIX[y][MATRIX[y].length - 1] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y].splice(MATRIX[y].length - 1, 1, 1);
    changeBunnyPosition(x, null, MATRIX[y].length - 1, y);
  } else if (x === 0 && MATRIX[y][MATRIX[y].length - 1] === 2) {
    return endGame("lose");
  } else if (x === 0 && MATRIX[y][MATRIX[y].length - 1] === 4) {
    return endGame("won");
  }

  return changeWolfCooridnates();
}

function moveRight() {
  const [x, y] = getBunnyCoordinates();
  if (x !== MATRIX[y].length - 1 && MATRIX[y][x + 1] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y].splice(x + 1, 1, 1);
    changeBunnyPosition(x, null, x + 1, y);
  } else if (x !== MATRIX[y].length - 1 && MATRIX[y][x + 1] === 2) {
    return endGame("lose");
  } else if (x !== MATRIX[y].length - 1 && MATRIX[y][x + 1] === 4) {
    return endGame("won");
  } else if (x === MATRIX[y].length - 1 && MATRIX[y][0] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y].splice(0, 1, 1);
    changeBunnyPosition(x, null, 0, y);
  } else if (x === MATRIX[y].length - 1 && MATRIX[y][0] === 2) {
    return endGame("lose");
  } else if (x === MATRIX[y].length - 1 && MATRIX[y][0] === 4) {
    return endGame("won");
  }

  return changeWolfCooridnates();
}

function moveUp() {
  const [x, y] = getBunnyCoordinates();
  if (y !== 0 && MATRIX[y - 1][x] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y - 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, y - 1);
  } else if (y !== 0 && MATRIX[y - 1][x] === 2) {
    return endGame("lose");
  } else if (y !== 0 && MATRIX[y - 1][x] === 4) {
    return endGame("won");
  } else if (y === 0 && MATRIX[MATRIX.length - 1][x] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[MATRIX.length - 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, MATRIX.length - 1);
  } else if (y === 0 && MATRIX[MATRIX.length - 1][x] === 2) {
    return endGame("lose");
  } else if (y === 0 && MATRIX[MATRIX.length - 1][x] === 4) {
    return endGame("won");
  }

  return changeWolfCooridnates();
}
function moveDown() {
  const [x, y] = getBunnyCoordinates();
  if (y !== MATRIX.length - 1 && MATRIX[y + 1][x] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[y + 1].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, y + 1);
  } else if (y !== MATRIX[y].length - 1 && MATRIX[y + 1][x] === 2) {
    return endGame("lose");
  } else if (y !== MATRIX[y].length - 1 && MATRIX[y + 1][x] === 4) {
    return endGame("won");
  } else if (y === MATRIX.length - 1 && MATRIX[0][x] === 0) {
    MATRIX[y].splice(x, 1, 0);
    MATRIX[0].splice(x, 1, 1);
    changeBunnyPosition(null, y, x, 0);
  } else if (y === MATRIX[y].length - 1 && MATRIX[0][x] === 2) {
    return endGame("lose");
  } else if (y === MATRIX[y].length - 1 && MATRIX[0][x] === 4) {
    return endGame("won");
  }

  return changeWolfCooridnates();
}

function endGame(result) {
  board.style.opacity = "0.3";
  board.innerHTML = "";
  return (document.getElementById(`${result}`).style.display = "block");
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
