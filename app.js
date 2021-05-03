const canvas = document.getElementById("canvas");
const width = canvas.width;
const height = canvas.height;
const gameArea = canvas.getContext("2d");

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

const startLink = document.getElementById("startLink");
const menuLink = document.getElementById("menuLink");
const devLink = document.getElementById("devLink");
const rulesLink = document.getElementById("rulesLink");

const invaderWidth = 55;
const invaderHeight = 55;
const invaderMoveDelay = 800;
const invaderDelayDifficulty = 50;
const invaderScorePoints = 125;

const playerLives = 3;
const playerSpeed = 5;
const bulletSpeed = 15;
const invaderSpeed = 20;

let logo = new Image();
logo.src = "img/logo.jpg";
let invaderImg = new Image();
invaderImg.src = "img/invader01.png";
let invaderAltImg = new Image();
invaderAltImg.src = "img/invader02.png";
let playerImg = new Image();
playerImg.src = "img/player.png";

let keyMaps = { left: false, right: false };
let gameLoop = setInterval(loop, 30);
let gameRunning = false;
let result = null;

let player = { x: 0, y: 420, w: 50, h: 30 };
let playerLivesCurrent = playerLives;
let playerBullet = null;
let playerScore = 0;

let invaderArray = [];
let invaderBullets = [];
let invAltImg = false;
let directionInvader = 1;
let invaderChangeDir = false;
let lastTimeInvaderMove = 0;
let currentInvaderDelay = 0;
let lastTimeInvaderShoot = 0;
let currentInvaderShootDelay = 0;

function mainMenu() {
	gameArea.drawImage(logo, width / 2 - 300, height / 2 - 450, 600, 600);
}

function updateLinks() {
  startLink.classList.add("ingame");
  menuLink.classList.add("ingame");
  devLink.classList.add("ingame");
  rulesLink.classList.add("ingame");
  startLink.innerHTML = startLink.innerHTML.replace("START", "RESET");
}

function drawText(text, size, color, posX, posY) {
  gameArea.font = `${size}px "Press Start 2P"`;
  gameArea.strokeStyle = "#000000";
  gameArea.lineWidth = 8;
  gameArea.strokeText(text, posX, posY);
  gameArea.fillStyle = `${color}`;
  gameArea.fillText(text, posX, posY);
}

function drawLine() {
  gameArea.beginPath();
  gameArea.moveTo(0, height - 120);
  gameArea.lineTo(width, height - 120);
  gameArea.strokeStyle = "#22CC00";
  gameArea.lineWidth = 2;
  gameArea.stroke();
}

function resetGame() {
  player = { x: 0, y: 420, w: 50, h: 30 };
  keyMaps = { left: false, right: false };
  playerBullet = null;
  invaderBullets = [];
  invaderArray = [];
  directionInvader = 1;
  invaderChangeDir = false;
  lastTimeInvaderMove = 0;
  currentInvaderDelay = invaderMoveDelay;
  lastTimeInvaderShoot = Date.now();
  currentInvaderShootDelay = Math.floor(Math.random() * 3 + 1) * 1000;
  playerLivesCurrent = playerLives;
  result = null;
  playerScore = 0;
}

function startGame() {
  updateLinks();
  resetGame();
  createInvaders();
  gameRunning = true;
}

function endGame(endResult) {
  gameRunning = false;
  result = endResult;
  if (endResult === "VICTORY") {
    playSound("Victory");
  } else if (endResult === "DEFEAT") {
    playSound("Defeat");
  }
}

function loop() {
  update();
  draw();
}

function update() {
  if (gameRunning) {
    movePlayer();
    moveBullets();
    moveInvaders();
    detectPlayerBulletCollision();
    detectInvaderBulletCollision();
    invaderShoot();
  }
}

function drawPlayerLives() {
  drawText("LIVES", 15, "#FFFFFF", 40, height - 80);
  for (let i = 0; i < playerLivesCurrent - 1; i++) {
    gameArea.drawImage(
      playerImg,
      player.w + 70 + i * (player.w + 10),
      height - 110,
      player.w,
      player.h
    );
  }
}

function drawInvader(){
  for (let i = 0; i < invaderArray.length; i++) {
    gameArea.drawImage(
      invaderArray[i].altImg ? invaderImg : invaderAltImg,
      invaderArray[i].x,
      invaderArray[i].y,
      invaderWidth,
      invaderHeight
    );
  }
}

function drawPlayer(){
  gameArea.drawImage(playerImg, player.x, player.y, player.w, player.h);
}

function drawBullets(){
  for (let i = 0; i < invaderBullets.length; i++) {
    gameArea.fillStyle = "white";
    gameArea.fillRect(invaderBullets[i].x, invaderBullets[i].y, 5, 10);
  }

  if (playerBullet) {
    gameArea.fillStyle = "#22CC00";
    gameArea.fillRect(playerBullet.x, playerBullet.y, 5, 10);
  }
}

function drawScore(){
  drawText(`SCORE = ${playerScore}`, 15, "#FFFFFF", width - 250, height - 80);
}

function drawResult(){
  if (result) {
    drawText(`${result}`, 60, "#FFE539", width / 2 - 195, height / 2);
  }
}

