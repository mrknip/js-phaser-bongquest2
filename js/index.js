(function (window){
  'use strict';

  var BootState = require('./bootstate.js');
  var LoadingState = require('./loadingstate.js');
  var MainState = require('./main.js');

  var game = window.game = new Phaser.Game(640, 320, Phaser.AUTO, 'gameDiv');
    game.state.add('boot', BootState);
    game.state.add('load', LoadingState);
    game.state.add('main', MainState);
    game.state.start('boot', true, false, '\/data\/levels.json', 'main');
})(window);
