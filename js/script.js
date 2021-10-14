const board = document.querySelector(".board");
const matrix = createMatrix(getMatrixLength());

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

function setBunnyPosition() {
  const [x, y] = getRandomCoordinates(getMatrixLength());
  return (matrix[x][y] = 1);
}

function setWolfPosition() {
  const [x, y] = getRandomCoordinates(getMatrixLength());
  return (matrix[x][y] = 2);
}

function setRockPosition() {
  const [x, y] = getRandomCoordinates(getMatrixLength());
  return (matrix[x][y] = 3);
}

function setHousePosition() {
  const [x, y] = getRandomCoordinates(getMatrixLength());
  return (matrix[x][y] = 4);
}

function startGame() {
  const wolfsAndRocksCount = (getMatrixLength() * 40) / 100;
  for (let i = 0; i < wolfsAndRocksCount; i++) {
    setWolfPosition();
    setRockPosition();
  }

  setBunnyPosition();
  setHousePosition();

  createUI();
}

function createBoardSquare() {
  const square = document.createElement("div");

  board.appendChild(square);
  square.className = "square";
  return square;
}

function setWolf() {
  const square = createBoardSquare();
  const wolf = document.createElement("div");
  wolf.className = "wolf";
  return square.appendChild(wolf);
}

function setBunny() {
  const square = createBoardSquare();
  const bunny = document.createElement("div");
  bunny.className = "bunny";
  return square.appendChild(bunny);
}

function setRock() {
  const square = createBoardSquare();
  const rock = document.createElement("div");
  rock.className = "rock";
  return square.appendChild(rock);
}

function setHouse() {
  const square = createBoardSquare();
  const house = document.createElement("div");
  house.className = "house";
  return square.appendChild(house);
}

function createUI() {
  board.innerHTML = "";

  matrix.forEach((y) =>
    y.forEach((value) => {
      switch (value) {
        case 0:
          createBoardSquare();
          break;
        case 1:
          setBunny();
          break;
        case 2:
          setWolf();
          break;
        case 3:
          setRock();
          break;
        case 4:
          setHouse();
          break;
      }
    })
  );
  return isReady();
}

function getBunnyPosition() {
  const y = matrix.findIndex(arr => arr.includes(1));
  const x = matrix[y].findIndex(el => el === 1)
  return [x, y]
}

function moveLeft(bunny) {
  const [x, y] = getBunnyPosition();
  if(x !== 0 && matrix[y][x - 1] === 0){
      matrix[y].splice(x, 1, 0);
      matrix[y].splice(x - 1, 1, 1);
      console.log(matrix);
  }
}

function moveBunny(e) {
  const bunny = document.querySelector("bunny");
  switch (e.keyCode) {
    case 37:
      moveLeft(bunny);
      break;
    case 39:
      moveRight(bunny);
      break;
    case 38:
      moveUp(bunny);
      break;
    case 40:
      moveDown(bunny);
      break;
  }
}

function isReady() {
  window.addEventListener("keydown", moveBunny);
}
