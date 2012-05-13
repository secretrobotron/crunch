define(["engine/entity", "engine/game-logic", "components/sprite", "text!sprites/pigeon.json"], 
  function(Entity, GameLogic, SpriteComponent, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  var SIZE = 7;

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: SIZE,
          sprite: SPRITE_JSON
        }),
      ],
      families : ["Monster", "HasCollisionPoints", "Flying"],
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

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    return entity;

  };

});
