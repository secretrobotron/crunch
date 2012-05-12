define(["engine/entity", "components/sprite", "text!sprites/monster.json"], 
  function(Entity, SpriteComponent, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: setupOptions.size,
          sprite: SPRITE_JSON
        }),
      ],
      families: setupOptions.families,
      collisionPoints: setupOptions.collisionPoints,
      speed: setupOptions.speed,
      position: setupOptions.position,
      rotation: setupOptions.rotation, 
    });

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    return entity;

  };

});
