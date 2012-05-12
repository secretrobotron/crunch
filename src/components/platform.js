define(["engine/component", "engine/schedule", "text!shaders/screen-coordinates.frag", "text!shaders/screen-coordinates.vert"], 
  function(Component, Schedule, SCRN_COORDS_FRAG_SRC, SCRN_COORDS_VERT_SRC){

  var mat4 = CubicVR.mat4;

  return Component("platform", function(setupOptions){
    
    setupOptions = setupOptions || {};

    var _this = this;

    var mesh = new CubicVR.Mesh();
    var size = setupOptions.size || [0.5, 0.5, 0.5];

    var uv = new CubicVR.UVMapper({
      projectionMode: "cubic",
      scale: [1, 1, 1],
      center: [0, 0, 0]
    });

    mesh.addPoint([
      [size[0], -size[1], size[2]],
      [size[0], size[1], size[2]],
      [-size[0], size[1], size[2]],
      [-size[0], -size[1], size[2]],
      [size[0], -size[1], -size[2]],
      [size[0], size[1], -size[2]],
      [-size[0], size[1], -size[2]],
      [-size[0], -size[1], -size[2]]
    ]);

    mesh.addFace([
      [0, 1, 2, 3],
      [7, 6, 5, 4],
      [4, 5, 1, 0],
      [5, 6, 2, 1],
      [6, 7, 3, 2],
      [7, 4, 0, 3]
    ]);

    var _screenCoordsShader = new CubicVR.CustomShader({
      vertex: SCRN_COORDS_VERT_SRC,
      fragment: SCRN_COORDS_FRAG_SRC,
      init: function(shader){
      }
    });

    var _shadowIndex = 0;

    _this.compile = function(textures){
      var cubicvrTextures = {};
      for(var t in textures){
        if(textures.hasOwnProperty(t)){
          cubicvrTextures[t] = new CubicVR.CanvasTexture(textures[t]);
        }
      }

      var sideMaterial = new CubicVR.Material({
        textures: cubicvrTextures,
        shader: _screenCoordsShader
      });

      Schedule.event.add("update", function(){
        _shadowIndex += 0.01;
        _screenCoordsShader.uShadowIndex.set(_shadowIndex);
      });

      var topMaterial = new CubicVR.Material({
        color: [0.7, 0.7, 0.7]
      })
      
      mesh.setFaceMaterial(sideMaterial);
      mesh.calcFaceNormals();
      uv.apply(mesh, sideMaterial);
      mesh.setFaceMaterial(topMaterial, 3);
      mesh.prepare();
    };

    var _sceneObject = _this.sceneObject = new CubicVR.SceneObject(mesh);

    if(setupOptions.position){
      _sceneObject.position = setupOptions.position;
    }

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.sceneObject.bindChild(_sceneObject);
    });

  });

});