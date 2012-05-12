define(["engine/entity", "components/box", "engine/loader"], 
  function(Entity, BoxComponent, Loader){

  var DEFAULT_FLOOR_DEPTH = 1;

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      families: setupOptions.families,
      components: [
        new BoxComponent({
          size: [setupOptions.width, setupOptions.height, DEFAULT_FLOOR_DEPTH],
        }),
      ],
      position: setupOptions.position
    });

    Loader.load(Loader.Image("assets/images/2282-diffuse.jpg"), function(image){
      entity.components["box"].compile({
        color: image,
      });
    });

    return entity;

  };

});
