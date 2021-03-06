require([ "engine/sprites", "engine/game-logic"
        , "engine/schedule", "engine/hud"
        , "engine/graphics", "engine/scene"
        , "entities/test-entity"
        , "engine/loader"]
      , function(Sprites, _GameLogic, Schedule, HUD, Graphics, Scene, TestEntity, Loader) {

     // shim layer with setTimeout fallback
  window.requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var GameLogic = {};

  // Sprite descriptor, should be in a separate file
  SpriteDesc = {
      resource:"assets/images/test_sprite_sheet.png",
      tileWidth: 64,
      tileHeight: 64,
      animations : {
          idle : {
              frameCount: 3,
              speed: 0.5,
              index: 0
          },
          walking : {
              frameCount: 3,
              speed: 2,
              index: 1
          }
      }
    };
    SpriteDescGL = {
      resource:"assets/images/main-character.png",
      tileWidth: 128,
      tileHeight: 128,
      imageWidth: 1024,
      imageHeight: 1024,
      animations : {
          numbers : {
              frameCount: 8,
              speed: 1.5,
              index: 0
          },
          symbols : {
              frameCount: 7,
              speed: 2,
              index: 1
          }
      }
    };


  function doOneFrame(ctx,gl, gameTime, elapsedTime, objSprite, objSpriteGL) {    
      ctx.fillRect(10,10,10,10);
      ctx.clearRect(0,0,1000,1000);

      var animTime = (gameTime / 1000) % 1.0;
      objSprite.x = 30 + Math.sin(gameTime*0.001) * 30;

      objSprite.displayComponent.advance(objSprite, elapsedTime);
      objSprite.displayComponent.display(ctx, objSprite);

      objSpriteGL.displayComponent.advance(objSpriteGL, elapsedTime);
      objSpriteGL.displayComponent.display(gl, objSpriteGL);

      GameLogic.DoOneFrame();
  }



  GameLogic = _GameLogic;

  var canvas1 = document.getElementById('canvas01');
  var canvas2 = document.getElementById('canvas02');
  if (!canvas1.getContext) return;

  function throwOnGLError(err, funcName, args) {
    throw WebGLDebugUtils.glEnumToString(err) + " was caused by call to: " + funcName;
  };

  var ctx = canvas1.getContext('2d');
  var gl  = canvas2.getContext('experimental-webgl');
  gl  = WebGLDebugUtils.makeDebugContext(gl, throwOnGLError);

  var proj = [];
  mat4.identity(proj);

  Sprites.Canvas2d.Init(ctx);
  Sprites.WebGL.Init(gl);
  Sprites.WebGL.projectionMatrix = proj;

  console.log("will create a gl sprite");
  var spriteGLDisplayComponent = Sprites.WebGL.CreateAnimatedScriptDisplayComponent(SpriteDescGL);

 
  var objSprite = {
    x:1, y:1, z:0
    , displayComponent: Sprites.Canvas2d.CreateAnimatedScriptDisplayComponent(SpriteDesc)
    , animation: {
        name:"walking"
        , direction: Sprites.ANIM_RIGHT
        , time:0
      }
    , families : ["Player","Foo"]
    , boundingBox : {x:-5,y:-5,width:10,height:10}
    , sceneObj: {
        getAABB : function() { return [[-5,-5,0],[5,5,0]]; } // just for testing
      }
  };// objSprite 
 
  var objSpriteGL = {
    x:0, y:0, z:0
    , modelViewMatrix : []
    , displayComponent: spriteGLDisplayComponent
    , animation: {
        name:"numbers"
        , direction: Sprites.ANIM_RIGHT
        , time:0
      }
    , families : ["Bar","Foo","HasCollisionPoints"]
    , collisionPoints: {
        down1:[0,-5,0]
      , down2:[0,-7,0]
    }
    , boundingBox : {x:-5,y:-5,width:10,height:10}
    , sceneObj: {
        getAABB : function() { return [[-5,-5,0],[5,5,0]]; } // just for testing
      }
  };// objSprite 
  
  mat4.identity(objSpriteGL.modelViewMatrix);

  GameLogic.AddGameObject(objSprite);
  GameLogic.AddGameObject(objSpriteGL);
  console.log("added objects");
  GameLogic.RemoveGameObject(objSprite);
  console.log("removed objSprite");
  GameLogic.AddGameObject(objSprite);
  
  GameLogic.OnBoxCollision("Player","Bar").push( function(player,bar){ console.log("collision! :)") }  );
  GameLogic.EachFrame("Player").push( function(player){ console.log("player.x (EachFrame): "+ player.x); } );

  var startTime = new Date().getTime();
  var lastTime = 0;
  (function animloop(){
    requestAnimFrame(animloop);
    var gameTime = new Date().getTime() - startTime;
    var elapsedTime = gameTime - lastTime;
    lastTime = gameTime;

    doOneFrame(ctx,gl, gameTime, elapsedTime, objSprite, objSpriteGL);
  })();

  
});//require
