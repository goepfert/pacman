import { MovingDirection } from './MovingDirection.js';

const createEnemy = (x, y, tileSize, velocity, tileMap) => {
  let normalGhost;
  let scaredGhost1;
  let scaredGhost2;
  let image;

  let movingDirection = getNewMovingDirection();
  let newMovingDirection = null;
  const min = 10;
  const max = 50;
  let directionTimer = random(min, max);

  const scaredAboutToExpireTimerDefault = 10;
  let scaredAboutToExpireTimer = scaredAboutToExpireTimerDefault;

  (function loadEnemyImages() {
    normalGhost = new Image();
    normalGhost.src = '../images/ghost.png';

    scaredGhost1 = new Image();
    scaredGhost1.src = '../images/scaredGhost.png';

    scaredGhost2 = new Image();
    scaredGhost2.src = '../images/scaredGhost2.png';

    image = normalGhost;
  })();

  function draw(ctx, pause, tileMap) {
    if (!pause) {
      move();
      changeDirection();
    }
    setImage(ctx, tileMap);
  }

  function collideWith(pacman) {
    const pacmanX = pacman.getPosition().x;
    const pacmanY = pacman.getPosition().y;
    const size = tileSize / 2;

    if (x + size > pacmanX && x < pacmanX + size && y + size > pacmanY && y < pacmanY + size) {
      return true;
    } else {
      return false;
    }
  }

  function collideWithCoordinate(_x, _y) {
    const pacmanX = _x;
    const pacmanY = _y;
    const size = tileSize / 2;

    if (x + size > pacmanX && x < pacmanX + size && y + size > pacmanY && y < pacmanY + size) {
      return true;
    } else {
      return false;
    }
  }

  function setImage(ctx, tileMap) {
    if (tileMap.getPowerDotActive()) {
      setImageWhenPowerDotIsActive(tileMap);
    } else {
      image = normalGhost;
    }
    ctx.drawImage(image, x, y, tileSize, tileSize);
  }

  function setImageWhenPowerDotIsActive(tileMap) {
    if (tileMap.getPowerDotAboutToExpire()) {
      scaredAboutToExpireTimer--;
      if (scaredAboutToExpireTimer === 0) {
        scaredAboutToExpireTimer = scaredAboutToExpireTimerDefault;
        if (image == scaredGhost1) {
          image = scaredGhost2;
        } else {
          image = scaredGhost1;
        }
      }
    } else {
      image = scaredGhost1;
    }
  }

  function changeDirection() {
    directionTimer--;
    if (directionTimer == 0) {
      newMovingDirection = getNewMovingDirection();
      directionTimer = random(min, max);
    }

    if (newMovingDirection != null && newMovingDirection != movingDirection) {
      if (Number.isInteger(x / tileSize) && Number.isInteger(y / tileSize)) {
        if (!tileMap.didCollideWithEnv(x, y, newMovingDirection)) {
          movingDirection = newMovingDirection;
          newMovingDirection = null;
        }
      }
    }
  }

  function move() {
    //Check for collision with current direction
    if (!tileMap.didCollideWithEnv(x, y, movingDirection)) {
      switch (movingDirection) {
        case MovingDirection.up:
          y -= velocity;
          break;
        case MovingDirection.down:
          y += velocity;
          break;
        case MovingDirection.left:
          x -= velocity;
          break;
        case MovingDirection.right:
          x += velocity;
          break;
      }
    } else {
      //movingDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length);
    }
  }

  function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function getNewMovingDirection() {
    return Math.floor(Math.random() * Object.keys(MovingDirection).length);
  }

  return {
    draw,
    collideWith,
    collideWithCoordinate,
  };
};

export { createEnemy };
