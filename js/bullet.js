'use strict';

function Bullet (game, cat) {
  Phaser.Sprite.call(this, game, cat.body.x, cat.body.y, 'bullet', 0);
  game.physics.arcade.enable(this);

  this.init(cat);
}

Bullet.prototype = Object.create(Phaser.Sprite.prototype)

Bullet.constructor = Bullet;

Bullet.prototype.init = function(cat) {
  this.body.setSize(12, 12, 9, 9);
  this.anchor.setTo(0.5, 0.5);
  this.x += 16;
  this.y +=16;
  this.checkWorldBounds = true;
  this.outOfBoundsKill = true;

  this.animations.add('explode', [1,2,3,4,5,6,7,8]);

  if (cat.facing == 'left'){
      this.x -= 16;
      this.body.velocity.x = -400;
  } else if (cat.facing == 'right'){
      this.x += 16;
      this.body.velocity.x = 400;
  } else if (cat.facing == 'up'){
      this.y -=16;
      this.body.velocity.y = -400;
  } else if (cat.facing == 'down'){
      this.y += 16;
      this.body.velocity.y = 400;
  }
}

Bullet.prototype.onHit = function (){
  this.animations.play('explode', 16, false);
  this.body.enable = false;
  this.scale.setTo(1.5,1.5);

  setTimeout(function(){
    this.kill();
  }.bind(this), 500);
}

