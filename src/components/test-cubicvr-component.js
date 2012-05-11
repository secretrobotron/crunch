define(["engine/component", "engine/schedule"], function(Component, Schedule){

  // Create a scene using CubicVR
  return Component("test-cubicvr", function(){
    
    var _this = this;

    var boxMesh = new CubicVR.Mesh({ 
      primitive: {
        type: "box",
        size: 1.0,
        material: {
          textures: {
              color: "assets/images/2282-diffuse.jpg"
          }
        },
        uv: {
          projectionMode: "cubic",
          scale: [1, 1, 1]
        }
      },
      compile: true
    });

    var boxObject = new CubicVR.SceneObject(boxMesh);

    // Attach a listener to the "update" event on the Schedule
    Schedule.event.add("update", function(e){
      boxObject.rotation[2] += e.data.dt / 10;
    });

    _this.sceneObject = boxObject;

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      if(entity.scene){
        entity.scene.cubicvr.bind(boxObject);
      }
      else {

      }
    });

  });

});