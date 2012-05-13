define(["engine/entity", "components/sprite", "engine/schedule", "text!sprites/player.json", "engine/game-logic", "engine/loader"], 
  function(Entity, SpriteComponent, Schedule, SPRITE_SRC, GameLogic, Loader){

  var wilhelmCry = null;

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  var SIZE = 4;

  GameLogic.EachFrame("Player").push( function(p, elapsedTime) {
    if(!p.collisionPoints.right2.state) {
      p.speed[0] += 0.000002 * elapsedTime;
      if (p.speed[0] > 0.6)
        p.speed[0] = 0.6;
      p.position[0] += p.speed[0];
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

    if (p.position[1] < -1) {
      p.position[1] = 15;
      if (wilhelmCry) {
        wilhelmCry.cloneNode().play();
      }
    }

    p.updateBB();
  });

  GameLogic.KeyEachFrame("Player").push( function(p, isPressed, keyCode, elapsedTime) {
    // Slow down the elapsedTime
    elapsedTime = elapsedTime / 20;
    if (isPressed) {
      if (GameLogic.IsGrounded(p)) {
        p.canJump = true;
        p.jumpForceRemaining = 1.0;
      }

      if (p.canJump === true) {
        var force = 0.1 * elapsedTime/4;
        if (force > p.jumpForceRemaining) {
          force = p.jumpForceRemaining;
          p.canJump = false;
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

    p.updateBB();

  });

  return function(setupOptions){

    if( Loader.IsAudioAvailable() ) {
      Loader.load(Loader.Audio("assets/audio/WilhelmScream.ogg"), function(audio){
        wilhelmCry = audio;
      });
    }
    
    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: SIZE,
          sprite: SPRITE_JSON
        }),
      ],
      families: ["Player", "HasCollisionPoints","Physical"],
      collisionPoints: { // TODO fix the collisionPoints positions
        downA1: [-SIZE*.1, -SIZE/2*.7, 0], 
        downA2: [-SIZE*.1, -SIZE/2*.95, 0],
        downB1: [ SIZE*.1, -SIZE/2*.7, 0], 
        downB2: [ SIZE*.1, -SIZE/2*.95, 0],
        right1: [SIZE/2*.6, -SIZE/2*.2, 0],
        right2: [SIZE/2*.7, -SIZE/2*.2, 0]
      },
      speed: [0.15,-0.2,0],
      position: setupOptions.position,
      rotation: setupOptions.rotation,
      size: [SIZE, SIZE]
    });

    entity.setAnimation = function(animName) {
      entity.components["sprite"].currentAnimation = animName;
    }

    var _playerHurtFunction;
    entity.hurt = function(){
      if(!_playerHurtFunction){
        _playerHurtFunction = (function(startTime){
          return function(e){
            var elapsed = Date.now() - startTime;
            entity.position[0] -= Math.max(0, (1000 - elapsed)/8000);
            entity.sceneObject.visible = Math.round(Math.sin(elapsed/40)*.5 + .2) === 0;
            if(elapsed < 500){
              entity.forceHitAnim = true;
            } else {
              entity.forceHitAnim = false;
            }
            if(elapsed > 2000){
              entity.sceneObject.visible = true;
              Schedule.event.remove("update", _playerHurtFunction);
              _playerHurtFunction = null;
            }
            entity.updateBB();
          };
        }(Date.now()));
        Schedule.event.add("update",_playerHurtFunction);
      }
    };

    return entity;

  };

});
