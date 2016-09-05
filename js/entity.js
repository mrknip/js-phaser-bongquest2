'use strict';

var Entity = Entity || {};

Entity.Cat = function(game, x,y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);

  game.physics.arcade.enable(this);
  this.body.setSize(24, 24, 4, 4);

  this.anchor.setTo(0.5, 0.5);
  this.sprite = sprite;

  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);
  this.animations.add('walku', [11,12,13,14]);
  this.animations.add('walkd', [15,16,17,18]);
  this.animations.add('swiper', [6,19,20,21,22,23,6]);
  this.animations.add('swipel', [0,28,27,26,25,24,0]);
  this.animations.add('swipeu', [11,29,30,31,11]);
  this.animations.add('swiped', [15,32,33,34,15]);
  
  this.speed = 150;
  this.moving = false;
  this.attacking = false;
  this.attackMode = 'melee';
  this.facing = 'left';
};

Entity.Cat.prototype = Object.create(Phaser.Sprite.prototype);
Entity.Cat.prototype.constructor = Entity.Cat;

Entity.Cat.prototype.update = function () {
    this.move(this.game.ui.cursors);
    this.animate();
};

Entity.Cat.prototype.move = function (cursors) {
  if (this.attacking) { 
    this.body.velocity.x = 0;
    this.body.velocity.y = 0;
    return;
  }

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
};

Entity.Cat.prototype.animate = function () {
  if (this.moving && !this.attacking) {
    if (this.facing === 'left') {
      this.animations.play('walkl', 10, true);
    } else if (this.facing === 'right') {
      this.animations.play('walkr', 10, true);
    } else if (this.facing === 'up') {
      this.animations.play('walku', 10, true);
    } else if (this.facing === 'down') {
      this.animations.play('walkd', 15, true);
    }
  } else if (this.animations.currentAnim && !this.attacking) {
    this.animations.stop(true);
  }
};

Entity.Cat.prototype.attack = function() {
  if (this.attacking) { return; }

  switch (this.attackMode) {
    case 'melee':
      var area = this.getMeleeArea();
      return {type: 'melee', properties: area};
    case 'ranged':
      return {type: 'ranged', bulletType: 'boring'};
  };
}

Entity.Cat.prototype.getMeleeArea = function () {
  if (this.attacking === true) { return null; };

  this.attacking = true;

  var meleeFront = 24;
  var meleeSide = 24;
  var force;

  var directions = {
    'left':  new Phaser.Rectangle(this.x - meleeFront - this.body.width / 2, 
                                  this.y - meleeSide / 2, 
                                  meleeFront, meleeSide),
    'right': new Phaser.Rectangle(this.x + this.body.width / 2, 
                                  this.y - meleeSide / 2, 
                                  meleeFront, meleeSide),
    'up':    new Phaser.Rectangle(this.x - meleeSide / 2, 
                                  this.y - meleeFront - this.body.height / 2,
                                  meleeSide, meleeFront),
    'down':  new Phaser.Rectangle(this.x - meleeSide / 2, 
                                  this.y + this.body.height / 2, 
                                  meleeSide, meleeFront),
  };
  if (this.swipeAnim === undefined) {
    this.swipeAnim = new Entity.Swipe(this.game, this.x, this.y, 'swipe')
    this.swipeAnim.cat = this;
    this.game.add.existing(this.swipeAnim);
  };

  if (this.facing === 'left') {
    force = new Phaser.Point(-300, 0);
  } else if (this.facing === 'right') {
    force = new Phaser.Point(300, 0);
  } else if (this.facing === 'up') {
    force = new Phaser.Point(0, -300);
  } else if (this.facing === 'down') {
    force = new Phaser.Point(0, 300);
  }


  if (this.facing === 'left') {
    this.animations.play('swipel', 20, false);
  } else if (this.facing === 'right') {
    this.animations.play('swiper', 20, false);
  } else if (this.facing === 'up') {
    this.animations.play('swipeu', 15, false);
  } else if (this.facing === 'down') {
    this.animations.play('swiped', 15, false);
  }
  this.swipeAnim.play();

  this.game.time.events.add(300, function(){
    this.attacking = false;
  }, this);

  return {
    area: directions[this.facing],
    force: force
  }
};

