'use strict';

function Cat (game, x,y, sprite) {
  Phaser.Sprite.call(this, game, x, y, sprite);

  this.anchor.setTo(0.5, 0.5);
  this.state = 'landed';
  this.sprite = sprite;
  this.speed = 150;
  game.physics.arcade.enable(this);

  this.init();
}

Cat.prototype = Object.create(Phaser.Sprite.prototype)

Cat.constructor = Cat;

Cat.prototype.switchStateImage = function() {
  switch(this.state){
    case 'underwater':
      this.state = 'underwater'
      this.loadTexture(this.sprite, 1);
      break;
    default:
    console.log(this.state)
      this.state = 'landed';
      this.loadTexture(this.sprite, 0);
  }
}
Cat.prototype.init = function () {
  this.animations.add('walkl', [0,1,2,3,4]);
  this.animations.add('walkr', [6,7,8,9,10]);
  this.animations.add('walku', [11,12,13,14])
  this.animations.add('walkd', [15,16,17,18])
  this.moving = false;
  this.facing = 'left';

  if (this.sprite == 'elvis') {
    this.moving = true;
    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.body.velocity.x = -200;
  }
}

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
  
  if (this.target) {
    game.physics.arcade.moveToObject(this, this.target)
  }

  // if (this.x < 50) {
  //   this.body.velocity.x = 200;
  //   this.facing = 'right';
  // } else if (this.x > 400) {
  //   this.body.velocity.x = -200;
  //   this.facing = 'left';
  // } 
}

Cat.prototype.setTarget = function(cat) {
  this.target = cat;
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
    