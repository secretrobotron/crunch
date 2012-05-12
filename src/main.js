window.dump = window.dump || function(){};

require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/test-entity",
          "entities/player",
          "engine/loader",
          "engine/game-logic",
          "entities/platform"
        ], 
        function(Schedule, HUD, Graphics, Scene, TestEntity, PlayerEntity, Loader, GameLogic, PlatformEntity){

  var DEFAULT_FLOOR_Y = 1;
  var DEFAULT_FLOOR_X = -20;
  var DEFAULT_FLOOR_H = 2;
  var DEFAULT_FLOOR_H_VAR = 2;

  var _hud = new HUD();

  Loader.lock();

  function createTestScene(){
    
    var scene = new Scene();

    var playerEntity = new PlayerEntity({
      position: [3, 8, 3],
      rotation: [0, 180, 0],
      families : ["Player", "HasCollisionPoints","Physical"],
      collisionPoints: {
        down1: [0,0,0],
        down2: [0,-0.2,0]
      },
      speed:[0,0,0],
      size: 3
    });
    playerEntity.move = function(dx) {
      //dump("move\n");
      var startY = playerEntity.sceneObject.position[1];
      for (var i = 0.001; i < dx; i+=0.001) {
        playerEntity.isCollisionFloor = false;
        playerEntity.sceneObject.position[1] = startY - i;
        //GameLogic.DoOneFrame();
        if (playerEntity.isCollisionFloor) {
          dump("break\n");
          break;
        }
      }
      //dump("Pre: " + playerEntity.sceneObject.children[0].getAABB() + "\n");
      while (playerEntity.isCollisionFloor === true) {
        //dump("Enter\n");
        playerEntity.isCollisionFloor = false;
        playerEntity.sceneObject.position[1] = playerEntity.sceneObject.position[1] + 0.1;
        playerEntity.sceneObject.dirty = true;
        playerEntity.sceneObject.children[0].dirty = true;
        //GameLogic.DoOneFrame();
        break;
      }
      playerEntity.sceneObject.position[0] += dx;
      //GameLogic.DoOneFrame();
      //if (
    };

    GameLogic.AddGameObject(playerEntity);
    scene.add(playerEntity);

    GameLogic.OnBoxCollision("Player","floor").push(
      function(hero,floor) {
        //dump("Col  " + (hero == playerEntity) + "\n");
        dump(playerEntity.sceneObject.position[1] + "\n");
        hero.isCollisionFloor = true;
      }
    );

    GameLogic.EachFrame("Player").push( function(p) {
      p.sceneObject.position[0] += 0.12;
    } );

    GameLogic.EachFrame("Physical").push( function(p,elapsedTime) {
      if (!p.collisionPoints.down2.state){
        p.speed[1] -= 0.03;
        p.sceneObject.position[1] += p.speed[1];
        console.log("in the air");
      } else {
        p.speed[1] = 0;
        console.log("grounded");
      }

      if (p.collisionPoints.down1.state) {
        p.sceneObject.position[1] += 0.1;
        console.log("into the ground!");
      }

      console.log(p.sceneObject.position[1]);
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

    var x = DEFAULT_FLOOR_X;
    for(var i = 0; i < 30; ++i){
      var h = DEFAULT_FLOOR_H + Math.random() * DEFAULT_FLOOR_H_VAR;
      var w = 1 + Math.random() * 1;
      x += w * 2;
      var floorEntity = new PlatformEntity({
        position: [x, DEFAULT_FLOOR_Y + h, 0],
        families : ["floor", "PointCollision"],
        width: w,
        height: h
      });
      GameLogic.AddGameObject(floorEntity);
      scene.add(floorEntity);
    }

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
