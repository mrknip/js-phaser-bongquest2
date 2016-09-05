'use strict';

var Entity = require('./entity.js');
var Bullet = require('./bullet.js');
var LevelMap = require('./levelmap.js');

var MainState = MainState || {};

// Don't forget hack in Phaser getBounds (87780)

MainState = function () {
  Phaser.State.call(this);
};

MainState.prototype = {
  init: function(levelData) {
    this.levelData = levelData;
  },
 
  reset: function () {
    this.bulletDelaySet = false;
    this.attackDelaySet = false;
    this.spawnDue = true;
    this.nextWave = 1;
    this.playerScore = 0;
  },

  create: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.reset();
    
    this.map = new LevelMap(this.game, 'level1');
    this.map.build(this.addGameObjects, this);

    this.hud = this.addHud();

    // Controls 
    this.game.ui = {};
    this.game.ui.cursors = this.game.input.keyboard.createCursorKeys();
    this.game.ui.shootButton = this.game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    
    this.game.pathfinder = this.game.plugins.add(
      Phaser.Plugin.PathFinderPlugin, 
      this.map.collisionLayer
    );
  },

  addGameObjects: function() {
    this.cat = this.addCat(this.game, 64, 160, 'bongo');
    this.cat.currentTile = this.map.getTileXY(this.cat);

    this.bulletGroup = this.game.add.group();
    this.enemiesGroup = this.game.add.group();
    this.triggerGroup = this.game.add.group();

    this.testPowerUp = this.game.add.sprite(832  , 96, 'bullet');
    this.game.physics.enable(this.testPowerUp);

    // Would still be nice to fit this into map manager self-building process, with event handlers
    this.map.addTriggers(this.triggerGroup);
  },

  addCat: function(game, x,y, sprite) {
    var cat = new Entity.Cat(game, x, y, sprite);
    this.game.add.existing(cat);
    return cat;
  },

  addEnemy: function(game, x,y, sprite) {
    var elvis = new Entity.Enemy(game, x, y, sprite);
    elvis.setTarget(this.cat);
    elvis.coordinator = this;  // HACK WARNING - need to think about who coordinates here
    this.game.add.existing(elvis);
    this.enemiesGroup.add(elvis);
    return elvis;
  },

  addBullet: function(game, cat){
    var bullet = new Bullet(game, cat);
    this.bulletGroup.add(bullet);

    return bullet;
  },

  addHud: function () {
    this.playerScoreText = this.game.add.text(16, 16, this.playerScore, {font: 'ubuntu 16px', fill: '#fff'});
    this.playerScoreText.fixedToCamera = true;

    this.game.camera.follow(this.cat);
  },

  update: function() {
    this.game.physics.arcade.collide(this.cat, this.map.collisionLayer);
    this.game.physics.arcade.collide(this.cat, this.enemiesGroup, this.onEnemyTouch, null, this);

    this.game.physics.arcade.collide(this.enemiesGroup, this.map.collisionLayer);
    this.game.physics.arcade.collide(this.bulletGroup, this.enemiesGroup, this.onBulletHit, null, this);
    this.game.physics.arcade.collide(this.bulletGroup, this.map.collisionLayer, this.onBulletHit, null, this);

    this.game.physics.arcade.collide(this.enemiesGroup);

    this.game.physics.arcade.overlap(this.cat, this.triggerGroup, this.triggerWave, null, this);
    this.game.physics.arcade.overlap(this.cat, this.testPowerUp, this.powerUp, null, this);

    // *****************************
    // Trying to trim the number of path updates
    // Where does this live?

    var movedTile = new Phaser.Signal()
    
    movedTile.add(function(newTile){
      this.enemiesGroup.forEachAlive(function(enemy){
        if (!this.updatingPathOnPlayerMove) {
          this.updatingPathOnPlayerMove = true;
          this.game.time.events.add(Phaser.Timer.HALF, function(){
            this.updatingPathOnPlayerMove
          }, this);
          enemy.updatePathDue = true;
        }
      }, this);
    }, this);

    if (!this.cat.currentTile.equals(this.map.getTileXY(this.cat))){
      this.cat.currentTile = this.map.getTileXY(this.cat);
      movedTile.dispatch(this.cat.currentTile)
    }

    // ************************
    // Handle player attacks
    if (this.game.ui.shootButton.isDown) { 
      var attack = this.cat.attack();

      if (attack !== undefined) { this.processAttack(attack); };        
    }

    this.playerScoreText.setText(this.playerScore);
  },

  processAttack: function (attack) {
    switch (attack.type) {
      case 'melee':
        this.rectangle = attack.properties.area;
        this.enemiesGroup.forEachAlive(function(enemy){
          if (attack.properties.area.intersects(this.getCameraRelativeBounds(enemy))) {
            enemy.knockBack(attack.properties.force);
            this.game.time.events.add(300, function(){
              this.playerScore += enemy.pointsValue;
              enemy.kill();
            }, this);
          }
        }, this);
        break;

      case 'ranged':
        this.shoot();
        break;
    }
  },

  getCameraRelativeBounds: function(obj) {
    return obj.getBounds().offset(this.game.camera.x, this.game.camera.y);
  },

  powerUp: function(cat, powerup) {
    powerup.kill();
    this.cat.attackMode = 'ranged';
  },

  triggerWave: function(player, trigger) {
    /*jshint validthis: true*/
    
    var i, n, enemy, squad, waveData, nowOptions;
    
    if (!trigger.live) { return; }
    trigger.live = false;
    waveData = this.levelData.waves[trigger.waveNumber];
    
    function spawnCallback(enemyEnt){
      return function(nowOpts){
        this.game.time.events.add(enemyEnt.timeout, function(){
          if (nowOpts.viewX) {
            enemyEnt.x = this.game.camera.x + this.game.camera.view.width;
          }

          this.addEnemy(this.game, enemyEnt.x, enemyEnt.y, enemyEnt.type);
        }.bind(this));
      };
    }

    for (i = 0; i < waveData.squads.length; i++) {
      squad = waveData.squads[i];

      for (n = 0; n < squad.quantity; n++){
        nowOptions = {};
        if (squad.x === 'right') {nowOptions.viewX = true;}

        enemy = Object.create(null);
        enemy.x = squad.x === 'left' ? 0 : 'now';
        enemy.y = squad.y === 'rnd' ? this.game.rnd.integerInRange(2,7) * 32 : 
          squad.y[n] * 32 + 16;
        enemy.type = squad.type;
        enemy.timeout = squad.interval * n;
        spawnCallback(enemy).bind(this)(nowOptions);
      }

    }
  },

  shoot: function(){
    if (this.bulletGroup.countLiving() > 50) { return; }

    if (this.bulletDelaySet === false) {
      this.addBullet(this.game, this.cat);
      this.bulletDelaySet = true;
      
      this.game.time.events.add(200, function(){
        this.bulletDelaySet = false;
      }, this);
    }
  },

  onBulletHit: function (obj1, obj2) {
    function doBullet (bullet, target) {
      bullet.onHit();
      if (target) {
        target.body.enable = false;
        target.tint = 0xFFFF00;
        setTimeout(function(){
          target.kill();
        }, 100);
      }
    }
    if (obj2.key) {
      doBullet(obj1, obj2);
      this.playerScore += obj2.pointsValue;
    } else {
      doBullet(obj1);
    }
          
  },

  onEnemyTouch: function() {
    this.game.camera.shake(0.01, 250);
  },

  render: function(){
    // function renderGroup(member) {    
    //   this.game.debug.body(member);
    // }
    // this.enemiesGroup.forEachAlive(renderGroup, this);
    // this.game.debug.body(this.cat);
    // this.game.debug.geom(this.rectangle, 'rgba(0,0,255,0.5)');
    
  },
};

module.exports = MainState;
