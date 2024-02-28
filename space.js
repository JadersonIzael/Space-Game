//board
let tileSize = 32;
let rows = 16;
let columns = 16;

let board;
let boardWidth = tileSize * columns; // 32 * 16
let boardHeight = tileSize * rows; // 32 * 16
let context;

//ship
let shipWidth = tileSize * 2;
let shipHeight = tileSize;
let shipX = tileSize * columns / 2 - tileSize;
let shipY = tileSize * rows - tileSize * 2;

let ship = {
  x: shipX,
  y: shipY,
  width: shipWidth,
  height: shipHeight
}

let shipImg;
let shipVelocityX = tileSize; //ship moving speed

//aliens
let alienArray = [];
let alienWidth = tileSize * 2;
let alienHeight = tileSize;
let alienX = tileSize;
let alienY = tileSize;
let alienImg;

let alienRows = 2;
let alienColumns = 3;
let alienCount = 0; //number of aliens to defeat
let alienVelocityX = 1; //alien moving speed

//bullets
let bulletArray = [];
let bulletVelocityY = -10; //bullet moving speed
let rate = 375; // cadence of the bullet in ms

let lastChangebullet;
let bulletDuration = 3000;
let arrayCurrentAndLastRandomNumber = [0, 0];

var counter = 0;

//other
let score = 0;
let gameOver = false;

let clickCount = 1;

//
var shotFunctions = [singleShot, doubleShot];

window.onload = function () {
  board = document.getElementById("board");
  board.width = boardWidth;
  board.height = boardHeight;
  context = board.getContext("2d"); //used for drawing on the board

  //draw initial ship
  context.fillStyle = "green";
  context.fillRect(ship.x, ship.y, ship.width, ship.height);

  //load images
  shipImg = new Image();
  shipImg.src = "./ship.png";
  shipImg.onload = function () {
    context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);
  }

  alienImg = new Image();
  alienImg.src = "./alien.png";
  createAliens();

  requestAnimationFrame(update);
  document.addEventListener("keydown", moveShip);

  // Wait a amount of seconds to the next shoot (Only Works Single shoot mode) RATE variable
  let lastShootTime = 0;
  let isFirstTime = true;

  document.addEventListener("keyup", function (event) {
    let now = Date.now();
    if (isFirstTime || now - lastShootTime > rate) {
      shoot(event);
      lastShootTime = now;
      isFirstTime = false;
    }
  });
}

function update() {
  requestAnimationFrame(update);

  if (gameOver) {
    return;
  }

  context.clearRect(0, 0, board.width, board.height);

  //ship
  context.drawImage(shipImg, ship.x, ship.y, ship.width, ship.height);

  //alien
  for (let i = 0; i < alienArray.length; i++) {
    let alien = alienArray[i];
    if (alien.alive) {
      alien.x += alienVelocityX; // alien move 

      //if alien touches the borders
      if (alien.x + alien.width >= board.width || alien.x <= 0) {
        alienVelocityX *= -1;
        alien.x += alienVelocityX * 2;

        //move all aliens up by one row
        for (let j = 0; j < alienArray.length; j++) {
          alienArray[j].y += alienHeight;
        }
      }
      context.drawImage(alienImg, alien.x, alien.y, alien.width, alien.height);

      if (alien.y >= ship.y) {
        gameOver = true;
      }
    }
  }

  //Get change bullet button
  bulletSelectorButton = document.getElementById("bullet-selector");

  // let randomNumber = Math.floor(Math.random() * 2) + 1;
  // let timeNow = Date.now();

  // if (arrayCurrentAndLastRandomNumber[0] === 0) {
  //   arrayCurrentAndLastRandomNumber[0] = randomNumber;
  //   lastChangebullet = Date.now(); // Receive the last change time
  // } else {
  //   arrayCurrentAndLastRandomNumber[1] = randomNumber;
  // }

  // var result = timeNow - lastChangebullet;

  // if (result > bulletDuration) {

  //   if (arrayCurrentAndLastRandomNumber[1] === 1) {
  //     singleShot();
  //     lastChangebullet = Date.now(); // Receive the last change time
  //     arrayCurrentAndLastRandomNumber[0] = randomNumber;
  //     bulletSelectorButton.innerHTML = '<img src="bullet_rifle.png" class="img_shot" alt="">';

  //   } else if (arrayCurrentAndLastRandomNumber[1] === 2) {
  //     doubleShot();
  //     lastChangebullet = Date.now(); // Receive the last change time
  //     arrayCurrentAndLastRandomNumber[0] = randomNumber;
  //     bulletSelectorButton.innerHTML = '<img src="double-bullet.png" class="img_shot" alt="">';
  //   }
  // } else {
  //   if (arrayCurrentAndLastRandomNumber[0] === 1) {
  //     singleShot();
  //   } else if (arrayCurrentAndLastRandomNumber[0] === 2) {
  //     doubleShot();
  //   }
  // }

  if (score >= 7600) {
    doubleShot();
    bulletSelectorButton.innerHTML = '<img src="double-bullet.png" class="img_shot" alt="">';
  }
  else {
    singleShot();
    bulletSelectorButton.innerHTML = '<img src="bullet_rifle.png" class="img_shot" alt="">';
  }

  //clear bullets
  while (bulletArray.length > 0 && (bulletArray[0].used || bulletArray[0].y < 0)) {
    bulletArray.shift(); //removes the first element of the array
  }

  //next level
  if (alienCount == 0) {
    //increase the number of aliens in columns and rows by 1
    score += alienColumns * alienRows * 100; //bonus points :)
    alienColumns = Math.min(alienColumns + 1, columns / 2 - 2); //cap at 16/2 -2 = 6
    alienRows = Math.min(alienRows + 1, rows - 4);  //cap at 16-4 = 12
    if (alienVelocityX > 0) {
      alienVelocityX += 0.2; //increase the alien movement speed towards the right
    }
    else {
      alienVelocityX -= 0.2; //increase the alien movement speed towards the left
    }
    alienArray = [];
    bulletArray = [];
    createAliens();
  }

  //score
  context.fillStyle = "white";
  context.font = "16px courier";
  context.fillText(score, 5, 20);
}

