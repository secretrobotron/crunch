define(["engine/entity", "engine/loader", "engine/game-logic", "components/sprite", "text!sprites/pigeon.json"], 
  function(Entity, Loader, GameLogic, SpriteComponent, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  var SIZE = 3.1;
  var birdSfx = null;
  var loadOnlyOnce = true;

  GameLogic.EachFrame("Flying").push(function(p,elapsedTime){
    p.position[0] -= elapsedTime/100;
    p.aabb[0][0] -= elapsedTime/100;
    p.aabb[1][0] -= elapsedTime/100;
  });

  return function(setupOptions){


  if( Loader.IsAudioAvailable() && loadOnlyOnce ) {
    loadOnlyOnce = false;
    Loader.load(Loader.Audio("assets/audio/bird.wav"), function(audio){
      birdSfx = audio;
    });
  }

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: SIZE,
          sprite: SPRITE_JSON
        }),
      ],
      families : ["Monster", "Flying"],
      collisionPoints: { // TODO fix the collisionPoints positions
        downA1: [-SIZE*.1, -SIZE/2*.9, 0], 
        downA2: [-SIZE*.1, -SIZE/2*.95, 0],
        downB1: [ SIZE*.1, -SIZE/2*.9, 0], 
        downB2: [ SIZE*.1, -SIZE/2*.95, 0],
        right1: [SIZE/2*.6, -SIZE/2*.2, 0],
        right2: [SIZE/2*.7, -SIZE/2*.2, 0]
      },
      speed:[0,0,0],
      position: setupOptions.position,
      rotation: setupOptions.rotation,
      size: [SIZE, SIZE]
    });

    entity.hit = function() {
      if (entity.hasPlayedSound)
        return;
      entity.hasPlayedSound = true;
      if (birdSfx) {
         birdSfx.cloneNode().play();
      }
    }

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    return entity;

  };

});
