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


function Enemy (game, x, y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);
  game.physics.arcade.enable(this);

  this.moving = true;
  this.body.velocity.x = 50;
  this.speed = 150;
 
  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);

  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;
  this.updatePathDue = true;

}
Enemy.prototype = Object.create(Phaser.Sprite.prototype)

Enemy.constructor = Enemy;

Enemy.prototype.setTarget = function(cat) {
  this.target = cat;
}

Enemy.prototype.followPath = function(grid, targetX, targetY) {
  // if (!this.pathfinder) {
  //   this.grid = grid;
  //   this.pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin);
  //   this.pathfinder.setGrid(this.grid.layer.data, [-1]);
  // }
  // this.findPathToTarget(targetX, targetY);
  game.physics.arcade.moveToObject(this, this.target)
    
  this.facing = this.body.velocity.x > 0 ? 'right' : 'left';
}
  
// Cat.prototype.findPathToTarget = function(targX, targY) {
//   if (!this.updatePathDue) { return}
//   var selfX = this.grid.getTileX(this.x);
//   var selfY = this.grid.getTileY(this.y);

//   this.updatePathDue = false;
//   this.pathfinder.setCallbackFunction(function(path) {
//       var path = path;
//       var vector = new Phaser.Point(path[1].x - selfX,
//                                     path[1].y - selfY)
//       if (vector.x == 0 && vector.y == 0 && path[2]) {
//         console.log('moving to 2')
//         var vector = new Phaser.Point(path[2].x - selfX,
//                                       path[2].y - selfY)
//       } 
//       if (vector.x == 0 && vector.y == 0 && path[3]) {
//         var vector = new Phaser.Point(path[3].x - selfX,
//                                       path[3].y - selfY)
//       }
//       vector.normalize();
//       this.body.velocity.x = vector.x * this.speed;
//       this.body.velocity.y = vector.y * this.speed;
//       // game.physics.arcade.moveToXY(this, path[1].x, path[1].y, this.speed)
//   }.bind(this));



//   this.pathfinder.preparePathCalculation([selfX, selfY], [targX,targY]);
//   this.pathfinder.calculatePath();

//   setTimeout(function(){
//     this.updatePathDue = true;
//   }.bind(this), 100)
// }

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

    