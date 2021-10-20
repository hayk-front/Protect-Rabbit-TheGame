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
const DEFAULT_CELL_HEIGHT = 40;

const edgeCells = {
  left: 0,
  top: 0,
  right: DEFAULT_MATRIX_SIZE - 1,
  bottom: DEFAULT_MATRIX_SIZE - 1,
};

const characters = {
  [BUNNY_CELL]: { id: BUNNY_CELL },
  [WOLF_CELL]: { name: "wolf", id: WOLF_CELL },
  [ROCK_CELL]: { name: "rock", id: ROCK_CELL },
  [HOUSE_CELL]: { name: "house", id: HOUSE_CELL },
};

function getMatrixLength() {
  const value = document.querySelector("#select-size").value;
  return value ? parseInt(value) : DEFAULT_MATRIX_SIZE;
}

function createMatrix(lenght, defaultValue) {
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
  document.getElementById(`${result}`).style.display = "none";
}

function startGame() {
  MATRIX = createMatrix(getMatrixLength(), FREE_CELL);
  selectedMatrixSize = getMatrixLength();
  edgeCells.right = edgeCells.bottom = selectedMatrixSize - 1;
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

  board.appendChild(square);
  square.className = "square";
  square.id = `${y}${x}`;

  square.style.width = Math.floor(100 / squaresCount - 1) + "%";
  square.style.height =
    Math.floor(100 / squaresCount) + DEFAULT_CELL_HEIGHT + "px";
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

  MATRIX.forEach((yAxis, y) =>
    yAxis.forEach((cellValue, x) => {
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
  MATRIX.forEach((yAxis, y) => {
    yAxis.filter((el, x) => {
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
  const [x, y] = wolf[0];
  const wolfAndClosestCoordinate = [[x, y], []];

  wolf[1].forEach((freeCoordinate) => {
    const [newX, newY] = freeCoordinate;
    // Pythagoras theorem below
    const a = Math.abs(bunnyX - newX);
    const b = Math.abs(bunnyY - newY);
    const c = Math.floor(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
    if (c < minimumHypotenuse) {
      minimumHypotenuse = c;
      wolfAndClosestCoordinate[1] = [newX, newY];
    }
  });
  return changeWolfCoordinate(wolfAndClosestCoordinate);
}

function changeWolfCoordinate(wolfAndClosestCoordinate) {
  const [x, y] = wolfAndClosestCoordinate[0];
  const [newX, newY] = wolfAndClosestCoordinate[1];

  if (MATRIX[newY][newX] === BUNNY_CELL) {
    return endGame("lose");
  } else if (MATRIX[newY][newX] !== WOLF_CELL) {
    moveCharacter(WOLF_CELL, x, y, newX, newY);
  }
  return;
}

function moveCharacter(characterCell, x, y, newX, newY) {
  MATRIX[y][x] = FREE_CELL;
  MATRIX[newY][newX] = characterCell;
  const oldSquare = document.getElementById(`${y}${x}`);
  const square = document.getElementById(`${newY}${newX}`);
  if (oldSquare && oldSquare.childNodes[0]) {
    square.appendChild(oldSquare.childNodes[0]);
  }
}

function wolfAttack() {
  const wolfes = getCharacterCoordinate(WOLF_CELL);
  wolfes.forEach(getFreeCoordinates);
}

function changeBunnyCoordinate(direction, step, fromEdge, toEdge) {
  const [x, y] = getCharacterCoordinate(BUNNY_CELL)[0];
  let [newX, newY] = [x, y];
  let axis = direction === "x" ? x : y;

  if (axis === fromEdge) axis = toEdge;
  else axis = axis + step;

  if (direction === "x") newX = axis;
  else newY = axis;

  return checkGameStatus(x, y, newX, newY);
}

function checkGameStatus(x, y, newX, newY) {
  switch (MATRIX[newY][newX]) {
    case FREE_CELL:
      moveCharacter(BUNNY_CELL, x, y, newX, newY);
      break;
    case WOLF_CELL:
      return endGame("lose");
    case HOUSE_CELL:
      return endGame("won");
  }
  wolfAttack();
}

function endGame(result) {
  board.style.opacity = "0.3";
  board.innerHTML = "";
  document.getElementById(`${result}`).style.display = "block";
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
      changeBunnyCoordinate("x", -1, edgeCells.left, edgeCells.right);
      break;
    case 39:
      changeBunnyCoordinate("x", 1, edgeCells.right, edgeCells.left);
      break;
    case 38:
      changeBunnyCoordinate("y", -1, edgeCells.top, edgeCells.bottom);
      break;
    case 40:
      changeBunnyCoordinate("y", 1, edgeCells.bottom, edgeCells.top);
      break;
  }
}

function isReady() {
  window.addEventListener("keydown", moveBunny);
}
