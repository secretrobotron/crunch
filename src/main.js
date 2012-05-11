require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/test-entity",
          "engine/loader",
        ], 
        function(Schedule, HUD, Graphics, Scene, TestEntity, Loader){

  var _hud = new HUD();

  Loader.lock();

  function createTestScene(){
    
    var scene = new Scene();

    var testEntity = new TestEntity({
      position: [0, 0.1, 0]
    });

    scene.addEntity(testEntity);
  
    scene.cubicvr.camera.target = [0, 0, 0];
    scene.cubicvr.camera.position = [1, 1, 1];

    var cameraIndex = 0;

    Schedule.event.add("update", function(e){
      cameraIndex += e.data.dt / 1000;
      var cameraPos = scene.cubicvr.camera.position;
      cameraPos[0] = 2*Math.sin(cameraIndex);
      cameraPos[2] = 2*Math.cos(cameraIndex);
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