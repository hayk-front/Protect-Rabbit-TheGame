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
  [BUNNY_CELL]: {
    name: "bunny",
    id: BUNNY_CELL,
    allowedMoves: [FREE_CELL, WOLF_CELL, HOUSE_CELL],
  },
  [WOLF_CELL]: {
    name: "wolf",
    id: WOLF_CELL,
    allowedMoves: [FREE_CELL, BUNNY_CELL],
  },
  [ROCK_CELL]: { name: "rock", id: ROCK_CELL },
  [HOUSE_CELL]: { name: "house", id: HOUSE_CELL },
};

const getMatrixLength = () => {
  const value = document.querySelector("#select-size").value;
  return value ? parseInt(value) : DEFAULT_MATRIX_SIZE;
};

const createMatrix = (lenght, defaultValue) => {
  return new Array(lenght)
    .fill(defaultValue)
    .map(() => new Array(lenght).fill(defaultValue));
};

const getRandomFreeCoordinate = (maxCoordinate) => {
  const x = Math.floor(Math.random() * maxCoordinate);
  const y = Math.floor(Math.random() * maxCoordinate);

  if (MATRIX[y][x] !== FREE_CELL) {
    return getRandomFreeCoordinate(maxCoordinate);
  }
  return [x, y];
};

const setCoordinates = (character) => {
  const [x, y] = getRandomFreeCoordinate(selectedMatrixSize);
  MATRIX[y][x] = characters[character].id;
};

const hideGameResult = (result) => {
  document.getElementById(`${result}`).style.display = "none";
};

const startGame = () => {
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
};

const createBoardSquare = (x, y, squaresCount) => {
  const square = document.createElement("div");

  board.appendChild(square);
  square.className = "square";
  square.id = `${y}${x}`;

  square.style.width = Math.floor(100 / squaresCount - 1) + "%";
  square.style.height =
    Math.floor(100 / squaresCount) + DEFAULT_CELL_HEIGHT + "px";
};

const setCharacter = (name, x, y) => {
  const square = document.getElementById(`${y}${x}`);
  const character = document.createElement("div");
  character.className = name;
  return square.appendChild(character);
};

const createUI = () => {
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
  return gameReady();
};

const getCharacterCoordinate = (character) => {
  const coordinates = [];
  MATRIX.forEach((yAxis, y) => {
    yAxis.filter((el, x) => {
      if (el === characters[character].id) {
        coordinates.push([x, y]);
      }
    });
  });
  return coordinates;
};

const isAlowedToMove = (character, x, y) => {
  if (MATRIX[y]) {
    return characters[character].allowedMoves.includes(MATRIX[y][x]);
  }
};

const getFreeCoordinates = (wolf) => {
  const [x, y] = wolf;
  const wolfCoordinates = { current: [x, y], free: [] };
  const allowedMoves = [
    { x: x + 1, y },
    { x: x - 1, y },
    { x, y: y + 1 },
    { x, y: y - 1 },
  ];

  allowedMoves.forEach((move) => {
    if (isAlowedToMove(WOLF_CELL, move.x, move.y)) {
      wolfCoordinates.free.push([move.x, move.y]);
    }
  });
  return detectClosestDirection(wolfCoordinates);
};

const detectClosestDirection = (coordinates) => {
  const [bunnyX, bunnyY] = getCharacterCoordinate(BUNNY_CELL)[0];
  const [x, y] = coordinates.current;
  const wolfCoordinates = { current: [x, y], closest: [] };
  coordinates.free.reduce((minHypotenuse, freeCoordinate) => {
    const [newX, newY] = freeCoordinate;
    // Pythagoras theorem below
    const a = Math.abs(bunnyX - newX);
    const b = Math.abs(bunnyY - newY);
    const c = Math.floor(Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2)));
    if (minHypotenuse === null || c < minHypotenuse) {
      minHypotenuse = c;
      wolfCoordinates.closest = [newX, newY];
    }
    return minHypotenuse;
  }, (minHypotenuse = null));
  return changeWolfCoordinate(wolfCoordinates);
};

const changeWolfCoordinate = (wolfCoordinates) => {
  const [x, y] = wolfCoordinates.current;
  const [newX, newY] = wolfCoordinates.closest;

  if (MATRIX[newY][newX] === BUNNY_CELL) {
    return endGame("lose");
  } else if (MATRIX[newY][newX] !== WOLF_CELL) {
    moveCharacter(WOLF_CELL, x, y, newX, newY);
  }
  return;
};

const moveCharacter = (characterCell, x, y, newX, newY) => {
  MATRIX[y][x] = FREE_CELL;
  MATRIX[newY][newX] = characterCell;
  const oldSquare = document.getElementById(`${y}${x}`);
  const square = document.getElementById(`${newY}${newX}`);
  if (oldSquare && oldSquare.childNodes[0]) {
    square.appendChild(oldSquare.childNodes[0]);
  }
};

const wolfAttack = () => {
  const wolfes = getCharacterCoordinate(WOLF_CELL);
  wolfes.forEach(getFreeCoordinates);
};

const changeBunnyCoordinate = (direction, step, fromEdge, toEdge) => {
  const [x, y] = getCharacterCoordinate(BUNNY_CELL)[0];
  let [newX, newY] = [x, y];
  let axis = direction === "x" ? x : y;

  if (axis === fromEdge) axis = toEdge;
  else axis = axis + step;

  if (direction === "x") newX = axis;
  else newY = axis;

  if (MATRIX[newY][newX] === FREE_CELL) {
    moveCharacter(BUNNY_CELL, x, y, newX, newY);
    wolfAttack();
  }
  if(MATRIX[newY][newX] === ROCK_CELL) wolfAttack();
  return checkGameStatus(newX, newY);
};

const checkGameStatus = (newX, newY) => {
  switch (MATRIX[newY][newX]) {
    case WOLF_CELL:
      return endGame("lose");
    case HOUSE_CELL:
      return endGame("won");
  }
};

const endGame = (result) => {
  board.style.opacity = "0.3";
  board.innerHTML = "";
  document.getElementById(`${result}`).style.display = "block";
};

const moveBunny = (e) => {
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
};

const gameReady = () => {
  window.addEventListener("keydown", moveBunny);
};
