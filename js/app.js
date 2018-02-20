// the y coordinates in pixels for the 3 brick rows to center the bug sprite.
const Top = 60;
const Middle = 145;
const Bottom = 230;
const Win = -25;

// x coordinate that is the farthest right a bug can still be seeen.
const FarRight = 502;
const StartingPoint = -98;

//Player specific coordinates
const PlayerStartingX = 202;
const PlayerStartingY = 315;
const PlayerXMoveIncrement = 101;
const PlayerYMoveIncrement = 84;
const PlayerLeftBoundary = -100;
const PlayerRightBoundary = 450;
const PlayerTopBoundary = -100;
const PlayerBottomBoundary = 450;

//Important Item coordinates
const xCords = [10, 111, 212, 313, 414];
const yCords = [88, 172, 256];

const B0 = {X: 10, Y: 88};
const B1 = {X: 111, Y: 88};
const B2 = {X: 212, Y: 88};
const B3 = {X: 313, Y: 88};
const B4 = {X: 414, Y: 88};
const C0 = {X: 10, Y: 172};
const C1 = {X: 111, Y: 172};
const C2 = {X: 212, Y: 172};
const C3 = {X: 313, Y: 172};
const C4 = {X: 414, Y: 172};
const D2 = {X: 212, Y: 256};
const E2 = {X: 212, Y: 340};