Entity.Swipe = function(game, x, y, sprite){
  Phaser.Sprite.call(this, game, x, y, sprite);

  this.anchor.setTo(0.5, 0.5);
  this.visible = false;
  this.animations.add('swipel', [0,1,2,3,4, 5, 6, 7]);
  this.animations.add('swiper', [14,13,12,11,10,9,8,7]);
  this.animations.add('swipeu', [15,16,17,18,19,20,21,7]);
  this.animations.add('swiped', [22,23,24,25,26,27,28,7]);

  console.log(this)
};
Entity.Swipe.prototype = Object.create(Phaser.Sprite.prototype);
Entity.Swipe.constructor = Entity.Swipe; 
Entity.Swipe.prototype.play = function(direction) {
  this.visible = true;
  switch (this.cat.facing) {
    case 'left':
      this.x = this.cat.x - 18;
      this.y = this.cat.y;
      this.animations.play('swipel', 30, false);
      break;
    case 'right':
      this.x = this.cat.x + 18;
      this.y = this.cat.y;
      this.animations.play('swiper', 30, false)
      break;
    case 'up':
      this.x = this.cat.x;
      this.y = this.cat.y - 16;
      this.animations.play('swipeu', 30, false)
      break;
    case 'down':
      this.x = this.cat.x;
      this.y = this.cat.y + 16;
      this.animations.play('swiped', 30, false)
      break;
  };
};

/**
*
* ENEMY - base class
*
*/ 
Entity.Enemy = function(game, x, y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);
  game.physics.arcade.enable(this);
  this.anchor.setTo(0.5, 0.5);
  this.moving = true;
  this.body.setSize(24, 24, 4, 4);

  this.speed = game.rnd.integerInRange(20, 50);
 
  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);

  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

  this.updatePathDue = true;
  this.path = [];
  this.pathStep = -1;
  this.nextPosition = this.position;

  this.pointsValue = 5;
};

Entity.Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Entity.Enemy.prototype.constructor = Entity.Enemy;

Entity.Enemy.prototype.setTarget = function(cat) {
  this.target = cat;
};

Entity.Enemy.prototype.update = function() {
  if (this.updatePathDue) { 
    this.setNewPathToTarget(this.nextPosition); 
  }

  if (!this.disabled) {
   this.move();
  }

  this.facing = this.body.velocity.x > 0 ? 'right' : 'left';
  this.animate();
};

/*
* PATHFINDING
*/
Entity.Enemy.prototype.reachedPosition = function (pos) {
  var distance;
  distance = Phaser.Point.distance(this.position, pos);
  return distance < 1.5;
};


Entity.Enemy.prototype.setNewPathToTarget = function(pathStart) {
  var start;
  this.updatePathDue = false;
  this.game.pathfinder.setCallbackFunction(function(res) {
      var path = [];
      if (res !== null) {
        res.forEach(function(point){
          path.push(this.game.pathfinder.getPixelXY(point));
        }.bind(this));
      }
      this.setPath(path);
  }.bind(this));

  start = arguments[0] ? pathStart : this;

  this.game.pathfinder.preparePathCalculation(
    this.game.pathfinder.getTileXY(start), 
    this.game.pathfinder.getTileXY(this.target)
  );

  this.game.time.events.add(50 * this.game.rnd.integerInRange(0, 10), function(){
    this.game.pathfinder.calculatePath();
  }, this);

    // this.game.time.events.add(Phaser.Timer.SECOND * 1, function(){
    //   if (this.alive) {
    //     this.updatePathDue = true;
    //     this.setNewPathToTarget(this.nextPosition);  
    //   }
    // }, this);
};

Entity.Enemy.prototype.setPath = function (path) {
  if (path !== null) {
    this.path = path;
    this.pathStep = 0;
  } else {
    this.path = [];
  }
};

Entity.Enemy.prototype.move = function() {
  var vector;
  if (this.debug) { return; }

  if (this.path.length <= 0) { return; }

  this.nextPosition = this.path[this.pathStep];

  if (this.reachedPosition(this.nextPosition)) {
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
    return;
  }
  

  vector = Phaser.Point.subtract(this.nextPosition, this.position);
  vector.normalize();

  this.body.velocity.x = vector.x * this.speed;
  this.body.velocity.y = vector.y * this.speed;

};

Entity.Enemy.prototype.animate = function () {
  if (this.moving) {
    if (this.facing === 'left') {
      this.animations.play('walkl', 10, true);
    } else if (this.facing === 'right') {
      this.animations.play('walkr', 10, true);
    } else if (this.animations.currentAnim) {
    this.animations.stop(true);
    }
  }
};

Entity.Enemy.prototype.knockBack = function(force) {
  this.disabled = true;
  this.body.velocity = force;
  this.tint = 0x330000;
}


module.exports = Entity;
