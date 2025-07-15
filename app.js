const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const scoreEl = document.getElementById('score');
const startBtn = document.getElementById('start');

const COLS = 10, ROWS = 20, BLOCK = 20;
const COLORS = ['cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'];
const SHAPES = [
  [[1, 1, 1, 1]], // I
  [[2, 0, 0], [2, 2, 2]], // J
  [[0, 0, 3], [3, 3, 3]], // L
  [[4, 4], [4, 4]], // O
  [[0, 5, 5], [5, 5, 0]], // S
  [[0, 6, 0], [6, 6, 6]], // T
  [[7, 7, 0], [0, 7, 7]]  // Z
];

let board, current, score, dropInterval = 1000, dropCounter = 0, lastTime = 0, gameOver = false;

function createMatrix(w, h) {
  return Array.from({ length: h }, () => Array(w).fill(0));
}

function collide(mat, bd, offset) {
  for (let y = 0; y < mat.length; y++) {
    for (let x = 0; x < mat[y].length; x++) {
      if (mat[y][x] && (bd[y + offset.y] && bd[y + offset.y][x + offset.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function merge(mat, bd, offset) {
  mat.forEach((row, y) => row.forEach((val, x) => {
    if (val) bd[y + offset.y][x + offset.x] = val;
  }));
}

function rotate(mat) {
  return mat[0].map((_, i) => mat.map(row => row[i])).reverse();
}

function playerReset() {
  const shapeId = Math.floor(Math.random() * SHAPES.length);
  current.matrix = SHAPES[shapeId].map(row => [...row]);
  current.pos = { x: (COLS / 2 | 0) - (current.matrix[0].length / 2 | 0), y: 0 };
  if (collide(current.matrix, board, current.pos)) {
    gameOver = true;
    startBtn.disabled = false;
  }
}

function playerDrop() {
  current.pos.y++;
  if (collide(current.matrix, board, current.pos)) {
    current.pos.y--;
    merge(current.matrix, board, current.pos);
    sweep();
    playerReset();
  }
  dropCounter = 0;
}

function sweep() {
  outer: for (let y = ROWS - 1; y >= 0; y--) {
    for (let x = 0; x < COLS; x++) {
      if (board[y][x] === 0) continue outer;
    }
    board.splice(y, 1);
    board.unshift(new Array(COLS).fill(0));
    score += 10;
    scoreEl.textContent = score;
  }
}

function drawMatrix(mat, offset) {
  mat.forEach((row, y) => row.forEach((val, x) => {
    if (val) {
      ctx.fillStyle = COLORS[val - 1];
      ctx.fillRect((x + offset.x) * BLOCK, (y + offset.y) * BLOCK, BLOCK - 1, BLOCK - 1);
    }
  }));
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x: 0, y: 0 });
  drawMatrix(current.matrix, current.pos);
}

function update(time = 0) {
  const delta = time - lastTime;
  lastTime = time;
  dropCounter += delta;
  if (dropCounter > dropInterval) playerDrop();
  draw();
  if (!gameOver) requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
  if (gameOver) return;
  if (e.key === 'ArrowLeft') current.pos.x--;
  else if (e.key === 'ArrowRight') current.pos.x++;
  else if (e.key === 'ArrowDown') playerDrop();
  else if (e.key === 'q') current.matrix = rotate(current.matrix);
  if (collide(current.matrix, board, current.pos)) {
    if (e.key === 'ArrowLeft') current.pos.x++;
    else if (e.key === 'ArrowRight') current.pos.x--;
    else if (e.key === 'q') current.matrix = rotate(rotate(rotate(current.matrix)));
  }
});

startBtn.addEventListener('click', () => {
  board = createMatrix(COLS, ROWS);
  current = { matrix: null, pos: { x: 0, y: 0 } };
  score = 0;
  scoreEl.textContent = score;
  gameOver = false;
  playerReset();
  update();
  startBtn.disabled = true;
});
