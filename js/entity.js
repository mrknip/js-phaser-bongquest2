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
  this.facing = 'right';

  this.nextPosition;
}

Cat.prototype = Object.create(Phaser.Sprite.prototype)

Cat.constructor = Cat;

Cat.prototype.move = function (cursors) {
  if (cursors) {
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    this.moving = false; // calculate this from velocity!

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

  this.pointsValue = 5;

}
Enemy.prototype = Object.create(Phaser.Sprite.prototype)
Enemy.constructor = Enemy;

Enemy.prototype.setTarget = function(cat) {
  this.target = cat;
}

Enemy.prototype.update = function() {
  if (this.updatePathDue) this.setNewPathToTarget(this.nextPosition);
  this.move();

  this.facing = this.body.velocity.x > 0 ? 'right' : 'left';
  this.animate();
}

Enemy.prototype.reachedPosition = function (pos) {
  var distance;
  distance = Phaser.Point.distance(this.position, pos);
  return distance < 1.5;
}

Enemy.prototype.setNewPathToTarget = function(pathStart) {
  var start;
  this.updatePathDue = false;
  
  game.pathfinder.setCallbackFunction(function(res) {
      var path = [];
      if (res != null) {
        path = res.map((point) => game.pathfinder.getPixelFromCoord(point))
      }
      this.setPath(path);
  }.bind(this));

  start = arguments[0] ? pathStart : this

  game.pathfinder.preparePathCalculation(
    game.pathfinder.getTileXY(start), 
    game.pathfinder.getTileXY(this.target)
  )

  game.pathfinder.calculatePath();

  game.time.events.add(Phaser.Timer.SECOND * 1, function(){
    if (this.alive) {
      this.updatePathDue = true;
      this.setNewPathToTarget(this.nextPosition);  
    }
  }, this)
}

Enemy.prototype.setPath = function (path) {
  if (path !== null) {
    this.path = path;
    this.pathStep = 0;
  } else {
    this.path = [];
  }
}

Enemy.prototype.move = function() {
  var vector;

  if (this.path.length <= 0) { return; }
  this.nextPosition = this.path[this.pathStep];
  if (!this.reachedPosition(this.nextPosition)) {
    vector = Phaser.Point.subtract(this.nextPosition, this.position);
    vector.normalize();

    this.body.velocity.x = vector.x * this.speed;
    this.body.velocity.y = vector.y * this.speed;

  } else {
    this.position.copyFrom(this.nextPosition);
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

    