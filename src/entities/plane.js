define(["engine/entity", "engine/game-logic", "components/sprite", "engine/schedule", "text!sprites/plane.json"], 
  function(Entity, GameLogic, SpriteComponent, Schedule, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  return function(setupOptions){
    return;
    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "plane",
      components: [
        new SpriteComponent({
          size: setupOptions.size,
          sprite: SPRITE_JSON
        }),
      ],
      families: setupOptions.families,
    });

    return entity;

  };

});
