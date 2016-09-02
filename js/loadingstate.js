"use strict";

var LoadingState = LoadingState || {};

LoadingState = function() {
  Phaser.State.call(this)

}
LoadingState.prototype = Object.create(Phaser.State.prototype);
LoadingState.constructor = constructor;

LoadingState.prototype.init = function (levelData, nextState) {
  this.levelData = levelData;
  this.nextState = nextState;
}

LoadingState.prototype.preload = function () {
  var assets, key, asset, path, text;
  assets = this.levelData.assets;

  this.stage.backgroundColor = '#AAAAAA';
  this.addProgressBar(assets);

  for (key in assets) {
    asset = assets[key];
    path = assets.ROOT + assets.PATH[asset.type];

    switch(asset.type) {
      case 'spritesheet':
        this.load.spritesheet(key, path + asset.source, asset.frameWidth, asset.frameHeight);
        break;
      case 'image':
        this.load.image(key, path + asset.source);
        break;
      case 'tilemap':
        this.load.tilemap(key, path + asset.source, null, Phaser.Tilemap.TILED_JSON)
        break;
    }
  }
}

LoadingState.prototype.addProgressBar = function (assets) {
  this._loadingBar = this.add.sprite(this.world.centerX - this.levelData.loadbar.width / 2, 
                                     this.world.centerY, 
                                     this.levelData.loadbar.key);            
  this._loadingBar.anchor.setTo(0, 0.5);
  this.load.setPreloadSprite(this._loadingBar);

  this.load.onLoadComplete.add(this.onLoadComplete, this)
}

LoadingState.prototype.onLoadComplete = function () {
  this.time.events.add(Phaser.Timer.HALF, function(){
    this.game.state.start('main', true, false, this.levelData);
  }, this)
}

module.exports = LoadingState;
