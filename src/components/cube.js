define(["engine/component", "engine/schedule"], function(Component, Schedule){

  var mat4 = CubicVR.mat4;

  // Create a scene using CubicVR
  return Component("cube", function(){
    
    var _this = this;

    var mesh = new CubicVR.Mesh();
    var size = 0.5;

    var uv = new CubicVR.UVMapper({
      projectionMode: "cubic",
      scale: [1, 1, 1]
    });
    
    mesh.addPoint([
      [size, -size, size],
      [size, size, size],
      [-size, size, size],
      [-size, -size, size],
      [size, -size, -size],
      [size, size, -size],
      [-size, size, -size],
      [-size, -size, -size]
    ]);

    mesh.addFace([
      [0, 1, 2, 3],
      [7, 6, 5, 4],
      [4, 5, 1, 0],
      [5, 6, 2, 1],
      [6, 7, 3, 2],
      [7, 4, 0, 3]
    ]);

    _this.compile = function(textures){
      var cubicvrTextures = {};
      for(var t in textures){
        if(textures.hasOwnProperty(t)){
          cubicvrTextures[t] = new CubicVR.CanvasTexture(textures[t]);
        }
      }

      var material = new CubicVR.Material({
        textures: cubicvrTextures
      });
      mesh.setFaceMaterial(material);
      mesh.calcFaceNormals();
      uv.apply(mesh, material);
      mesh.prepare();
    };

    var sceneObject = _this.sceneObject = new CubicVR.SceneObject(mesh);

    // Attach a listener to the "update" event on the Schedule
    Schedule.event.add("update", function(e){
      sceneObject.rotation[2] += e.data.dt / 10;
    });

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.sceneObject.bindChild(sceneObject);
    });

  });

});