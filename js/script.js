const board = document.querySelector(".board");
let selectedMatrixSize;
let wolfsAndRocksCount;
let MATRIX;

const freeCell = 0;
const bunnyId = 1;
const wolfId = 2;
const rockId = 3;
const houseId = 4;

const bunnyImg = "../images/bunny.png";
const wolfImg = "../images/wolf.png";
const rockImg = "../images/rock.png";
const houseImg = "../images/house.png";

const characters = {
  bunny: { name: "bunny", id: bunnyId, img: bunnyImg },
  wolf: { name: "wolf", id: wolfId, img: wolfImg },
  rock: { name: "rock", id: rockId, img: rockImg },
  house: { name: "house", id: houseId, img: houseImg },
};

function getMatrixLength() {
  const value = document.querySelector("#select-size").value;
  return value ? parseInt(value) : parseInt(7);
}

function createMatrix(lenght) {
  return new Array(lenght).fill(0).map(() => new Array(lenght).fill(0));
}

function getRandomFreeCoordinate(maxCoordinate) {
  const x = Math.floor(Math.random() * maxCoordinate);
  const y = Math.floor(Math.random() * maxCoordinate);

  if (MATRIX[y][x] !== freeCell) {
    return getRandomFreeCoordinate(selectedMatrixSize);
  }
  return [x, y];
}

function setCoordinates(character) {
  const [x, y] = getRandomFreeCoordinate(selectedMatrixSize);
  return (MATRIX[y][x] = characters[character].id);
}

function hideGameResult(result) {
  return (document.getElementById(`${result}`).style.display = "none");
}

function startGame() {
  MATRIX = createMatrix(getMatrixLength());
  selectedMatrixSize = getMatrixLength();
  wolfsAndRocksCount = (selectedMatrixSize * 40) / 100;

  board.innerHTML = "";
  board.style.opacity = 1;
  hideGameResult("won");
  hideGameResult("lose");

  MATRIX.forEach((arr) => arr.fill(0));
  for (let i = 0; i < wolfsAndRocksCount; i++) {
    setCoordinates("wolf");
    setCoordinates("rock");
  }

  setCoordinates("bunny");
  setCoordinates("house");

  return createUI();
}

function createBoardSquare(x, y, squaresCount) {
  const square = document.createElement("div");

  board.appendChild(square);
  square.className = "square";
  square.id = `${y}${x}`;

  square.style.width = Math.floor(100 / squaresCount - 1) + "%";
  square.style.height = Math.floor(100 / squaresCount) + 40 + "px";

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

function getCharacterCoordinate(character) {
  const coordinates = [];
  MATRIX.forEach((y, indexY) => {
    if (y.includes(characters[character].id)) {
      y.filter((el, indexX) => {
        if (el === characters[character].id) {
          coordinates.push([indexX, indexY]);
        }
      });
    }
  });
  return coordinates;
}

function getFreeCoordinates() {
  const wolfesAndFreeCoordinates = [];
  const wolfes = getCharacterCoordinate("wolf");

  wolfes.forEach((wolf) => {
    const freeCoordinatesForEach = [[], []];
    const [x, y] = wolf;

    freeCoordinatesForEach[0] = [x, y];
    if (MATRIX[y][x + 1] !== undefined && MATRIX[y][x + 1] === freeCell) {
      freeCoordinatesForEach[1].push([x + 1, y]);
    }
    if (MATRIX[y][x - 1] !== undefined && MATRIX[y][x - 1] === freeCell) {
      freeCoordinatesForEach[1].push([x - 1, y]);
    }
    if (
      MATRIX[y + 1] &&
      MATRIX[y + 1][x] !== undefined &&
      MATRIX[y + 1][x] === freeCell
    ) {
      freeCoordinatesForEach[1].push([x, y + 1]);
    }
    if (
      MATRIX[y - 1] &&
      MATRIX[y - 1][x] !== undefined &&
      MATRIX[y - 1][x] === freeCell
    ) {
      freeCoordinatesForEach[1].push([x, y - 1]);
    }
    wolfesAndFreeCoordinates.push(freeCoordinatesForEach);
  });
  return detectClosestDirection(wolfesAndFreeCoordinates);
}

function detectClosestDirection(wolfesAndFreeCoordinates) {
  const [bunnyX, bunnyY] = getCharacterCoordinate("bunny")[0];
  const allWolfesClosestCoordinates = [];
  const wolfAndClosestCoordinate = [[], []];
  wolfesAndFreeCoordinates.forEach((wolf) => {
    const [oldX, oldY] = wolf[0];
    let minimumC = 9;
    console.log(minimumC);
    wolf[1].forEach((freeCoordinate) => {
      const [x, y] = freeCoordinate;
      // Pythagoras theorem
      const a = Math.abs(bunnyX - x);
      const b = Math.abs(bunnyY - y);
      const c = Math.floor(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
      if (c < minimumC) {
        minimumC = c;
        wolfAndClosestCoordinate[0] = [oldX, oldY];
        // TODO: always same wtf
        wolfAndClosestCoordinate[1] = [x, y];
      }
    });
    allWolfesClosestCoordinates.push(wolfAndClosestCoordinate);
  });
  console.log("CLOSEST: ", allWolfesClosestCoordinates);
  return allWolfesClosestCoordinates;
}

function wolfAttack() {
  getCharacterCoordinate("bunny");

  getFreeCoordinates();
  // detectClosestDirection();
  // moveToClosest();
}

function changeWolfCooridnates() {
  wolfAttack();
  const [a, b] = getCharacterCoordinate("bunny")[0];

  const wolfesCoordinates = getCharacterCoordinate("wolf");
  for (let i = 0; i < wolfsAndRocksCount - 1; i++) {
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
  return;
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
  const [x, y] = getCharacterCoordinate("bunny")[0];
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
  const [x, y] = getCharacterCoordinate("bunny")[0];
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
  const [x, y] = getCharacterCoordinate("bunny")[0];
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
  const [x, y] = getCharacterCoordinate("bunny")[0];
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
  getCharacterCoordinate("wolf");
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
