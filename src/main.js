require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/test-entity",
          "entities/player",
          "engine/loader",
          "engine/game-logic",
          "entities/floor"
        ], 
        function(Schedule, HUD, Graphics, Scene, TestEntity, PlayerEntity, Loader, GameLogic, FloorEntity){

  var DEFAULT_FLOOR_Y = -3;
  var DEFAULT_FLOOR_X = -20;

  var _hud = new HUD();

  Loader.lock();

  function createTestScene(){
    
    var scene = new Scene();

    var playerEntity = new PlayerEntity({
      position: [0, 0, 0],
      rotation: [0, 180, 0],
      families : ["Player", "HasCollisionPoints"],
      size: 1
    });
    GameLogic.AddGameObject(playerEntity);
    scene.add(playerEntity);

    GameLogic.OnBoxCollision("Player","floor").push(
      function(hero,enemy) {
        console.log("col");
      }
    );

    var testLight = new CubicVR.Light({
      type: "area",
      intensity: 0.9,
      mapRes: 2048,  // 4096 ? 8192 ? ;)
      areaCeiling: 40,
      areaFloor: -40,
      areaAxis: [25,5] // specified in degrees east/west north/south
    });
    
    scene.cubicvr.bind(testLight);

    var x = DEFAULT_FLOOR_X;
    for(var i = 0; i < 40; ++i){
      var h = 0.2 + Math.random() * 1;
      var w = 1 + Math.random() * 1;
      x += w * 2;
      var floorEntity = new FloorEntity({
        position: [x, DEFAULT_FLOOR_Y + h, 0],
        families : ["floor", "PointCollision"],
        width: w,
        height: h
      });
      GameLogic.AddGameObject(floorEntity);
      scene.add(floorEntity);
    }

    scene.cubicvr.camera.target = [0, 0, 0];
    scene.cubicvr.camera.position = [0, 0, 5];

    scene.cubicvr.setSkyBox(new CubicVR.SkyBox({texture: "assets/images/8bit-sky.jpg"}));

    CubicVR.setGlobalAmbient([0.3,0.3,0.3]);

    var cameraIndex = 0;

    Schedule.event.add("update", function(e){
      var dx = e.data.dt / 300;
      scene.cubicvr.camera.position[0] += dx;
      scene.cubicvr.camera.target[0] += dx;
      //pointLight.position[0] += dx;
      playerEntity.sceneObject.position[0] += dx;
      GameLogic.DoOneFrame();
    });
    
    return scene;
  }

  // Start graphics subsystem
  Graphics.setup({
    success: function(){
      _hud.showBigMessage("Loading...");
      Graphics.addScene(createTestScene());
      Schedule.start();
      Loader.unlock(function(){
        _hud.hideBigMessage();
      });
    },
    failure: function(){
      _hud.showBigMessage("Startup Error: Please make sure your browser is WebGL-capable.");
    }
  });

});
