import { createPacman } from './Pacman.js';
import { createEnemy } from './Enemy.js';
import { MovingDirection } from './MovingDirection.js';

const createTileMap = (tileSize) => {
  //1 - wall
  //0 - dots
  //4 - pacman
  //5 - empty space
  //6 - enemy
  //7 - power dot
  const map = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
    [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  const yellowDot = new Image();
  yellowDot.src = 'images/yellowDot.png';

  const pinkDot = new Image();
  pinkDot.src = 'images/pinkDot.png';

  const wall = new Image();
  wall.src = 'images/wall.png';

  let powerDot = yellowDot;
  let powerDotAnimationTimerDefault = 30;
  let powerDotAnimationTimer = powerDotAnimationTimerDefault;

  const wakaSound = new Audio('../sounds/waka.wav');
  const powerDotSound = new Audio('../sounds/power_dot.wav');

  let powerDotActive = false;
  let powerDotAboutToExpire = false;

  let timers = [];

  function getPowerDotActive() {
    return powerDotActive;
  }

  function getPowerDotAboutToExpire() {
    return powerDotAboutToExpire;
  }

  function draw(ctx) {
    map.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 1:
            ctx.drawImage(wall, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 0:
            ctx.drawImage(yellowDot, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
            break;
          case 7:
            drawPowerDot(ctx, colIdx, rowIdx);
            break;
          default:
            drawBlank(ctx, rowIdx, colIdx);
            break;
        }
      });
    });
  }

  function drawPowerDot(ctx, colIdx, rowIdx) {
    powerDotAnimationTimer--;
    if (powerDotAnimationTimer <= 0) {
      powerDotAnimationTimer = powerDotAnimationTimerDefault;
      powerDot = powerDot == pinkDot ? yellowDot : pinkDot;
    }

    ctx.drawImage(powerDot, colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
  }

  function drawBlank(ctx, rowIdx, colIdx) {
    ctx.fillStyle = 'black';
    ctx.fillRect(colIdx * tileSize, rowIdx * tileSize, tileSize, tileSize);
  }

  function getPacman(velocity) {
    let pacman;
    map.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 4:
            //map[rowIdx][colIdx] = 0; // Replace with dot
            // tile = 0; wrong
            pacman = createPacman(colIdx * tileSize, rowIdx * tileSize, tileSize, velocity, this);
            // return createPacman; wrong
            break;
        }
      });
    });

    return pacman;
  }

  function getEnemies(velocity) {
    const enemies = [];

    map.forEach((row, rowIdx) => {
      row.forEach((tile, colIdx) => {
        switch (tile) {
          case 6:
            map[rowIdx][colIdx] = 0; // Replace with dot
            enemies.push(createEnemy(colIdx * tileSize, rowIdx * tileSize, tileSize, velocity, this));
            break;
        }
      });
    });

    return enemies;
  }

  function didCollideWithEnv(x, y, movingDirection) {
    if (movingDirection == null) {
      return;
    }

    if (Number.isInteger(x / tileSize) && Number.isInteger(y / tileSize)) {
      let nextColumn = 0;
      let nextRow = 0;

      switch (movingDirection) {
        case MovingDirection.right:
          nextColumn = x + tileSize;
          nextColumn = nextColumn / tileSize;
          nextRow = y / tileSize;
          break;
        case MovingDirection.left:
          nextColumn = x - tileSize;
          nextColumn = nextColumn / tileSize;
          nextRow = y / tileSize;
          break;
        case MovingDirection.up:
          nextRow = y - tileSize;
          nextRow = nextRow / tileSize;
          nextColumn = x / tileSize;
          break;
        case MovingDirection.down:
          nextRow = y + tileSize;
          nextRow = nextRow / tileSize;
          nextColumn = x / tileSize;
          break;
      }

      // console.log(nextRow, nextColumn);
      const tile = map[nextRow][nextColumn];
      if (tile === 1) {
        return true;
      }
    }

    return false;
  }

  function setCanvasSize(canvas) {
    canvas.width = map[0].length * tileSize;
    canvas.height = map.length * tileSize;
  }

  function didWin() {
    const dotsLeft = map.flat().filter((tile) => tile == 0).length;

    return dotsLeft === 0;
  }

  function eatDot(x, y) {
    const row = y / tileSize;
    const column = x / tileSize;

    if (Number.isInteger(row) && Number.isInteger(column)) {
      const tile = map[row][column];
      switch (tile) {
        case 0:
          wakaSound.currentTime = 0;
          wakaSound.play();
          map[row][column] = 5;
          break;
        case 7:
          powerDotSound.currentTime = 0;
          powerDotSound.play();
          powerDotActive = true;
          powerDotAboutToExpire = false;
          timers.forEach((timer) => clearTimeout(timer));
          timers = [];
          let powerDotTimer = setTimeout(() => {
            powerDotActive = false;
            powerDotAboutToExpire = false;
          }, 6000);
          timers.push(powerDotTimer);
          let powerDotTimerAboutToExpire = setTimeout(() => {
            powerDotAboutToExpire = true;
          }, 3000);
          timers.push(powerDotTimerAboutToExpire);
          map[row][column] = 5;
          break;
      }
    }
  }

  return {
    getPowerDotActive,
    getPowerDotAboutToExpire,
    draw,
    getPacman,
    getEnemies,
    didCollideWithEnv,
    setCanvasSize,
    didWin,
    eatDot,
  };
};

export { createTileMap };
