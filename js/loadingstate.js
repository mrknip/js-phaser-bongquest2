"use strict";

var Bongquest = Bongquest || {};

Bongquest.LoadingState = function() {
  Phaser.State.call(this)

}
Bongquest.LoadingState.prototype = Object.create(Phaser.State.prototype);
Bongquest.LoadingState.constructor = Bongquest.constructor;

Bongquest.LoadingState.prototype.init = function (levelData, nextState) {
  this.levelData = levelData;
  this.nextState = nextState;
}

Bongquest.LoadingState.prototype.preload = function () {
  var assets, key, asset, path;
  assets = this.levelData.assets;
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

Bongquest.LoadingState.prototype.create = function () {
   this.game.state.start('main', true, false, this.levelData);
}
