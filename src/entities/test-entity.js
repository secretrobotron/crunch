define(["engine/entity", "components/cube", "engine/loader"], 
  function(Entity, CubeComponent, Loader){

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "test",
      components: [
        new CubeComponent({
          size: setupOptions.size,
        }),
      ],
      position: setupOptions.position
    });

    Loader.load(Loader.Image("assets/images/2282-diffuse.jpg"), function(image){
      entity.components["cube"].compile({
        color: image
      });
    });

    return entity;

  };

});