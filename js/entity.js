'use strict';

function Cat (game, x,y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);

  game.physics.arcade.enable(this);
  
  this.anchor.setTo(0.5, 0.5);
  this.sprite = sprite;

  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);
  this.animations.add('walku', [11,12,13,14])
  this.animations.add('walkd', [15,16,17,18])
  
  this.speed = 150;
  this.moving = false;
  this.facing = 'left';
}

Cat.prototype = Object.create(Phaser.Sprite.prototype)

Cat.constructor = Cat;

Cat.prototype.move = function (cursors) {
  if (cursors) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.moving = false;

    if (cursors.left.isDown) {
      this.body.velocity.x = -(this.speed);
      this.facing = 'left';
      this.moving = true;
    }

    if (cursors.right.isDown) {
      this.body.velocity.x = this.speed;
      this.facing = 'right';
      this.moving = true;  
    }

    if (cursors.up.isDown) {
      this.body.velocity.y = -(this.speed);
      this.facing = 'up';
      this.moving = true;
    }

    if (cursors.down.isDown) {
      this.body.velocity.y = this.speed;
      this.facing = 'down';
      this.moving = true;
    }
  }
}

Cat.prototype.animate = function () {
  if (this.moving) {
    if (this.facing == 'left') {
      this.animations.play('walkl', 10, true);
    } else if (this.facing == 'right') {
      this.animations.play('walkr', 10, true);
    } else if (this.facing == 'up') {
      this.animations.play('walku', 10, true);
    } else if (this.facing == 'down') {
      this.animations.play('walkd', 15, true);
    }
  } else if (this.animations.currentAnim) {
    this.animations.stop(true);
  }
}

/**
*
* ENEMY - base class
*
*/ 
function Enemy (game, x, y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);
  game.physics.arcade.enable(this);
  this.anchor.setTo(0.5, 0.5);

  this.moving = true;
  this.body.setSize(24, 24, 4, 4);
  this.body.velocity.x = 50;
  this.speed = game.rnd.integerInRange(50, 150);
 
  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);

  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

  this.updatePathDue = true;
  this.path = [];
  this.pathStep = -1;

}
Enemy.prototype = Object.create(Phaser.Sprite.prototype)
Enemy.constructor = Enemy;

Enemy.prototype.setTarget = function(cat) {
  this.target = cat;
}

Enemy.prototype.followPath = function() {
  this.setNewPathToTarget(this.target);
  this.move();

  this.facing = this.body.velocity.x > 0 ? 'right' : 'left';
}

Enemy.prototype.reachedPosition = function (pos) {
  var distance;
  distance = Phaser.Point.distance(this.position, pos);
  return distance < 1.5;
}

Enemy.prototype.setNewPathToTarget = function(targX, targY) {
  if (!this.updatePathDue) { return; }
  this.updatePathDue = false;
  
  game.pathfinder.setCallbackFunction(function(res) {
      var path = [];
      if (res != null) {
        for (var i = 0; i < res.length; i++) {
          path.push(game.pathfinder.getPixelFromCoord(res[i]))
        }
      }
      this.moveThroughPath(path);
  }.bind(this));

  game.pathfinder.preparePathCalculation(
    game.pathfinder.getTileXY(this), 
    game.pathfinder.getTileXY(this.target)
  )
  game.pathfinder.calculatePath();

  game.time.events.add(Phaser.Timer.SECOND * 1, function(){
    if (this.alive) {
      this.updatePathDue = true;
      this.setNewPathToTarget();  
    }
  }, this)
}

Enemy.prototype.moveThroughPath = function (path) {
  if (path !== null) {
    this.path = path;
    this.pathStep = 0;
  } else {
    this.path = [];
  }
}

Enemy.prototype.move = function() {
  var nextPosition, vector;

  if (this.path.length <= 0) { return; }

  nextPosition = this.path[this.pathStep];
  if (!this.reachedPosition(nextPosition)) {
    vector = new Phaser.Point(nextPosition.x - this.position.x,
                              nextPosition.y - this.position.y);
    vector.normalize();

    this.body.velocity.x = vector.x * this.speed;
    this.body.velocity.y = vector.y * this.speed;
  } else {
    this.position.x = nextPosition.x;
    this.position.y = nextPosition.y;
    if (this.pathStep < this.path.length - 1) {
      this.pathStep += 1;
    } else {
      this.path = [];
      this.pathStep = -1;
      this.body.velocity.x = 0;
      this.body.velocity.y = 0;
      this.setNewPathToTarget();
    }
  }
}


Enemy.prototype.animate = function () {
  if (this.moving) {
    if (this.facing == 'left') {
      this.animations.play('walkl', 10, true);
    } else if (this.facing == 'right') {
      this.animations.play('walkr', 10, true);
    } else if (this.animations.currentAnim) {
    this.animations.stop(true);
    }
  }
}

    