define(["engine/entity", "components/cube", "engine/loader"], 
  function(Entity, CubeComponent, Loader){

  return function(loader, options){

    options = options || {};

    var entity = new Entity({
      name: "test",
      components: [
        new CubeComponent({
          position: options.position
        }),
      ]
    });

    Loader.load(Loader.Image("assets/images/2282-diffuse.jpg"), function(image){
      entity.components["cube"].compile({
        color: image
      });
    });

    return entity;

  };

});