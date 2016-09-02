(function (){


  var game = new Phaser.Game(640, 320, Phaser.AUTO, 'gameDiv');

  BootState = require('./bootstate.js');
  LoadingState = require('./loadingstate.js');
  MainState = require('./main.js');

  Entity = require('./entity.js');
  Bullet = require('./bullet.js');

      // Entity = Bongquest.Entity;
      // game.Bullet = Bongquest.Bullet;

      game.state.add('boot', BootState);
      game.state.add('load', LoadingState);
      game.state.add('main', MainState);
      game.state.start('boot', true, false, "\/data\/levels.json", 'main');

})()
