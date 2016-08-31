"use strict";

var Bongquest = Bongquest || {};

Bongquest.BootState = function() {
  Phaser.State.call(this)

}
Bongquest.BootState.prototype = Object.create(Phaser.State.prototype);
Bongquest.BootState.constructor = Bongquest.constructor;

Bongquest.BootState.prototype.init = function (levelFile, nextState) {
  this.levelFile = levelFile;
  this.nextState = nextState;
}

Bongquest.BootState.prototype.preload = function () {
  this.load.text('levelText', this.levelFile);
}

Bongquest.BootState.prototype.create = function () {
  var levelData, levelText;
  levelText = this.game.cache.getText('levelText')
  levelData = JSON.parse(levelText);
  this.game.state.start('load', true, false, levelData, this.nextState);
}