// Enemies our player must avoid
var Enemy = function(loc) {
  // Variables applied to each of our instances go here,
  // we've provided one for you to get started

  // The image/sprite for our enemies, this uses
  // a helper we've provided to easily load images
  this.sprite = 'images/enemy-bug.png';
  this.x = StartingPoint;
  this.y = loc;
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
  // You should multiply any movement by the dt parameter
  // which will ensure the game runs at the same speed for
  // all computers.
  this.move(dt);
  this.reset();
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Removes bug that reaches far right of canvas and creates
// a new bug at a random speed and location.
Enemy.prototype.reset = function() {
  if (this.x > FarRight) {
    allEnemies.splice((allEnemies.indexOf(this)), 1);
    const BugType = Math.floor((Math.random() * 3) + 1);
    let RowLoc = Math.floor((Math.random() * 3) + 1);
    switch (RowLoc) {
      case 1:
        RowLoc = Top;
        break;
      case 2:
        RowLoc = Middle;
        break;
      case 3:
        RowLoc = Bottom;
      default:

    }
    switch (BugType) {
      case 1:
        allEnemies.push(new FastBug(RowLoc));
        break;
      case 2:
        allEnemies.push(new StandardBug(RowLoc));
        break;
      case 3:
        allEnemies.push(new SlowBug(RowLoc));
      default:

    }
  }
};

// Standard moving bugs. Subclass of Enemy
const StandardBug = function(loc) {
  Enemy.call(this, loc);
}
StandardBug.prototype = Object.create(Enemy.prototype);

// Move Standard Bugs
StandardBug.prototype.move = function(dt) {
  this.x += (250 * dt);
}

// Faster moving bugs. Subclass of Enemy
const FastBug = function(loc) {
  Enemy.call(this, loc);
}
FastBug.prototype = Object.create(Enemy.prototype);

// Move Faster Bugs
FastBug.prototype.move = function(dt) {
  this.x += (450 * dt);
}

// Slow moving bugs. Subclass of Enemy
const SlowBug = function(loc) {
  Enemy.call(this, loc);
}
SlowBug.prototype = Object.create(Enemy.prototype);

// Move Slower Bugs
SlowBug.prototype.move = function(dt) {
  this.x += (100 * dt);
}

// Non moving Bug for placement debugging
const StillBug = function(loc) {
  Enemy.call(this, loc);
}
StillBug.prototype = Object.create(Enemy.prototype);

StillBug.prototype.move = function(dt) {
  this.x = -97
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(loc) {
  this.sprite = 'images/char-cat-girl.png';
  this.x = PlayerStartingX;
  this.y = PlayerStartingY;
};

Player.prototype.update = function() {
  player.checkCollisions();
  player.checkWin();
}

// draws the player onto the screen at current
// coordinates
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// if one of the directional buttons are pressed
// moves the player in that direction
Player.prototype.handleInput = function(key) {
  switch (key) {
    case 'up':
      if (this.y - PlayerYMoveIncrement > PlayerTopBoundary) {
        this.y -= PlayerYMoveIncrement;
      }
      break;
    case 'down':
      if (this.y + PlayerYMoveIncrement < PlayerBottomBoundary) {
        this.y += PlayerYMoveIncrement;
      }
      break;
    case 'left':
      if (this.x - PlayerXMoveIncrement > PlayerLeftBoundary) {
        this.x -= PlayerXMoveIncrement;
      }
      break;
    case 'right':
      if (this.x + PlayerYMoveIncrement < PlayerRightBoundary) {
        this.x += PlayerXMoveIncrement;
      }
      break;
    default:

  }
}

// checks if the player is hit by an Enemy and resets
// player position if it is
Player.prototype.checkCollisions = function() {
  allEnemies.forEach(function(enemy) {
    if (enemy.y == player.y  && enemy.x > player.x - 50 && enemy.x < player.x + 50) {
      player.x = PlayerStartingX;
      player.y = PlayerStartingY;
      scoreBoard.loseLife();
      scoreBoard.renderLife();
    }
  });
}

// checks if the player made it to the water. ups score
// and resests character position.
Player.prototype.checkWin = function() {
  if (this.y == Win) {
    this.x++;
    this.y++;
    setTimeout(function() {
      //alert('Your nimble maneuvers = success!')
      player.x = PlayerStartingX;
      player.y = PlayerStartingY;
      scoreBoard.alterScore(100);
      scoreBoard.renderScore();
    }, 250);
  }
}

// a scoreboard to track remaining lives and current score.
var ScoreBoard = function() {
  this.lives = 3;
  this.score = 0;
};

//lowers the life count by one. game resets if lives drop
//to zero
ScoreBoard.prototype.loseLife = function() {
  this.lives--;
  if (this.lives == 0) {
    alert(`game over :(
Your score: ${this.score}`);
    document.location.reload();
  }
}

//alters score.
ScoreBoard.prototype.alterScore = function(score) {
  this.score += score;
}

//updates the scoreboard to represent current lives.
ScoreBoard.prototype.renderLife = function() {
  const lifeImg = '<img src="images/Heart.png" width="20" height="30" class="d-inline-block align-top" alt=""> '
  let lifeDisplay = "Lives: ";
  for (var i = 0; i < this.lives; i++) {
    lifeDisplay += lifeImg
  }
  document.getElementById("lifeCount").innerHTML = lifeDisplay;
}

//update the scoreboard to reflect current score.
ScoreBoard.prototype.renderScore = function() {
  document.getElementById("scoreTally").innerHTML = `Score: ${this.score}`
}

var Items = function(x, y) {
  this.sprite = 'images/Gem Blue.png';
  this.x = x;
  //this.y = PlayerStartingY + 25;
  this.y = y;
}

Items.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 80, 130);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [new SlowBug(Top), new FastBug(Middle), new StandardBug(Bottom)];
const player = new Player;
const scoreBoard = new ScoreBoard;
const items = [];

//assigns the selected sprite to the player.
function selection(char) {
  player.sprite = char;
}

//randomizes the number of items and cords of items to be
//displayed on the board. 
function initItems() {
  const itemCount = Math.floor((Math.random() * 5) + 1);
  for (var i = 0; i < itemCount; i++) {
    const randomXCord = Math.floor((Math.random() * xCords.length ));
    const randomYCord = Math.floor((Math.random() * yCords.length));
    items.push(new Items(xCords[randomXCord], yCords[randomYCord]));
  }
}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  player.handleInput(allowedKeys[e.keyCode]);
});