function draw() {
  gameArea.clearRect(0, 0, width, height);
  if (gameRunning || result) {
    drawInvader();
    drawPlayer();
    drawBullets();
    drawLine();
    drawPlayerLives();
    drawScore();
    drawResult();
  } else {
    mainMenu();
  }
}

function movePlayer() {
  let direction = 0;

  if (keyMaps.right) {
    direction = 1;
  } else if (keyMaps.left) {
    direction = -1;
  }

  player.x += direction * playerSpeed;

  if (player.x < 0) {
    player.x = 0;
  } else if (player.x + player.w > 800) {
    player.x = width - player.w;
  }
}

function shoot() {
  if (gameRunning && !playerBullet) {
    const startPosX = player.x + player.w / 2 - 5;
    const startPosY = player.y;
    playerBullet = { x: startPosX, y: startPosY };
    playSound("PlayerShoot");
  }
}

function invaderShoot() {
  if (currentInvaderShootDelay <= Date.now() - lastTimeInvaderShoot) {
    lastTimeInvaderShoot = Date.now();
    currentInvaderShootDelay = Math.floor(Math.random() * 3 + 1) * 1000;
    let index = Math.floor(Math.random() * invaderArray.length);
    const startPosX = invaderArray[index].x + invaderWidth / 2;
    const startPosY = invaderArray[index].y + invaderHeight;
    invaderBullets.push({ x: startPosX, y: startPosY });
    playSound("EnemyShoot");
  }
}

function moveBullets() {
  for (let i = invaderBullets.length - 1; i >= 0; i--) {
    invaderBullets[i].y += bulletSpeed;
    if (invaderBullets[i].y > player.y + player.h) {
      invaderBullets.splice(i, 1);
    }
  }

  if (playerBullet) {
    playerBullet.y -= bulletSpeed;
    if (playerBullet.y <= 0) {
      playerBullet = null;
    }
  }
}

function createInvaders() {
	let altImg = true;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 7; j++) {
      altImg = !altImg;
      invaderArray.push({
        x: j * (invaderWidth + 15) + 125,
        y: i * invaderHeight,
        altImg : altImg,
      });
    }
  }
}

function moveInvaders() {
  if (currentInvaderDelay <= Date.now() - lastTimeInvaderMove) {
    lastTimeInvaderMove = Date.now();

    if (invaderChangeDir) {
      directionInvader = -directionInvader;
      invaderChangeDir = false;
      for (let i = invaderArray.length - 1; i >= 0; i--) {
        invaderArray[i].altImg = !invaderArray[i].altImg;
        invaderArray[i].y += invaderSpeed;
        if (invaderArray[i].y >= player.y - player.h) {
          invaderArray[i].y -= invaderSpeed;
          endGame("DEFEAT");
          break;
        }
      }
    
    } else {
      for (let i = 0; i < invaderArray.length; i++) {
        invaderArray[i].altImg = !invaderArray[i].altImg;
        invaderArray[i].x += invaderSpeed * directionInvader;
        if (
          invaderArray[i].x >= width - invaderWidth ||
          invaderArray[i].x <= invaderSpeed
        ) {
          invaderChangeDir = true;
        }
      }
    }
  }
}

function playSound(event) {
  const sound = document.getElementById(`sound${event}`);
  sound.pause(); 
  sound.currentTime = 0; 
  sound.play(); 
}

function detectPlayerBulletCollision() {
  if (playerBullet) {
    for (let i = invaderArray.length - 1; i >= 0; i--) {
      let invader = invaderArray[i];
      if (
        playerBullet.x >= invader.x &&
        playerBullet.x <= invader.x + invaderWidth &&
        playerBullet.y >= invader.y &&
        playerBullet.y <= invader.y + invaderHeight
      ) {
        invaderArray.splice(i, 1);
        playSound("EnemyDefeated");
        playerScore += invaderScorePoints;
        playerBullet = null;
        currentInvaderDelay -= invaderDelayDifficulty;
        break;
      }
    }

    if (invaderArray.length == 0) {
      endGame("VICTORY");
    }
  }
}

function detectInvaderBulletCollision() {
  for (let i = invaderBullets.length - 1; i >= 0; i--) {
    let bullet = invaderBullets[i];
    if (
      bullet.x > player.x &&
      bullet.x <= player.x + player.w &&
      bullet.y > player.y &&
      bullet.y <= player.y + player.h
    ) {
      invaderBullets.splice(i, 1);
      playerLivesCurrent -= 1;
      playSound("PlayerLifeHit");
      if (playerLivesCurrent == 0) {
        endGame("DEFEAT");
      }
    }
  }
}

function keyUp(event) {
  switch (event.key) {
    case "ArrowRight":
    case "D":
    case "d":
      keyMaps.right = false;
      break;
    case "ArrowLeft":
    case "A":
    case "a":
      keyMaps.left = false;
      break;
  }
}

function keyDown(event) {
  switch (event.key) {
    case "ArrowRight":
    case "D":
    case "d":
      keyMaps.right = true;
      break;
    case "ArrowLeft":
    case "A":
    case "a":
      keyMaps.left = true;
      break;
    case "ArrowUp":
    case "W":
    case "w":
    case " ":
      shoot();
      break;
  }
}
