define([  "engine/component", "engine/schedule", "engine/loader",
          "text!shaders/animated_sprite.frag", "text!shaders/animated_sprite.vert"], 
  function(Component, Schedule, Loader, FRAG_SRC, VERT_SRC){

  var mat4 = CubicVR.mat4;

  var __materials = {};
  var __meshes = {};

  // Create a scene using CubicVR
  return Component("sprite", function(setupOptions){
    
    setupOptions = setupOptions || {};

    var _this = this;

    var mesh;
    var size = setupOptions.size || 0.5;
    var halfSize = size / 2;
    var spriteDescription = setupOptions.sprite;
    var _spriteCols = spriteDescription.numCols;
    var _spriteRows = spriteDescription.numRows;
    var _spriteLength = _spriteCols * _spriteRows;

    _this.currentAnimation = spriteDescription.defaultAnimation;

    function compile(material){
      var uv = new CubicVR.UVMapper({
        projectionMode: "planar",
        projectionAxis: "z",
        scale: [size, size, size],
        center: [0, 0, 0]
      });
      mesh.setFaceMaterial(material);
      mesh.calcFaceNormals();
      uv.apply(mesh, material);
      mesh.prepare();
    }

    if(__meshes[size]){
      mesh = __meshes[size];
    }
    else{
      mesh = new CubicVR.Mesh();
      
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

      if(!__materials[spriteDescription.resource]){
        Loader.load(Loader.Image(spriteDescription.resource), function(image){
          var cubicvrTextures = {
            color: new CubicVR.CanvasTexture(image)
          }

          var _animationIndex = 0;
          
          Schedule.event.add("update", function(e){
            if(_animShader.ready()){

              if(!_this.currentAnimation) {
                return;
              } 

              var _animationOffset = spriteDescription.animations[_this.currentAnimation].index;
              var _animationLength = spriteDescription.animations[_this.currentAnimation].frameCount;
              var _animaionSpeed = spriteDescription.animations[_this.currentAnimation].speed;

              _animationIndex += e.data.dt / 1000 * _animaionSpeed;
              _animationIndex = _animationIndex % _animationLength;

              var i = Math.floor(_animationIndex) + _animationOffset;
              var row = Math.floor(i/_spriteRows);
              var col = i % _spriteCols;

              _animShader.uCol.set(col);
              _animShader.uRow.set(row);
            }
          });

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

          var material = new CubicVR.Material({
            textures: cubicvrTextures,
            shader: _animShader
          });

          __materials[spriteDescription.resource] = material;
          compile(material);
        });
      }
      else{
        compile(__materials[spriteDescription.resource]);
      }

      __meshes[size] = mesh;
    }

    var _sceneObject = _this.sceneObject = new CubicVR.SceneObject(mesh);
    _this.collisionPoints = [
      {
        name: "b1",
        pos: [0, 0]
      }
    ];

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.sceneObject.bindChild( _sceneObject );
    });

  });

});
