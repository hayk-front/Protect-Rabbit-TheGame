const board = document.querySelector(".board");
let selectedMatrixSize;
let wolfsAndRocksCount;
let MATRIX;

const FREE_CELL = 0;
const BUNNY_CELL = 1;
const WOLF_CELL = 2;
const ROCK_CELL = 3;
const HOUSE_CELL = 4;

const DEFAULT_MATRIX_SIZE = 7;

const characters = {
  [BUNNY_CELL]: { name: "bunny", id: BUNNY_CELL },
  [WOLF_CELL]: { name: "wolf", id: WOLF_CELL },
  [ROCK_CELL]: { name: "rock", id: ROCK_CELL },
  [HOUSE_CELL]: { name: "house", id: HOUSE_CELL },
};

function getMatrixLength() {
  const value = document.querySelector("#select-size").value;
  return value ? parseInt(value) : DEFAULT_MATRIX_SIZE;
}

function createMatrix(lenght, defaultValue = 0) {
  return new Array(lenght)
    .fill(defaultValue)
    .map(() => new Array(lenght).fill(defaultValue));
}

function getRandomFreeCoordinate(maxCoordinate) {
  const x = Math.floor(Math.random() * maxCoordinate);
  const y = Math.floor(Math.random() * maxCoordinate);

  if (MATRIX[y][x] !== FREE_CELL) {
    return getRandomFreeCoordinate(maxCoordinate);
  }
  return [x, y];
}

function setCoordinates(character) {
  const [x, y] = getRandomFreeCoordinate(selectedMatrixSize);
  MATRIX[y][x] = characters[character].id;
}

function hideGameResult(result) {
  return (document.getElementById(`${result}`).style.display = "none");
}

function startGame() {
  MATRIX = createMatrix(getMatrixLength(), FREE_CELL);
  selectedMatrixSize = getMatrixLength();
  wolfsAndRocksCount = (selectedMatrixSize * 40) / 100;

  for (let i = 0; i < wolfsAndRocksCount; i++) {
    setCoordinates(WOLF_CELL);
    setCoordinates(ROCK_CELL);
  }

  setCoordinates(BUNNY_CELL);
  setCoordinates(HOUSE_CELL);

  return createUI();
}

function createBoardSquare(x, y, squaresCount) {
  const square = document.createElement("div");
  const DEFAULT_HEIGHT = 40;

  board.appendChild(square);
  square.className = "square";
  square.id = `${y}${x}`;

  square.style.width = Math.floor(100 / squaresCount - 1) + "%";
  square.style.height = Math.floor(100 / squaresCount) + DEFAULT_HEIGHT + "px";

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
  board.style.opacity = 1;
  hideGameResult("won");
  hideGameResult("lose");

  MATRIX.forEach((yArr, y) =>
    yArr.forEach((cellValue, x) => {
      createBoardSquare(x, y, getMatrixLength());
      if (characters[cellValue]) {
        setCharacter(characters[cellValue].name, x, y);
      }
    })
  );
  return isReady();
}

function getCharacterCoordinate(character) {
  const coordinates = [];
  MATRIX.forEach((yArray, y) => {
    yArray.filter((el, x) => {
      if (el === characters[character].id) {
        coordinates.push([x, y]);
      }
    });
  });
  return coordinates;
}

function isAlowedToMove(x, y) {
  if (MATRIX[y] && MATRIX[y][x] !== undefined) {
    if (MATRIX[y][x] === FREE_CELL || MATRIX[y][x] === BUNNY_CELL) {
      return true;
    }
  }
  return false;
}

function getFreeCoordinates(wolf) {
  const [x, y] = wolf;
  const freeCoordinates = [[x, y], []];

  if (isAlowedToMove(x + 1, y)) {
    freeCoordinates[1].push([x + 1, y]);
  }
  if (isAlowedToMove(x - 1, y)) {
    freeCoordinates[1].push([x - 1, y]);
  }
  if (isAlowedToMove(x, y + 1)) {
    freeCoordinates[1].push([x, y + 1]);
  }
  if (isAlowedToMove(x, y - 1)) {
    freeCoordinates[1].push([x, y - 1]);
  }
  return detectClosestDirection(freeCoordinates);
}

