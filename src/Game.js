/**
 * heavily inspired by https://github.com/CodingWith-Adam/pacman/blob/main/src/Game.js
 */

import { createTileMap } from './TileMap.js';

const tileSize = 32;
const velocity = 2;

const comment = document.getElementById('comment');
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tileMap;
let pacman;
let enemies;
let gameOver;
let gameWin;

const gameOverSound = new Audio('sounds/gameOver.wav');
const gameWinSound = new Audio('sounds/gameWin.wav');

let gameID = 0;

function init() {
  tileMap = createTileMap(tileSize);
  tileMap.setCanvasSize(canvas);
  pacman = tileMap.getPacman(velocity);
  enemies = tileMap.getEnemies(velocity);
  gameOver = false;
  gameWin = false;
}

async function gameLoop() {
  tileMap.draw(ctx);
  pacman.draw(ctx, pause(), enemies, tileMap);
  enemies.forEach((enemy) => enemy.draw(ctx, pause(), tileMap));
  checkGameOver();
  checkGameWin();

  if (gameOver || gameWin) {
    clearInterval(gameID);
    await sleep(4300);
    comment.classList.remove('invisible');
    window.addEventListener('keydown', gameStart);
  }
}

function checkGameOver() {
  if (!gameOver) {
    gameOver = isGameOver();
    if (gameOver) {
      gameOverSound.currentTime = 0;
      gameOverSound.play();
    }
  }
}

function checkGameWin() {
  if (!gameWin) {
    gameWin = tileMap.didWin();
    if (gameWin) {
      gameWinSound.currentTime = 0;
      gameWinSound.play();
    }
  }
}

function isGameOver() {
  return enemies.some((enemy) => {
    return !tileMap.getPowerDotActive() && enemy.collideWith(pacman);
  });
}

function pause() {
  return !pacman.madeFirstMove() || gameOver || gameWin;
}

window.onload = () => {
  init();
  gameID = setInterval(gameLoop, 1000 / 65);
};

function gameStart(event) {
  if (event.code == 'Space') {
    comment.classList.add('invisible');
    window.removeEventListener('keydown', gameStart);
    init();
    gameID = setInterval(gameLoop, 1000 / 650);
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
