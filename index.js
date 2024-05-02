const tetrominos = {
  "I": [
    [0,0,0,0],
    [1,1,1,1],
    [0,0,0,0],
    [0,0,0,0]
  ],
  "J": [
    [1,0,0],
    [1,1,1],
    [0,0,0],
  ],
  "L": [
    [0,0,1],
    [1,1,1],
    [0,0,0],
  ],
  "O": [
    [1,1],
    [1,1],
  ],
  "S": [
    [0,1,1],
    [1,1,0],
    [0,0,0],
  ],
  "Z": [
    [1,1,0],
    [0,1,1],
    [0,0,0],
  ],
  "T": [
    [0,1,0],
    [1,1,1],
    [0,0,0],
  ]
};

const colors = {
  "I": "#00ffff",
  "J": "#0000ff",
  "L": "#ff7f00",
  "O": "#ffff00",
  "S": "#00ff00",
  "T": "#800080",
  "Z": "#ff0000",
};

// rotate matrix with shape data
function rotate(matrix) {
  return matrix.map((row, i) => row.map((val, j) => matrix[matrix.length-1-j][i]));
}

// generate new sequence with shapes
function generateSequence() {
  let sequence = ["I", "J", "L", "O", "S", "T", "Z"];

  tetrominoSequence = sequence.sort(() => Math.random() - 0.5);
}

// get the next tetromino in the sequence
function changeTetromino() {
  if (tetrominoSequence.length === 0) {
    generateSequence();
  }

  const name = tetrominoSequence.pop();
  const matrix = tetrominos[name];

  return {
    name: name,      
    matrix: matrix,
    row: name === "I" ? -1 : -2,
    col: name === "O" ? 4 : 3
  };
}

// check if move is allowed
function isAllowed(matrix, cellRow, cellCol) {
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row].length; col++) {
      if (matrix[row][col] && (
          // outside the board
          cellCol + col < 0 ||
          cellCol + col >= board[0].length ||
          cellRow + row >= board.length ||
          // collides with another piece
          board[cellRow + row][cellCol + col])
        ) {
        return false;
      }
    }
  }
  return true;
}

// place the tetromino on the board
function placeTetromino() {
  for (let row = 0; row < currentTetromino.matrix.length; row++) {
    for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
      if (currentTetromino.matrix[row][col]) {
        if (currentTetromino.row + row < 0) {
          return showGameOver();
        }
        board[currentTetromino.row + row][currentTetromino.col + col] = currentTetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  for (let row = board.length - 1; row >= 0; ) {
    if (board[row].every(cell => Boolean(cell))) {
      gameScore += 100;
      scoreDiv.innerHTML = gameScore;
      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < board[r].length; c++) {
          board[r][c] = board[r-1][c];
        }
      }
    }
    else {
      row--;
    }
  }

  // change current shape to next and get new next shape
  currentTetromino = nextTetromino;
  nextTetromino= changeTetromino();
}

// stop the game and display game over message
function showGameOver() {
  cancelAnimationFrame(animationFrame);
  gameOver = true;

  context.fillStyle = "black";
  context.globalAlpha = 0.8;
  context.fillRect(0, canvas.height / 2 - 50, canvas.width, 100);
  
  context.textBaseline = "middle";
  context.textAlign = "center";
  context.font = "80px VT323";
  context.globalAlpha = 1;
  context.fillStyle = "white";
  context.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);  
}

const canvas = document.getElementById("game");
const context = canvas.getContext("2d");
const nextCanvas = document.getElementById("nextShape");
const nextContext = nextCanvas.getContext("2d");
const scoreDiv = document.getElementById("score");
const gridWidth = 32;

let tetrominoSequence = [];
let board = [];
let nextShapeGrid = [];


// create empty board
for (let row = -2; row < 20; row++) {
  board[row] = [];
  for (let col = 0; col < 10; col++) {
    board[row][col] = 0;
  }
}

// create empty next shape grid
for (let row = 0; row < 4; row++){
  nextShapeGrid[row] = [];
  for (let col = 0; col < 4; col++){
    nextShapeGrid[row][col] = 0;
  }
}


