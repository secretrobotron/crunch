define(["engine/entity", "engine/game-logic", "components/sprite", "engine/schedule", "text!sprites/plane.json"], 
  function(Entity, GameLogic, SpriteComponent, Schedule, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  return function(setupOptions){
    setupOptions = setupOptions || {};

    console.log("Size: " + setupOptions.size);
    var entity = new Entity({
      name: "plane",
      families: setupOptions.families,
      components: [
        new SpriteComponent({
          size: setupOptions.size,
          sprite: SPRITE_JSON
        }),
      ],
      rotation: [0, 180, 10],
      position: [0, 10, -70]
    });
    GameLogic.EachFrame("plane").push( function(p,elapsedTime) {
      elapsedTime /= 20;
      p.position[0] += 0.4 * elapsedTime;
      p.position[1] += 0.04 * elapsedTime;
      //p.sceneObject.rotation[2] += 0.4 * elapsedTime;
    });


    return entity;

  };

});
