define(["engine/entity", "engine/schedule", "components/platform", "engine/loader"], 
  function(Entity, Schedule, PlatformComponent, Loader){

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

    if(setupOptions.moving){
      var originalPosition = entity.position.slice();
      var variance = Math.random();
      Schedule.event.add("update", function(e){
        entity.position[1] = originalPosition[1] + Math.sin(Date.now()/300 + variance) * 2
        entity.updateBB();
      });      
    }

    return entity;

  };

});
