require(["engine/observe", "engine/event", "engine/raf-loop", "engine/hud", "engine/graphics"], 
        function(Observe, Event, RAFLoop, HUD, Graphics){

  var _hud = new HUD();

  // Create a mainLoop
  var _mainLoop = new RAFLoop(function(){
    Event.flush();
    Graphics.render();
    _mainLoop._event.dispatch("update");
  });

  // Give _mainLoop event capabilities
  Event(_mainLoop);

  // Create a scene using CubicVR
  function createTestScene(){
    var scene = new CubicVR.Scene(Graphics.viewport.width, Graphics.viewport.height, 60);
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
    scene.bind(boxObject);

    scene.camera.position = [1, 1, 1];
    scene.camera.target = [0, 0, 0];

    // Attach a listener to the "update" event on the _mainLoop
    _mainLoop._event.add("update", function(){
      boxObject.rotation[2] += 2;
    });

    return scene;
  }

  // Start graphics subsystem
  Graphics.setup({
    success: function(){
      _hud.showBigMessage("Loading...");
      Graphics.addScene(createTestScene());
      _mainLoop.start();
    },
    failure: function(){
      _hud.showBigMessage("Startup Error: Please make sure your browser is WebGL-capable.");
    }
  });

});