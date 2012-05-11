require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/test-entity",
          "entities/player",
          "entities/point-light",
          "engine/loader",
          "engine/game-logic"
        ], 
        function(Schedule, HUD, Graphics, Scene, TestEntity, PlayerEntity, PointLightEntity, Loader, GameLogic){

  var _hud = new HUD();

  Loader.lock();

  function createTestScene(){
    
    var scene = new Scene();

    var playerEntity = new PlayerEntity({
      position: [0, 0, 0],
      size: 1
    });

    var testEntity = new TestEntity({
      position: [0, 0, 1.5],
      size: 1
    });

    var pointlightEntity = new PointLightEntity({
      position: [0, 0, -2]
    });

    scene.addEntity(testEntity);
    scene.addEntity(playerEntity);
    scene.addEntity(pointlightEntity);

    scene.cubicvr.camera.target = [0, 0, 0];
    scene.cubicvr.camera.position = [.5, 1, -2];

    //scene.cubicvr.bind(pointlightEntity.components["light"].cubicvr);

    var cameraIndex = 0;

    Schedule.event.add("update", function(e){
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