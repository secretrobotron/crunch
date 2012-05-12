window.dump = window.dump || function(){};

require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/test-entity",
          "entities/player",
          "engine/loader",
          "engine/level",
          "engine/game-logic",
          "entities/platform"
        ], 
        function(Schedule, HUD, Graphics, Scene, TestEntity, PlayerEntity, Loader, Level, GameLogic, PlatformEntity){

  var DEFAULT_FLOOR_Y = 0;
  var DEFAULT_FLOOR_X = -20;
  var DEFAULT_FLOOR_H = 3;
  var DEFAULT_FLOOR_H_VAR = 2;

  Loader.lock();

  function createTestScene(){
    
    var scene = new Scene();

    var playerEntity = new PlayerEntity({
      position: [3, 8, 0],
      rotation: [0, 180, 0],
      families : ["Player", "HasCollisionPoints","Physical"],
      collisionPoints: {
        down1: [0,0,0],
        down2: [0,-0.2,0]
      },
      speed:[0,0,0],
      size: 3
    });

    GameLogic.AddGameObject(playerEntity);
    scene.add(playerEntity);

    GameLogic.EachFrame("Player").push( function(p) {
      p.sceneObject.position[0] += 0.05;
    } );

    GameLogic.EachFrame("Physical").push( function(p,elapsedTime) {
      if (!p.collisionPoints.down2.state){
        p.speed[1] -= 0.03;
        p.sceneObject.position[1] += p.speed[1];
      } else {
        p.speed[1] = 0;
      }

      if (p.collisionPoints.down1.state) {
        p.sceneObject.position[1] += 0.1;
      }

    });

    var testLight = new CubicVR.Light({
      type: "area",
      intensity: 0.9,
      mapRes: 2048,  // 4096 ? 8192 ? ;)
      areaCeiling: 40,
      areaFloor: -40,
      areaAxis: [25,5] // specified in degrees east/west north/south
    });
    
    scene.cubicvr.bind(testLight);

    var level = new Level({
      // Where the levle starts in space
      levelOrigin: [-20, 1, 0],
      // How long the level is
      goalAtY: 60,
      // The families given to the floor used for GameLogic
      floorFamilies: ["floor", "PointCollision"],
    });

    // Transform the setup options into platforms entity
    // and add them to the scene.
    level.buildToScene(scene);

    scene.cubicvr.camera.target = [0, 3, 0];
    scene.cubicvr.camera.position = [0, 8, 20];
    scene.cubicvr.camera.setFOV(45);

    scene.cubicvr.setSkyBox(new CubicVR.SkyBox({texture: "assets/images/8bit-sky.jpg"}));

    CubicVR.setGlobalAmbient([0.3,0.3,0.3]);

    var cameraIndex = 0;

    Schedule.event.add("update", function(e){
      var dx = e.data.dt / 300;
      scene.cubicvr.camera.position[0] += dx;
      scene.cubicvr.camera.target[0] += dx;
      //pointLight.position[0] += dx;
      //playerEntity.move(dx);
      GameLogic.DoOneFrame();
    });
    
    return scene;
  }

  // Start graphics subsystem
  Graphics.setup({
    success: function(){
      HUD.showBigMessage("Loading...");
      Graphics.addScene(createTestScene());
      Schedule.start();
      Loader.unlock(function(){
        HUD.hideBigMessage();
      });
    },
    failure: function(){
      HUD.showBigMessage("Startup Error: Please make sure your browser is WebGL-capable.");
    }
  });

});
