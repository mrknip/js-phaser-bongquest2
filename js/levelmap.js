'use strict';

var LevelMap = LevelMap || {};

LevelMap = function (game, key) {
  Phaser.Tilemap.call(this, game, key);
};

LevelMap.prototype = Object.create(Phaser.Tilemap.prototype);
LevelMap.prototype.constructor = LevelMap;

/**
* Builds all map layers.  Takes a callback to add characters etc into
* indexes between background/collision and foreground
*/
LevelMap.prototype.build = function (callback, context) {
  this.buildBackground();
  callback.call(context);
  this.buildForeground();

  return this;
};

LevelMap.prototype.buildBackground = function() {
  this.tilesets.forEach(function(tileset){
    this.addTilesetImage(tileset.name, (tileset.name + 'tiles'));
  }, this);

  this.layers.forEach(function(layer){
    if (layer.properties.foreground) {
      this.foreground = this.foreground || [];
      this.foreground.push(layer);
    } else {
      this[layer.name] = this.createLayer(layer.name);
      if (layer.name === 'background') {
        this[layer.name].resizeWorld()
      }
      if (layer.properties.collisionEnabled) {
        this.setCollisionBetween(0, 200, true, this[layer.name])
      }  
    }
  }, this)
};

LevelMap.prototype.buildForeground = function(){
  if (this.foreground && this.foreground.length > 0) {
    this.foreground.forEach(function(layer){
      this[layer.name] = this.createLayer(layer.name);
    }, this);

    return;
  }
};

LevelMap.prototype.addTriggers = function(triggerGroup) {
  this.objects.triggers.forEach(function(data){
    var trigger, property;

    trigger = this.game.add.sprite(data.x, data.y, null);
    this.game.physics.arcade.enable(trigger);
    trigger.body.setSize(data.width, data.height, 0 ,0);

    for (property in data.properties) {
      if (data.properties.hasOwnProperty(property)) {
        trigger[property] = data.properties[property];
      }
    }
    
    triggerGroup.add(trigger);    
  }.bind(this));
};

LevelMap.prototype.getTileXY = function(obj) {
  var tileX = this.background.getTileX(obj.x),
      tileY = this.background.getTileY(obj.y);
  
  return new Phaser.Point(tileX, tileY);
};

LevelMap.prototype.getPixelXY = function(tileCoord){
  var x = (tileCoord.x * this.tileWidth) + this.tileWidth / 2,
      y = (tileCoord.y * this.tileHeight) + this.tileHeight / 2;

  return new Phaser.Point(x,y);
};

module.exports = LevelMap;
