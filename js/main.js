'use strict';

var Bongquest = Bongquest || {};
// Don't forget hack in Phaser getBounds (87780)

Bongquest.MainState = function (game) {
  this.map;
  this.layer;

  this.bulletDelaySet;
  this.spawnDue;
  this.nextWave;
};

Bongquest.MainState.prototype = {

  init: function(levelData) {
    this.levelData = levelData
  },
 
  reset: function () {
    this.bulletDelaySet = false;
    this.spawnDue = true;
    this.nextWave = 1;
  },

  create: function() {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    this.reset();
    
    // Add tilemap, bg and collision layer
    this.loadLevel('level1');
    
    // Add actors
    this.cat = this.addCat(game, 64, 160, 'bongo');
    this.bulletGroup = game.add.group();
    this.enemiesGroup = game.add.group();
    this.triggerGroup = game.add.group();

    // Add triggers
    this.addTriggers();
    
    // Add foreground
    this.foreground = this.map.createLayer('trees');

    // Controls 
    this.cursors = game.input.keyboard.createCursorKeys();
    this.shootButton = game.input.keyboard.addKey(Phaser.Keyboard.CONTROL);
    
    game.pathfinder = game.plugins.add(Phaser.Plugin.PathFinderPlugin, this.collisionLayer);

    game.camera.follow(this.cat);

  },

  addTriggers: function(){
    this.map.objects.triggers.forEach(function(data){
      var trigger, property;

      trigger = game.add.sprite(data.x, data.y, null);
      game.physics.arcade.enable(trigger);
      trigger.body.setSize(data.width, data.height, 0 ,0)

      for (property in data.properties) {
        trigger[property] = data.properties[property];
      }
      
      this.triggerGroup.add(trigger);    
    }.bind(this))
  },

  triggerWave: function(player, trigger) {
    var i, n, enemy = {}, squad, x, y, type, timeout, waveData, viewX;
    
    if (!trigger.live) return;
    trigger.live = false;
    
    waveData = this.levelData.waves[trigger.waveNumber];
    console.log(waveData)

    for (i = 0; i < waveData.squads.length; i++) {
      squad = waveData.squads[i];

      for (n = 0; n < squad.quantity; n++){
        viewX = null;
        if (squad.x == 'right') {
          viewX = true;
        }
        // Build data to go into closure
        enemy = Object.create(null);
        enemy.x = squad.x == 'left' ? 0 : viewX;
        enemy.y = squad.y == 'rnd' ? game.rnd.integerInRange(78,272) : squad.y;
        enemy.type = squad.type;
        enemy.timeout = squad.interval * n;

        function spawnCallback(enemyEnt){
          return function(viewX){
            game.time.events.add(enemyEnt.timeout, function(){
              if (viewX) {enemyEnt.x = game.camera.x + game.camera.view.width};
              console.log('enemy', enemyEnt.x, enemyEnt.y, enemyEnt.timeout)
              this.addEnemy(game, enemyEnt.x, enemyEnt.y, enemyEnt.type);
            }.bind(this));
          };
        };

        spawnCallback(enemy).bind(this)(viewX);

        // (function(enemy){
        //   game.time.events.add(enemy.timeout, function(){
        //     console.log('enemy', enemy.x, enemy.y, enemy.timeout)
        //     this.addEnemy(game, enemy.x, enemy.y, enemy.type);
        //   }, this);
        // }.bind(this))(enemy);
      } 
    }
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
  },

  hitTrunk: function(e) {
    console.log(e);
  },


  addCat: function(game, x,y, sprite) {
    var cat = new Cat(game, x, y, sprite);
    game.add.existing(cat);
    return cat;
  },

  addEnemy: function(game, x,y, sprite) {
    var elvis = new Enemy(game, x, y, sprite);
    elvis.setTarget(this.cat);
    game.add.existing(elvis);
    this.enemiesGroup.add(elvis);
    return elvis;
  },

  update: function() {
    game.physics.arcade.collide(this.cat, this.collisionLayer);
    game.physics.arcade.overlap(this.cat, this.enemiesGroup, this.onEnemyTouch);
    game.physics.arcade.collide(this.enemiesGroup, this.collisionLayer);
    game.physics.arcade.collide(this.bulletGroup, this.enemiesGroup, this.onBulletHit);
    game.physics.arcade.collide(this.bulletGroup, this.collisionLayer, this.onBulletHit);

    game.physics.arcade.overlap(this.cat, this.triggerGroup, this.triggerWave, null, this);
    // Move AI
    this.enemiesGroup.callAllExists('followPath', true);

    this.enemiesGroup.callAllExists('animate', true);

    // Move Player
    this.cat.move(this.cursors);
    this.cat.animate();

    if (this.shootButton.isDown) { this.shoot(); }
  },

  shoot: function(){
    if (this.bulletGroup.countLiving() > 50) { return; }

    if (this.bulletDelaySet == false) {
      var bullet = this.addBullet(game, this.cat);
      this.bulletDelaySet = true;
      
      game.time.events.add(200, function(){
        this.bulletDelaySet = false;
      }, this);
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

  onEnemyTouch: function() {
    game.camera.shake(0.01, 250);
  },


  render: function(){
    // function renderGroup(member) {    
    //   game.debug.body(member);
    // }
    // this.enemiesGroup.forEachAlive(renderGroup, this);
  }
};