let count = 0;
let currentTetromino = changeTetromino();
let nextTetromino = changeTetromino();
let animationFrame;
let gameOver = false;
let gameScore = 0;

function gameLoop() {
  animationFrame = requestAnimationFrame(gameLoop);
  context.clearRect(0,0,canvas.width,canvas.height);
  nextContext.clearRect(0,0,nextCanvas.width,nextCanvas.height);

  // draw the board grid
  context.lineWidth = 0.5;
  context.strokeStyle = "rgb(120, 120, 120)";
  for (var x = 0; x < 320; x += 32) {
    for (var y = 0; y < 640; y += 32) {
      context.strokeRect(x, y, 32, 32);
    }
  }

  // draw the next shape grid
  nextContext.lineWidth = 0.5;
  nextContext.strokeStyle = "rgb(120, 120, 120)";
  for (var x = 0; x < 128; x += 32) {
    for (var y = 0; y < 128; y += 32) {
      nextContext.strokeRect(x, y, 32, 32);
    }
  }

  // draw the board
  for (let row = 0; row < 20; row++) {
    for (let col = 0; col < 10; col++) {
      if (board[row][col]) {
        context.fillStyle = colors[board[row][col]];
        context.fillRect(col * gridWidth, row * gridWidth, gridWidth-1.5, gridWidth-1.5);
      }
    }
  }

  // draw the next shape
  let nextName = nextTetromino.name;
  let nextColor = colors[nextName];
  for (let row = 0; row < nextTetromino.matrix[0].length; row++) {
    for (let col = 0; col < nextTetromino.matrix[0].length; col++) {
      if (nextTetromino.matrix[row][col]) {
        nextContext.fillStyle = nextColor;
        nextName === "O" ? 
        nextContext.fillRect((col+1) * gridWidth, (row+1) * gridWidth, gridWidth-1.5, gridWidth-1.5) :
        nextContext.fillRect(col * gridWidth, (row+1) * gridWidth, gridWidth-1.5, gridWidth-1.5);
      }
    }
  }

  // draw current tetromino
  if (currentTetromino != null) {
    if (count++ > 24) {
      currentTetromino.row++;
      count = 0;
      if (!isAllowed(currentTetromino.matrix, currentTetromino.row, currentTetromino.col)) {
        currentTetromino.row--;
        placeTetromino();
      }
    }

    context.fillStyle = colors[currentTetromino.name];
    for (let row = 0; row < currentTetromino.matrix.length; row++) {
      for (let col = 0; col < currentTetromino.matrix[row].length; col++) {
        if (currentTetromino.matrix[row][col]) {
          context.fillRect((currentTetromino.col + col) * gridWidth, (currentTetromino.row + row) * gridWidth, gridWidth-1.5, gridWidth-1.5);
        }
      }
    }
  }
}

document.addEventListener("keydown", function(e) {
  if (gameOver) return;

  if (e.code === "ArrowLeft") {
    if (isAllowed(currentTetromino.matrix, currentTetromino.row, currentTetromino.col-1)) {
      currentTetromino.col -= 1;
    }
  }

  if (e.code === "ArrowRight") {
    if (isAllowed(currentTetromino.matrix, currentTetromino.row, currentTetromino.col+1)) {
      currentTetromino.col += 1;
    }
  }

  if (e.code === "ArrowUp") {
    const matrix = rotate(currentTetromino.matrix);
    if (isAllowed(matrix, currentTetromino.row, currentTetromino.col)) {
      currentTetromino.matrix = matrix;
    }
  }

  if(e.code === "ArrowDown") {
    gameScore += 1;
    scoreDiv.innerHTML = gameScore;
    const row = currentTetromino.row + 1;

    if (!isAllowed(currentTetromino.matrix, row, currentTetromino.col)) {
      currentTetromino.row = row - 1;

      placeTetromino();
      return;
    }

    currentTetromino.row = row;
  }
});

// start the game
window.requestAnimationFrame(gameLoop);