function singleShot() {
  //single shoot
  rate = 375; //slow down the rate of the shoot
  lastChangebullet = Date.now(); // Receive the last change time
  for (let i = 0; i < bulletArray.length; i++) {
    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY;
    context.fillStyle = "red";
    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

    bulletCollision(bullet);
  }
}

function doubleShot() {
  //double shoot
  rate = 0; // increase the rate of the shoot
  lastChangebullet = Date.now(); // Receive the last change time
  for (let i = 0; i < bulletArray.length; i++) {

    let bullet = bulletArray[i];
    bullet.y += bulletVelocityY * 1.5;        // Re update the velocity of the bullet
    bullet.y2 += bulletVelocityY * 1.5;       // Re update the velocity of the bullet
    bullet.x = ship.x + shipWidth * 13 / 32;  //Re update the out of the bullet
    bullet.x2 = ship.x + shipWidth * 17 / 32;  //Re update the out of the bullet
    context.fillStyle = "white";

    context.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    context.fillRect(bullet.x2, bullet.y2, bullet.width, bullet.height)

    bulletCollision(bullet);

  }
}

function bulletCollision(ammo) {
  //bullet collision with aliens
  for (let j = 0; j < alienArray.length; j++) {
    let alien = alienArray[j];
    if (!ammo.used && alien.alive && detectCollision(ammo, alien)) {
      ammo.used = true;
      alien.alive = false;
      alienCount--;
      score += 100;
    }
  }
}

function moveShip(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "ArrowLeft" && ship.x - shipVelocityX >= 0) {
    ship.x -= shipVelocityX; //move left one tile
  }
  else if (e.code == "ArrowRight" && ship.x + shipVelocityX + ship.width <= board.width) {
    ship.x += shipVelocityX; //move right one tile
  }
}

function createAliens() {
  for (let c = 0; c < alienColumns; c++) {
    for (let r = 0; r < alienRows; r++) {
      let alien = {
        img: alienImg,
        x: alienX + c * alienWidth,
        y: alienY + r * alienHeight,
        width: alienWidth,
        height: alienHeight,
        alive: true
      }
      alienArray.push(alien);
    }
  }
  alienCount = alienArray.length;
}

function shoot(e) {
  if (gameOver) {
    return;
  }

  if (e.code == "Space") {
    //shoot
    let bullet = {
      x: ship.x + shipWidth * 15 / 32,
      x2: ship.x + shipWidth * 15 / 32,
      y: ship.y,
      y2: ship.y,
      width: tileSize / 8,
      height: tileSize / 2,
      used: false
    }
    bulletArray.push(bullet);

  }
}

function detectCollision(a, b) {
  return a.x < b.x + b.width &&   //a's top left corner doesn't reach b's top right corner
    a.x + a.width > b.x &&   //a's top right corner passes b's top left corner
    a.y < b.y + b.height &&  //a's top left corner doesn't reach b's bottom left corner
    a.y + a.height > b.y;    //a's bottom left corner passes b's top left corner
}