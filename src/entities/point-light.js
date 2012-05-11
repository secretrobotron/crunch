define(["engine/entity", "components/light", "engine/loader", "text!sprites/player.json"], 
  function(Entity, LightComponent){

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "point-light",
      components: [
        new LightComponent({
        }),
      ],
      position: setupOptions.position
    });

    return entity;

  };

});