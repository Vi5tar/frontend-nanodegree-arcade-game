// the y coordinates in pixels for the 3 brick rows to center the bug sprite.
const Top = 60;
const Middle = 145;
const Bottom = 230;

// x coordinate that is the farthest right a bug can still be seeen.
const FarRight = 502;
const StartingPoint = -98;
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

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [new SlowBug(Top), new FastBug(Middle), new StandardBug(Bottom)];

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
  var allowedKeys = {
    37: 'left',
    38: 'up',
    39: 'right',
    40: 'down'
  };

  //player.handleInput(allowedKeys[e.keyCode]);
});
