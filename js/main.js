'use strict';

// Don't forget hack in Phaser getBounds (87780)

var MainState = function (game) {
  this.map;
  this.layer;

  this.bulletDelaySet = false;
  this.spawnDue = true;
};

MainState.prototype = {
  preload: function() {
    game.load.tilemap('test', 'assets/tiles/triggertest.json', null, Phaser.Tilemap.TILED_JSON);

    game.load.image('tiles', 'assets/img/grassy.png');

    game.load.spritesheet('bullet', 'assets/img/bullet.png', 32, 32);
    game.load.spritesheet('bongo', 'assets/img/bongo.png', 32, 32);
    game.load.spritesheet('elvis', 'assets/img/elvis.png', 32, 32);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);

    this.loadLevel('test');
  
    this.cat = this.addCat(game, 64, 160, 'bongo');
    this.elvis = this.addCat(game, 256, 288, 'elvis');

    // Entities
    this.bulletGroup = game.add.group();
    this.enemiesGroup = game.add.group();
    this.enemiesGroup.add(this.elvis);

    // Controls
    this.cursors = game.input.keyboard.createCursorKeys();
    this.shootButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    
    game.camera.follow(this.cat);
  },

  loadLevel: function(level) {
    this.map = game.add.tilemap(level);
    this.map.addTilesetImage('grassy', 'tiles');
    this.layer = this.map.createLayer('background');
    this.layer.resizeWorld();

    this.collisionLayer = this.map.createLayer('collisionLayer');
    this.map.setCollisionBetween(1,20,true, this.collisionLayer);
    // this.map.setTileIndexCallback(16, this.inWater, this, this.water);
    // this.map.setCollision([2,3, 5,7,8,10,12,13], true, this.layer);

    this.map.setTileLocationCallback(8, 4, 2, 3, this.spawnWave, this, this.collisionLayer);
  },

  spawnWave: function() {
    console.log('triggered');
    if (this.waveOneComplete) return;
    for (var i = 0; i < 5; i++) {
      var elvis = this.addCat(game, 640, game.rnd.integerInRange(128, 256), 'elvis');
      elvis.setTarget(this.cat);
      this.enemiesGroup.add(elvis);
    }
    this.waveOneComplete = true;
  },

  addCat: function(game, x,y, sprite) {
    var cat = new Cat(game, x, y, sprite);
    game.add.existing(cat);
    return cat;
  },

  update: function() {
    game.physics.arcade.collide(this.cat, this.collisionLayer);
    game.physics.arcade.collide(this.enemiesGroup, this.collisionLayer);
    game.physics.arcade.collide(this.bulletGroup, this.enemiesGroup, this.onBulletHit);
    game.physics.arcade.collide(this.bulletGroup, this.collisionLayer, this.onBulletHit);

    // Move AI

    this.enemiesGroup.callAll('move');
    this.enemiesGroup.callAll('animate');

    // Move Player
    this.cat.move(this.cursors);
    this.cat.animate();

    if (this.shootButton.isDown) { this.shoot(); }

    // Spawn enemies
    // if (this.enemiesGroup.countLiving() < 5 && this.spawnDue) {
    //   this.spawnDue = false;
    //   var elvis = this.addCat(game, 640, game.rnd.integerInRange(200, 400), 'elvis');
    //   elvis.setTarget(this.cat);
    //   this.enemiesGroup.add(elvis);

    //   setTimeout(function(){
    //     this.spawnDue = true;
    //   }.bind(this), 1000);
    // }


    // My submerging hack
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
      var bullet = this.addBullet(game, this.cat);
      this.bulletDelaySet = true;
      
      setTimeout(function(){
        this.bulletDelaySet = false;
      }.bind(this), 200);
    }
  },

  addBullet: function(game, cat){
    var bullet = new Bullet(game, this.cat);
    this.bulletGroup.add(bullet);

    return bullet;
  },

  onBulletHit: function (obj1, obj2) {
    function doBullet (bullet, target) {
      bullet.onHit();
      if (target) {
        target.body.enable = false;
        setTimeout(function(){
          target.kill();
        }, 100);
      }
    };

    (obj2.key) ? doBullet(obj1, obj2) : doBullet(obj1);
  },

  inWater: function(event) {
    this.cat.underwater = true;
  },

  render: function(){
    // game.debug.body(this.cat)
  }
};


