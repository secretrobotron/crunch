window.dump = window.dump || function(){};

require([ "engine/schedule", "engine/hud",
          "engine/graphics", "engine/scene",
          "entities/player",
          "engine/loader",
          "engine/level",
          "engine/game-logic",
          "entities/platform",
          "engine/debug-canvas"
        ], 
        function( Schedule, HUD, Graphics, Scene, 
                  PlayerEntity, Loader, 
                  Level, GameLogic, PlatformEntity, DebugCanvas){

  var DEFAULT_FLOOR_Y = -5;
  var DEFAULT_FLOOR_X = -20;
  var DEFAULT_FLOOR_H = 10;
  var FLOOR_Y_VAR = 2;

  Loader.lock();

  var wilhelmCry = null;
/*  Loader.load(Loader.Audio("assets/audio/WilhelmScream.ogg"), function(audio){
    wilhelmCry = audio;
  });
*/

  function beat() {
    //console.log("beat");
  }
  function spectrum_callback(spectrum) {
    //console.log(spectrum);
  }
  function vu_callback(vu) {
    //console.log(vu);
  }

  if (navigator.userAgent.indexOf("Firefox")!=-1) {
    new BeatHelper("assets/audio/track.ogg", beat, spectrum_callback);
  }


  DebugCanvas.SetEnabled(false);

  function createTestScene(){
    
    var scene = new Scene();

    var playerEntity = new PlayerEntity({
      position: [0, 12, 0],
      rotation: [0, 180, 0],
      families : ["Player", "HasCollisionPoints","Physical"],
      collisionPoints: { // TODO fix the collisionPoints positions
        downA1: [-0.3, -0.6, 0], 
        downA2: [-0.3, -0.85, 0],
        downB1: [ 0.3, -0.6, 0], 
        downB2: [ 0.3, -0.85, 0],
        right1: [0.4, -0.3, 0],
        right2: [0.7, -0.3, 0]
      },
      speed:[0.1,-0.2,0],
      size: 3
    });
    playerEntity.coins = 0;
    playerEntity.addCoins = function(c) {
      playerEntity.coins += c;
      document.getElementById("coins").innerHTML = playerEntity.coins;
    }

    var isInsideGround = function(p) {
      return p.collisionPoints.downA1.state || p.collisionPoints.downB1.state;
    };

    var isOnGround = function(p) {
      return p.collisionPoints.downA2.state || p.collisionPoints.downB2.state;
    };

    GameLogic.AddGameObject(playerEntity);
    scene.add(playerEntity);

    GameLogic.EachFrame("Player").push( function(p, elapsedTime) {
      elapsedTime=elapsedTime/20;
      if(!p.collisionPoints.right2.state) {
        p.speed[0] += 0.000004 * elapsedTime;
        if (p.speed[0] > 0.6)
          p.speed[0] = 0.6;
        p.sceneObject.position[0] += p.speed[0] * elapsedTime;
      } else {
        //speed[0] = 0.8;
      }

      if(p.speed[1] < -0.001) {
        p.setAnimation("jumpDown");
      } else if (p.speed[1] > 0.001) {
        p.setAnimation("jumpUp");
      }

      if(GameLogic.IsGrounded(p)) {
        p.setAnimation("run");
      }

      DebugCanvas.Clear();
      var everyBody = GameLogic.gameObjects.all;
      for(var o = 0; o<everyBody.length; ++o) {
        DebugCanvas.DrawBox(everyBody[o].getAABB());
      }

      if (p.sceneObject.position[1] < -1) {
        p.sceneObject.position[1] = 15;
      }

      scene.cubicvr.camera.target = [p.sceneObject.position[0]+4, 9, 0];
      scene.cubicvr.camera.position = [p.sceneObject.position[0]+4, 14, 15];  
      //scene.cubicvr.camera.position = [p.sceneObject.position[0], 14+Math.sin(p.sceneObject.position[0]*0.1)*3, 15];
      if (p.sceneObject.position[1] < 0) {
        if (wilhelmCry) {
          wilhelmCry.cloneNode().play();
        }        
      }

    } );

    GameLogic.KeyEachFrame("Player").push( function(p, isPressed, keyCode, elapsedTime) {
      // Slow down the elapsedTime
      elapsedTime = elapsedTime / 20;
      if (isPressed) {
        if (GameLogic.IsGrounded(p)) {
          p.canJump = true;
          p.jumpForceRemaining = 1.0;
        }

        if (p.canJump === true) {
          var force = 0.1 * elapsedTime;
          if (force > p.jumpForceRemaining) {
            force = p.jumpForceRemaining;
          }
          p.speed[1] += force;
          p.jumpForceRemaining -= 2*force;
        }
      } else {
        // released key up, don't allow jump up again
        p.canJump = false;
      }

      if (p.speed[1] > 1.3)
        p.speed[1] = 1.3; // velocity max

    } );

    GameLogic.EachFrame("Physical").push( function(p,elapsedTime) {
      // Slow down the elapsedTime
      elapsedTime = elapsedTime / 20;
      if (!p.collisionPoints.downA2.state || !p.collisionPoints.downB2.state ){
        // Gravity
        p.speed[1] -= 0.03 * elapsedTime;
        if (p.speed[1] < -0.4) {
          p.speed[1] = -0.4;
        }
      } else {
        // Stop on ground collision
        if(p.speed[1] < 0) {
          p.speed[1] = 0;
        }
      }

      p.sceneObject.position[1] += p.speed[1] * elapsedTime;

      if (isInsideGround(p)) {
        p.sceneObject.position[1] += 0.05 * elapsedTime;
      } else if (p.collisionPoints.right1.state) {  
        p.sceneObject.position[0] -= 0.05 * elapsedTime;
      }

    });

    GameLogic.OnBoxCollision("Monster", "Player").push(function(m, p, e){
      p.hurt();
    });

    GameLogic.OnBoxCollision("Player", "collectable").push(function(p, c, e){
      c.collectedBy(p);
      p.addCoins(1);
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
      goalAtY: 600,
      // The families given to the floor used for GameLogic
      floorFamilies: ["floor", "PointCollision"],
    });

    // Transform the setup options into platforms entity
    // and add them to the scene.
    level.buildToScene(scene);

    scene.cubicvr.camera.target = [0, 0, 0];
    scene.cubicvr.camera.position = [0, 8, 20];
    scene.cubicvr.camera.setFOV(45);

    scene.cubicvr.setSkyBox(new CubicVR.SkyBox({texture: "assets/images/8bit-sky.jpg"}));

    CubicVR.setGlobalAmbient([0.3,0.3,0.3]);

    var cameraIndex = 0;

    var firstFrame = true;

    Schedule.event.add("update", function(e){
      var dx = e.data.dt / 300;
      scene.cubicvr.camera.position[0] += dx;
      scene.cubicvr.camera.target[0] += dx;
      //pointLight.position[0] += dx;
      //playerEntity.move(dx);
      if(!firstFrame){
        GameLogic.DoOneFrame();
      }
      firstFrame = false;
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