function detectClosestDirection(wolf) {
  let minimumHypotenuse = 99;
  const [bunnyX, bunnyY] = getCharacterCoordinate(BUNNY_CELL)[0];
  const [oldX, oldY] = wolf[0];
  const wolfAndClosestCoordinate = [[oldX, oldY], []];
  
  wolf[1].forEach((freeCoordinate) => {
    const [x, y] = freeCoordinate;
    // Pythagoras theorem below
    const a = Math.abs(bunnyX - x);
    const b = Math.abs(bunnyY - y);
    const c = Math.floor(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
    if (c < minimumHypotenuse) {
      minimumHypotenuse = c;
      wolfAndClosestCoordinate[1] = [x, y];
    }
  });
  return changeCharacterCoordinate(wolfAndClosestCoordinate);
}

function changeCharacterCoordinate(characterAndClosestCoordinate) {
    const [oldX, oldY] = characterAndClosestCoordinate[0];
    const [newX, newY] = characterAndClosestCoordinate[1];

    if (MATRIX[newY][newX] === BUNNY_CELL) {
      return endGame("lose");
    } else if (MATRIX[newY][newX] !== WOLF_CELL) {
      MATRIX[oldY][oldX] = FREE_CELL;
      MATRIX[newY][newX] = WOLF_CELL;
      moveCharacter(oldX, oldY, newX, newY);
    }
  return;
}

function moveCharacter(oldX, oldY, x, y) {
  const oldSquare = document.getElementById(`${oldY}${oldX}`);
  const square = document.getElementById(`${y}${x}`);
  if (oldSquare && oldSquare.childNodes[0]) {
    return square.appendChild(oldSquare.childNodes[0]);
  }
}

function wolfAttack() {
  const wolfes = getCharacterCoordinate(WOLF_CELL);
  wolfes.forEach((wolf) => {
    getFreeCoordinates(wolf);
  });
}

function changeBunnyCoordinate(direction) {
  const [oldX, oldY] = getCharacterCoordinate(BUNNY_CELL)[0];
  let newX = (newY = null);
  const leftCell = (topCell = 0);
  const rightCell = (bottomCell = selectedMatrixSize - 1);

  switch (direction) {
    case "left":
      if (oldX === leftCell) {
        newX = rightCell;
      } else {
        newX = oldX - 1;
      }
      break;
    case "right":
      if (oldX === rightCell) {
        newX = leftCell;
      } else {
        newX = oldX + 1;
      }
      break;
    case "up":
      if (oldY === topCell) {
        newY = bottomCell;
      } else {
        newY = oldY - 1;
      }
      break;
    case "down":
      if (oldY === bottomCell) {
        newY = topCell;
      } else {
        newY = oldY + 1;
      }
      break;
  }

  if (newX === null) newX = oldX;
  else if (newY === null) newY = oldY;

  return checkGameStatus(oldX, oldY, newX, newY);
}

function checkGameStatus(oldX, oldY, newX, newY) {
  switch (MATRIX[newY][newX]) {
    case FREE_CELL:
      MATRIX[oldY][oldX] = FREE_CELL;
      MATRIX[newY][newX] = BUNNY_CELL;
      moveCharacter(oldX, oldY, newX, newY);
      break;
    case WOLF_CELL:
      return endGame("lose");
    case HOUSE_CELL:
      return endGame("won");
  }
  return wolfAttack();
}

function endGame(result) {
  board.style.opacity = "0.3";
  board.innerHTML = "";
  return (document.getElementById(`${result}`).style.display = "block");
}

function moveBunny(e) {
  getCharacterCoordinate(WOLF_CELL);
  if (!board.innerHTML) {
    e.stopPropagation;
    e.preventDefault;
    return;
  }
  switch (e.keyCode) {
    case 37:
      changeBunnyCoordinate("left");
      break;
    case 39:
      changeBunnyCoordinate("right");
      break;
    case 38:
      changeBunnyCoordinate("up");
      break;
    case 40:
      changeBunnyCoordinate("down");
      break;
  }
}

function isReady() {
  window.addEventListener("keydown", moveBunny);
}
