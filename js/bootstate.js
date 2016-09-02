'use strict';

var BootState = BootState || {};

BootState = function() {
  Phaser.State.call(this);

};
BootState.prototype = Object.create(Phaser.State.prototype);
BootState.constructor = BootState;

BootState.prototype.init = function (levelFile, nextState) {
  this.levelFile = levelFile;
  this.nextState = nextState;
};

BootState.prototype.preload = function () {
  this.load.image('loadbar', 'assets/img/progressbar.png');
  
  this.load.text('levelText', this.levelFile);

};

BootState.prototype.create = function () {
  var levelData, levelText;
  levelText = this.game.cache.getText('levelText');
  levelData = JSON.parse(levelText);

  this.game.state.start('load', true, false, levelData, this.nextState);
};

module.exports = BootState;
