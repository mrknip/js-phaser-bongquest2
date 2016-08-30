'use strict';

// Don't forget hack in Phaser getBounds (87780)

var MainState = function (game) {
  this.map;
  this.layer;

  this.bulletDelaySet = false;
};

MainState.prototype = {
  preload: function() {
    game.load.tilemap('test', 'assets/tiles/test2.json', null, Phaser.Tilemap.TILED_JSON);

    game.load.image('tiles', 'assets/img/grassy.png');

    game.load.spritesheet('bullet', 'assets/img/bullet.png', 32, 32);
    game.load.spritesheet('bongo', 'assets/img/bongo.png', 32, 32);
    game.load.spritesheet('elvis', 'assets/img/elvis.png', 32, 32);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.map = game.add.tilemap('test');
    this.map.addTilesetImage('grassy', 'tiles');
    this.layer = this.map.createLayer('Tile Layer 1');
    this.layer.resizeWorld();

    this.water = this.map.createLayer('underwater');
    
    this.map.setTileIndexCallback(16, this.inWater, this, this.water);
    this.map.setCollision([2,3, 5,7,8,10,12,13], true, this.layer);

    this.cat = this.addCat(game, 256, 256, 'bongo');
    this.elvis = this.addCat(game, 256, 288, 'elvis');

    game.camera.follow(this.cat);

    this.bulletGroup = game.add.group();
    this.bulletGroup.enableBody = true;

    this.cursors = game.input.keyboard.createCursorKeys();
    this.shootButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
  },

  addCat: function(game, x,y, sprite) {
    var cat = new Cat(game, x, y, sprite);
    game.add.existing(cat);
    return cat;
  },

  update: function() {
    game.physics.arcade.collide(this.cat, this.layer, this.collideCat);
    game.physics.arcade.collide(this.bulletGroup, this.elvis, this.onBulletHit);
    game.physics.arcade.collide(this.bulletGroup, this.layer, this.onBulletHit);

    
    this.cat.body.velocity.x = 0;
    this.cat.body.velocity.y = 0;

    if (this.cursors.left.isDown) {
      this.cat.body.velocity.x = -(this.cat.speed);
      this.cat.facing = 'left';
      this.cat.moving = true;
    }

    if (this.cursors.right.isDown) {
      this.cat.body.velocity.x = this.cat.speed;
      this.cat.facing = 'right';
      this.cat.moving = true;  
    }

    if (this.cursors.up.isDown) {
      this.cat.body.velocity.y = -(this.cat.speed);
      this.cat.facing = 'up';
      this.cat.moving = true;
    }

    if (this.cursors.down.isDown) {
      this.cat.body.velocity.y = this.cat.speed;
      this.cat.facing = 'down';
      this.cat.moving = true;
    }

    if (!this.cursors.left.isDown &&
        !this.cursors.right.isDown &&
        !this.cursors.up.isDown &&
        !this.cursors.down.isDown
      ) {
      this.cat.moving = false;
    }

    this.elvis.move();
    this.elvis.animate();
    this.cat.animate();

    

    if (this.shootButton.isDown) { 
      this.shoot();
    }

    this.cat.underwater = false;
    game.physics.arcade.collide(this.cat, this.water);
    if (this.cat.underwater) {
      if (this.cat.state != 'underwater') {
        this.cat.state = 'underwater';
        this.cat.switchStateImage();
      }
    } else {
      if (this.cat.state == 'underwater') {
        this.cat.state = 'landed';
        this.cat.switchStateImage();
      }
    }
  },

  shoot: function(){
    if (this.bulletGroup.countLiving() > 50) { return; }

    if (this.bulletDelaySet == false) {
      var bullet = this._addBullet(this, this.cat);
      this._setBulletVelocity(bullet, this.cat);  
      this.bulletDelaySet = true;
      
      setTimeout(function(){
        this.bulletDelaySet = false;
      }.bind(this), 200);
    }
  },

  _addBullet: function(game, cat){
    var bullet = game.bulletGroup.create(cat.body.x, cat.body.y, 'bullet', 0);
        bullet.body.setSize(12, 12, 9, 9);
        bullet.checkWorldBounds = true;
        bullet.outOfBoundsKill = true;
        bullet.animations.add('explode', [1,2,3,4,5,6,7,8]);

    return bullet;
  },

  _setBulletVelocity: function(bullet, cat) {
    if (cat.facing == 'left'){
      bullet.x -= 16;
      bullet.body.velocity.x = -400;
    } else if (cat.facing == 'right'){
      bullet.x += 16;
      bullet.body.velocity.x = 400;
    } else if (cat.facing == 'up'){
      bullet.y -=16;
      bullet.body.velocity.y = -400;
    } else if (cat.facing == 'down'){
      bullet.y += 16;
      bullet.body.velocity.y = 400;
    }
  },

  onBulletHit: function (obj1, obj2) {
    function doBullet (bullet, target) {
      bullet.animations.play('explode', 16, false);
      bullet.body.enable = false;
      bullet.scale.setTo(1.5,1.5);
      
      if (target) target.body.enable = false;
      setTimeout(function(){
        if (target) target.kill();
      }, 200);
      setTimeout(function(){
        bullet.kill();
      }, 500);
    };

    (obj1.key == 'bullet') ? doBullet(obj1) : doBullet(obj2, obj1);
  },

  inWater: function(event) {
    this.cat.underwater = true;
  },

  render: function(){
    // game.debug.body(this.cat)
  }
};

var game = new Phaser.Game(640, 480, Phaser.AUTO, 'gameDiv');
game.state.add('main', MainState);
game.state.start('main');
