define(["engine/entity", "engine/game-logic", "components/sprite", "text!sprites/monster.json"], 
  function(Entity, GameLogic, SpriteComponent, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

   GameLogic.EachFrame("Monster").push( function(p, elapsedTime) {
    if(p.speed[1] < -0.001) {
      p.setAnimation("jumpDown");
    } else if (p.speed[1] > 0.001) {
      p.setAnimation("jumpUp");
    }

    if(GameLogic.IsGrounded(p)) {
      p.setAnimation("run");
    }

    p.updateBB();
  });

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: 7,
          sprite: SPRITE_JSON
        }),
      ],
      families : ["Monster", "HasCollisionPoints", "Physical"],
      collisionPoints: { // TODO fix the collisionPoints positions
        downA1: [-0.3, -0.6, 0], 
        downA2: [-0.3, -0.90, 0],
        downB1: [ 0.3, -0.6, 0], 
        downB2: [ 0.3, -0.90, 0],
        right1: [0.5, -0.3, 0],
        right2: [0.6, -0.3, 0]
      },
      speed:[0,0,0],
      position: setupOptions.position,
      rotation: setupOptions.rotation,
      size: [2, 2]
    });

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    return entity;

  };

});
