define(["engine/entity", "components/platform", "engine/loader"], 
  function(Entity, PlatformComponent, Loader){

  var DEFAULT_FLOOR_DEPTH = 1;

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "platform",
      components: [
        new PlatformComponent({
          size: [setupOptions.width, setupOptions.height, DEFAULT_FLOOR_DEPTH],
        }),
      ],
      position: setupOptions.position
    });

    Loader.load(Loader.Image("assets/images/2282-diffuse.jpg"), function(image){
      entity.components["platform"].compile({
        color: image,
      });
    });

    return entity;

  };

});