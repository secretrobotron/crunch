define([  "engine/component", "engine/schedule", 
          "text!shaders/animated_sprite.frag", "text!shaders/animated_sprite.vert"], 
  function(Component, Schedule, FRAG_SRC, VERT_SRC){

  var mat4 = CubicVR.mat4;

  // Create a scene using CubicVR
  return Component("sprite", function(setupOptions){
    
    setupOptions = setupOptions || {};

    var _this = this;

    var mesh = new CubicVR.Mesh();
    var size = setupOptions.size || 0.5;
    var halfSize = size / 2;

    var spriteDescription = setupOptions.sprite;

    var uv = new CubicVR.UVMapper({
      projectionMode: "planar",
      projectionAxis: "z",
      scale: [size, size, size],
      center: [0, 0, 0]
    });
    
    mesh.addPoint([
      [halfSize, -halfSize, 0],
      [halfSize, halfSize, 0],
      [-halfSize, halfSize, 0],
      [-halfSize, -halfSize, 0]
    ]);

    mesh.addFace([
      [0, 1, 2, 3],
      [3, 2, 1, 0]
    ]);

    var _spriteCols = spriteDescription.numCols;
    var _spriteRows = spriteDescription.numRows;
    var _spriteLength = _spriteCols * _spriteRows;

    var _animShader = new CubicVR.CustomShader({
      vertex: VERT_SRC,
      fragment: FRAG_SRC,
      init: function(shader){
        shader.uNumCols.set(_spriteCols);
        shader.uNumRows.set(_spriteRows);
        shader.uCol.set(0);
        shader.uRow.set(0);
      }
    });

    _this.compile = function(textures){
      var cubicvrTextures = {};
      for(var t in textures){
        if(textures.hasOwnProperty(t)){
          cubicvrTextures[t] = new CubicVR.CanvasTexture(textures[t]);
        }
      }

      var material = new CubicVR.Material({
        textures: cubicvrTextures,
        shader: _animShader
      });

      mesh.setFaceMaterial(material);
      mesh.calcFaceNormals();
      uv.apply(mesh, material);
      mesh.prepare();
    };

    var _sceneObject = _this.sceneObject = new CubicVR.SceneObject(mesh);
    _this.collisionPoints = [
      {
        name: "b1",
        pos: [0, 0]
      }
    ];

    if(setupOptions.position){
      _sceneObject.position = setupOptions.position;
    }

    var _animationIndex = 0;
    var _animationOffset = spriteDescription.animation.index;
    var _animationLength = spriteDescription.animation.frameCount;
    var _animaionSpeed = spriteDescription.animation.speed;

    Schedule.event.add("update", function(e){
      if(_animShader.ready()){
        _animationIndex += e.data.dt / 1000 * _animaionSpeed;
        _animationIndex = _animationIndex % _animationLength;

        var i = Math.floor(_animationIndex) + _animationOffset;
        var row = Math.floor(i/_spriteRows);
        var col = i % _spriteCols;

        _animShader.uCol.set(col);
        _animShader.uRow.set(row);
      }
    });

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.sceneObject.bindChild(_sceneObject);
    });

  });

});
