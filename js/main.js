'use strict';

// Don't forget hack in Phaser getBounds (87780)

var MainState = function (game) {
  this.map;
  this.layer;

  this.bulletDelaySet;
  this.spawnDue;
  this.nextWave;
};

MainState.prototype = {
  preload: function() {
    game.load.tilemap('test', 'assets/tiles/triggertest.json', null, Phaser.Tilemap.TILED_JSON);

    game.load.image('tiles', 'assets/img/grassy.png');
    game.load.image('tree', 'assets/img/tree.png')

    game.load.spritesheet('bullet', 'assets/img/bullet.png', 32, 32);
    game.load.spritesheet('bongo', 'assets/img/bongo.png', 32, 32);
    game.load.spritesheet('elvis', 'assets/img/elvis.png', 32, 32);
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.reset();
    
    // Add tilemap, bg and collision layer
    this.loadLevel('test');
    
    // Add actors
    this.cat = this.addCat(game, 64, 160, 'bongo');
    // this.elvis = this.addCat(game, 256, 288, 'elvis');
    this.bulletGroup = game.add.group();
    this.enemiesGroup = game.add.group();
    // this.enemiesGroup.add(this.elvis);

    // Add foreground
    this.foreground = this.map.createLayer('trees');

    // Controls 
    this.cursors = game.input.keyboard.createCursorKeys();
    this.shootButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    
    // this.pathfinder = new Pathfinder(this, game);

    game.camera.follow(this.cat);

  },

  reset: function () {
    this.bulletDelaySet = false;
    this.spawnDue = true;
    this.nextWave = 1;
  },

  loadLevel: function(level) {
    this.map = game.add.tilemap(level);
    this.map.addTilesetImage('grassy', 'tiles');
    this.map.addTilesetImage('tree', 'tree')
    this.layer = this.map.createLayer('background');
    this.layer.resizeWorld();
    this.bgObjLayer = this.map.createLayer('bg objects');

    this.collisionLayer = this.map.createLayer('collisionLayer');
    this.map.setCollisionBetween(0,200,true, this.collisionLayer);

    this.map.setTileLocationCallback(8, 4, 2, 3, this.spawnWave, this, this.collisionLayer);
    this.map.setTileLocationCallback(25, 3, 2, 2, this.spawnWave, this, this.collisionLayer);
  },

  hitTrunk: function(e) {
    console.log(e);
  },

  spawnWave: function() {
    var viewX;
    switch (this.nextWave) {
      case 1:
        for (var i = 0; i < 5; i++) {
          var elvis = this.addEnemy(game, 0, game.rnd.integerInRange(128, 256), 'elvis');
          elvis.setTarget(this.cat);
          this.enemiesGroup.add(elvis);
        }
        this.map.setTileLocationCallback(8, 4, 2, 3, null, this, this.collisionLayer);
        break;
      case 2:
        for (var i = 0; i < 10; i++) {
          setTimeout(function(){
            viewX = game.camera.x + game.camera.view.width;
            var elvis = this.addEnemy(game, viewX, game.rnd.integerInRange(128, 256), 'elvis');
                elvis.setTarget(this.cat);
                this.enemiesGroup.add(elvis);
            var elvis = this.addEnemy(game, 0, game.rnd.integerInRange(128, 256), 'elvis');
                elvis.setTarget(this.cat);
                this.enemiesGroup.add(elvis);
          }.bind(this), i * 100)
        }
        this.map.setTileLocationCallback(25, 3, 2, 2, null, this, this.collisionLayer);
        break;
    }

    this.nextWave++ ;
  },

  addCat: function(game, x,y, sprite) {
    var cat = new Cat(game, x, y, sprite);
    game.add.existing(cat);
    return cat;
  },

  addEnemy: function(game, x,y, sprite) {
    var elvis = new Enemy(game, x, y, sprite);
    game.add.existing(elvis);
    return elvis;
  },

  update: function() {
    game.physics.arcade.collide(this.cat, this.collisionLayer);
    game.physics.arcade.collide(this.enemiesGroup, this.collisionLayer);
    game.physics.arcade.collide(this.bulletGroup, this.enemiesGroup, this.onBulletHit);
    game.physics.arcade.collide(this.bulletGroup, this.collisionLayer, this.onBulletHit);

    // Move AI
    this.enemiesGroup.callAll('followPath', null,
      this.collisionLayer,
      this.collisionLayer.getTileX(this.cat.x),
      this.collisionLayer.getTileY(this.cat.y));

    this.enemiesGroup.callAll('animate');

    // Move Player
    this.cat.move(this.cursors);
    this.cat.animate();

    if (this.shootButton.isDown) { this.shoot(); }

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
    game.debug.body(this.collisionLayer)
  }
};


