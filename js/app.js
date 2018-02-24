// the y coordinates in pixels for the 3 brick rows to center the bug sprite.
const Top = 63;
const Middle = 147;
const Bottom = 231;
const Win = -21;

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

//Coordinates for placing items in the 'road'.
const xCords = [10, 111, 212, 313, 414];
const yCords = [88, 172, 256];

//High Score text that is displayed.
let highScoreText = '';

// Enemies our player must avoid
var Enemy = function(loc) {
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

//The player the user uses to play the game.
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
        this.checkGems();
      }
      break;
    case 'down':
      if (this.y + PlayerYMoveIncrement < PlayerBottomBoundary) {
        this.y += PlayerYMoveIncrement;
        this.checkGems();
      }
      break;
    case 'left':
      if (this.x - PlayerXMoveIncrement > PlayerLeftBoundary) {
        this.x -= PlayerXMoveIncrement;
        this.checkGems();
      }
      break;
    case 'right':
      if (this.x + PlayerYMoveIncrement < PlayerRightBoundary) {
        this.x += PlayerXMoveIncrement;
        this.checkGems();
      }
      break;
    default:

  }
}

// checks if the player is hit by an Enemy and resets
// player position if it is.
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

//check if the player landed on a gem. Adds the gems value to
//the score if so.
Player.prototype.checkGems = function() {
  items.forEach(function(item) {
    if (item.y > player.y - 50 && item.y < player.y + 50 && item.x > player.x - 50 && item.x < player.x + 50) {
      scoreBoard.alterScore(item.value);
      scoreBoard.renderScore();
      items.splice((items.indexOf(item)), 1);
    }
  })
}

// checks if the player made it to the water. ups score
// and resests character position.
Player.prototype.checkWin = function() {
  if (this.y == Win) {
    this.x++;
    this.y++;
    setTimeout(function() {
      player.x = PlayerStartingX;
      player.y = PlayerStartingY;
      scoreBoard.alterScore(100);
      scoreBoard.renderScore();
      initItems();
    }, 250);
  }
}

// a scoreboard to track remaining lives and current score.
var ScoreBoard = function() {
  this.lives = 3;
  this.score = 0;
  this.scoreHigh = 0;
  this.playerHigh = "High Score";
};

//lowers the life count by one. game resets if lives drop
//to zero. If the score is greater than the High Score the score is stored
//in scoreHigh and written to indexedDB.
ScoreBoard.prototype.loseLife = function() {
  this.lives--;
  if (this.lives == 0) {
    if (this.score > this.scoreHigh) {
      this.scoreHigh = this.score;
      dbPromise.then(function(db) {
        var tx = db.transaction('keyval');
        var keyValStore = tx.objectStore('keyval');
        return keyValStore.get('High Score');
      }).then(function(val) {
        if (scoreBoard.scoreHigh > val) {
          dbPromise.then(function(db) {
            var tx = db.transaction('keyval', 'readwrite');
            var keyValStore = tx.objectStore('keyval');
            keyValStore.put(scoreBoard.scoreHigh, scoreBoard.playerHigh);
          })
        }
      })
      //this.createHighScore();
      //this.renderHighScore();
    }
    alert(`game over :(
Your score: ${this.score}`);
    document.location.reload();
  }
}

//alters score.
ScoreBoard.prototype.alterScore = function(score) {
  this.score += score;
}

//Creates the High Score Text which is displayed under the game board.
ScoreBoard.prototype.createHighScore = function() {
  const dotLength = 39 - this.playerHigh.length - this.scoreHigh.toString().length;
  let dots = '';
  for (var i = 0; i < dotLength; i++) {
    dots += '.';
  }
  highScoreText = this.playerHigh + dots + this.scoreHigh;
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

//displays the High Score.
ScoreBoard.prototype.renderHighScore = function() {
  document.getElementById('highScore').innerHTML = highScoreText;
}

//Items that can be gathered by the player for additional
//points.
var Items = function(x, y) {
  this.x = x;
  this.y = y;
}

//Draws Items onto the board
Items.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 80, 130);
}

//Blue Gem valued at 75
const BlueGem = function(x, y) {
  Items.call(this, x, y);
  this.sprite = 'images/Gem Blue.png';
  this.value = 75;
}
BlueGem.prototype = Object.create(Items.prototype);

//Green Gem valued at 25
const GreenGem = function(x, y) {
  Items.call(this, x, y);
  this.sprite = 'images/Gem Green.png';
  this.value = 25;
}
GreenGem.prototype = Object.create(Items.prototype);

//Orange Gem valued at 125
const OrangeGem = function(x, y) {
  Items.call(this, x, y);
  this.sprite = 'images/Gem Orange.png';
  this.value = 125;
}
OrangeGem.prototype = Object.create(Items.prototype);

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
// Place all item objects in item array
// Place ScoreBoard object in scoreBoard
const allEnemies = [new SlowBug(Top), new FastBug(Middle), new StandardBug(Bottom)];
const player = new Player;
const scoreBoard = new ScoreBoard;
const items = [];

//assigns the selected sprite to the player.
function selection(char) {
  player.sprite = char;
}

//randomizes number of items, cords of items, and type of
//items to be displayed on the board.
function initItems() {
  items.length = 0;
  const itemCount = Math.floor((Math.random() * 5) + 1);
  for (var i = 0; i < itemCount; i++) {
    const itemType = Math.floor((Math.random() * 100) + 1);
    const randomXCord = Math.floor((Math.random() * xCords.length ));
    const randomYCord = Math.floor((Math.random() * yCords.length));
    switch (true) {
      case itemType > 95 && itemType < 100:
        items.push(new OrangeGem(xCords[randomXCord], yCords[randomYCord]));
        break;
      case itemType > 0 && itemType < 25:
        items.push(new BlueGem(xCords[randomXCord], yCords[randomYCord]));
        break;
      default:
        items.push(new GreenGem(xCords[randomXCord], yCords[randomYCord]));
    }
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

//creates a place to cache the high score.
var dbPromise = idb.open('high-score', 1, function(upgradeDb) {
  switch(upgradeDb.oldVersion) {
    case 0:
      var keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put(scoreBoard.scoreHigh, 'High Score');
  }
});
