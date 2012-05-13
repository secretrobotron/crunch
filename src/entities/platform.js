define(["engine/entity", "components/platform", "engine/loader"], 
  function(Entity, PlatformComponent, Loader){

  var DEFAULT_FLOOR_DEPTH = 3;

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "platform",
      families: ["floor", "PointCollision"],
      components: [
        new PlatformComponent({
          size: [setupOptions.width, setupOptions.height, DEFAULT_FLOOR_DEPTH],
        }),
      ],
      position: setupOptions.position,
      size: [setupOptions.width, setupOptions.height]
    });

    return entity;

  };

});
