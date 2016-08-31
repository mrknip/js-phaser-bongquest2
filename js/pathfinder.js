function Pathfinder (game, parent) {
  Phaser.Plugin.call(this, game, parent);

  this.easystar = EasyStar.js();
}

Pathfinder.prototype = Object.create(Phaser.Plugin.prototype);
Pathfinder.constructor = Pathfinder;

Pathfinder.prototype.init = function () {
  console.log('hi')
}
