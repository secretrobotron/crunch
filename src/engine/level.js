define(["./game-logic", "engine/entity","engine/beats", "components/sprite", "entities/platform", "entities/monster", "entities/pigeon", "engine/loader",
        "text!sprites/background.json", "text!sprites/coin.json", "text!sprites/spikes.json", "text!sprites/bumper.json","text!levels/level01.json"], 
  function(GameLogic, Entity, Beats, SpriteComponent, PlatformEntity, MonsterEntity, PigeonEntity, Loader, BG_SPRITE_SRC, COIN_SRC, SPIKE_SRC, BUMPER_SRC, LVL01_SRC){
  var loadOnce = true;
  var collectSfx = null;
  var springSfx = null;

  return function(setupOptions) {

    var BG_SPRITE_JSON = JSON.parse(BG_SPRITE_SRC);
    var COIN_JSON = JSON.parse(COIN_SRC);
    var SPIKE_JSON = JSON.parse(SPIKE_SRC);
    var BUMPER_JSON = JSON.parse(BUMPER_SRC);
    var LVL01_JSON  = JSON.parse(LVL01_SRC);
    var collectSfx = null;

    if( Loader.IsAudioAvailable() ) {
      if (loadOnce == false)
        return;
      loadOnce = false;
      Loader.load(Loader.Audio("assets/audio/coin.wav"), function(audio){
        collectSfx = audio;
      });
      Loader.load(Loader.Audio("assets/audio/spring.wav"), function(audio){
        springSfx = audio;
      });
    }

    setupOptions = setupOptions || {};

    this.buildBackground = function(scene) {
      // back
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          families : ["beats-z-beat"],
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-30+100*i, 15, -100],
        });
        entity.original_y = 15;
        entity.original_z = -100;
        GameLogic.AddGameObject(entity);
        scene.add(entity);
      }
      // back 2
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          families : ["beats-z-beat"],
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-10+100*i, 5, -50],
        });
        entity.original_y = 5;
        entity.original_z = -50;
        GameLogic.AddGameObject(entity);
        scene.add(entity);
      }
    }

    this.spawnSpikes = function(scene, x, y) {
      var spike = new Entity({
        name: "spike",
        families : ["spike"],
        components: [
          new SpriteComponent({
            size: 1,
            sprite: SPIKE_JSON
          }),
        ],
        position: [x, y+y/1.25, 0.1],
      });
      GameLogic.AddGameObject(spike);
      scene.add(spike);
    }

    this.spawnCoin = function(scene, x, y) {
      var coin = new Entity({
        name: "coin",
        families : ["collectable"],
        components: [
          new SpriteComponent({
            size: 1,
            sprite: COIN_JSON
          }),
        ],
        position: [x, y+5, 0.1],
      });
      coin.collectedBy = function(p) {
        if (coin.collected)
          return;
        if (collectSfx) {
          collectSfx.cloneNode().play();
        }
        coin.collected = true;
        coin.upVelocity = 0.2;
        coin.rotationVelocity = 2*40;
        setTimeout(function(){
          scene.remove(coin); 
          GameLogic.RemoveGameObject(coin);
        }, 800);
      }
      GameLogic.AddGameObject(coin);
      scene.add(coin);
    }

    this.spawnBumper = function(scene, x, y) {
      var bump = new Entity({
        name: "bumper",
        families : ["Bumper", "[removed]HasCollisionPoints", "[removed]Physical"],
        collisionPoints : {
          downA1: [-0.1, -0.1, 0.0],
          downA2: [-0.1, -0.2, 0.0],
          downB1: [ 0.1, -0.2, 0.0],
          downB2: [ 0.1, -0.2, 0.0],
          right1: [ 0.2,  0.0, 0.0],
          right2: [ 0.3,  0.0, 0.0],
        },
        components: [
          new SpriteComponent({
            size: 2.5,
            sprite: BUMPER_JSON
          }),
        ],
        position: [x, y+5, 0.1],
        speed: [0,0,0],
      });
      bump.bumpTheShitOf = function(someEntity,elapsedTime) {
        if (springSfx) {
          if (!bump.hasPlayedSound)
            springSfx.cloneNode().play();
          bump.hasPlayedSound = true;
        }
        someEntity.speed[1] = 2.0; 
      }
      GameLogic.AddGameObject(bump);
      scene.add(bump);
    }




    this.buildSceneFromJson = function(scene, lvl) {  //-------------- ****
      var x = setupOptions.levelOrigin[0];
      // Make the platforms go lower down
      var EXTEND_PLATFORMS = 15;
      var RANDOM_Z = 0.05;
      
      for (var b in lvl.blocks) {
        var floorEntity = new PlatformEntity({
          position: [lvl.blocks[b].x + lvl.blocks[b].l/2
            , setupOptions.levelOrigin[1] + lvl.blocks[b].y - EXTEND_PLATFORMS  + 5
            , -RANDOM_Z + 2*Math.random()],
          width: lvl.blocks[b].l,
          height: EXTEND_PLATFORMS,
          moving: lvl.blocks[b].moving,
          falling: false
        });
        
        GameLogic.AddGameObject(floorEntity);
        scene.add(floorEntity);
      }

      for (var bump in lvl.bumpers) {
        this.spawnBumper(scene, lvl.bumpers[bump].x
          , setupOptions.levelOrigin[1] + lvl.bumpers[bump].y  - 7.5);
      }

      for (var c in lvl.coin) {
        this.spawnCoin(scene, lvl.coins[c].x, lvl.coins[c].y + 6);        
      }

      this.buildBackground(scene);

      var monsters = 0;
      var SAFE_ZONE = 5;
      while(monsters--){
        var monsterEntity = new MonsterEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), 115, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(monsterEntity);
        scene.add(monsterEntity);
      }

      var pigeons = 10;
      var SAFE_ZONE = 5;
      while(pigeons--){
        var pigeonEntity = new PigeonEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), Math.random()*3 + 8, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(pigeonEntity);
        scene.add(pigeonEntity);
      }

    
      // Make the platforms go lower down
      var firstBlock = true;
      while (x < setupOptions.goalAtY) {
        var h = 4 + Math.random() * 4;
        var w = 6 + Math.random() * 8;
        // Make sure the first platform reach to 3
        if (w+x < 5) {
          w = 5-x;
        }
        x += w * 1.3;
        var isMoving = false;
        var isFalling = false;
        if (!firstBlock && Math.random() < 0.3) {
          isMoving = true;
        } else if (!firstBlock && Math.random() < 0.2) {
          //disabled, collision bugs
          //isFalling = true;
        }
        var px = x;
        var py = setupOptions.levelOrigin[1] + h;

        //dump( '{"x": '+px+', "y":'+py+', "l":' +w+', "isMoving":'+isMoving+'},\n');
        
        if (Math.random() > 0.2) {
          this.spawnCoin(scene, x - w + 2*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        if (Math.random() > 0.96) {
          var bx = x/2 + 10;
          var by = setupOptions.levelOrigin[1];
          this.spawnBumper(scene, bx, by);
        }
      }

      Beats.beatEvents.push( function(){
		if(Math.random() > 0.05) return;
        var camX = scene.cubicvr.camera.position[0];
        var pigeonEntity = new PigeonEntity({
          position: [camX+40, Math.random()*5 + 7, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(pigeonEntity);
        scene.add(pigeonEntity);
      });


    };

    this.buildToScene = function(scene) {

      this.buildSceneFromJson(scene,LVL01_JSON);
      return;

      var x = setupOptions.levelOrigin[0];
      // Make the platforms go lower down
      var EXTEND_PLATFORMS = 20;
      var RANDOM_Z = 0.05;
      var firstBlock = true;
      while (x < setupOptions.goalAtY) {
        var h = 4 + Math.random() * 4;
        var w = 6 + Math.random() * 8;
        // Make sure the first platform reach to 3
        if (w+x < 5) {
          w = 5-x;
        }
        x += w * 1.3;
        var isMoving = false;
        var isFalling = false;
        if (!firstBlock && Math.random() < 0.3) {
          isMoving = true;
        } else if (!firstBlock && Math.random() < 0.2) {
          //disabled, collision bugs
          //isFalling = true;
        }
        var px = x;
        var py = setupOptions.levelOrigin[1] + h;

        dump( '{"x": '+px+', "y":'+py+', "l":' +w+', "isMoving":'+isMoving+'},\n');
        var floorEntity = new PlatformEntity({
          position: [px, py, -RANDOM_Z + 2*Math.random()],
          width: w,
          height: h + EXTEND_PLATFORMS,
          moving: isMoving,
          falling: isFalling
        });
        if (Math.random() > 0.2) {
          this.spawnCoin(scene, x - w + 2*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        if (Math.random() > 0.8) {
          //this.spawnSpikes(scene, x - 0.8*w + 1.6*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        if (Math.random() > 0.95) {
          var bx = x/2 + 10;
          var by = setupOptions.levelOrigin[1];
          this.spawnBumper(scene, bx, by);
        }

        GameLogic.AddGameObject(floorEntity);
        scene.add(floorEntity);
        firstBlock = false;
      }

      this.buildBackground(scene);

      var monsters = 0;
      var SAFE_ZONE = 5;
      while(monsters--){
        var monsterEntity = new MonsterEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), 115, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(monsterEntity);
        scene.add(monsterEntity);
      }

      var pigeons = 10;
      var SAFE_ZONE = 5;
      while(pigeons--){
        var pigeonEntity = new PigeonEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), Math.random()*3 + 8, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(pigeonEntity);
        scene.add(pigeonEntity);
      }

      Beats.beatEvents.push( function(){
        var camX = scene.cubicvr.camera.position[0];
        var pigeonEntity = new PigeonEntity({
          position: [camX, Math.random()*5 + 7, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(pigeonEntity);
        scene.add(pigeonEntity);
      });


    };

    var isInsideGround = function(p) {
      return p.collisionPoints.downA1.state || p.collisionPoints.downB1.state;
    };

    var isOnGround = function(p) {
      return p.collisionPoints.downA2.state || p.collisionPoints.downB2.state;
    };

    GameLogic.OnBoxCollision("Physical", "floor").push(function(p, c, e){
      if(isInsideGround(p) || isOnGround(p)){
        //if(!p.collisionPoints.right2.state){
          p.position[1] = c.position[1] + c.size[1]/2 - p.collisionPoints.downA1[1];
          if(p.speed[1] < 0){
            p.speed[1] = 0;  
          }
          p.updateBB();
        //}
      }
    });

    GameLogic.OnBoxCollision("Player", "floor").push(function(p, f, e){
      if (!f.falling) {
        return;
      }
      f.speed = f.speed || [0, 0, 0];
      f.speed[1] = -0.03;
    });

    GameLogic.EachFrame("floor").push( function(p,elapsedTime) {
      if (!p.falling)
        return;
      if (!p.speed) {
        return;
      }
      elapsedTime = elapsedTime / 14;
      p.position[1] += p.speed[1] * elapsedTime;  

    });

    GameLogic.EachFrame("collectable").push( function(p,elapsedTime) {
      elapsedTime /= 20;
      if (p.rotationVelocity) {
        p.sceneObject.rotation[1] += p.rotationVelocity * elapsedTime;          
        p.position[1] += p.upVelocity * elapsedTime;  
      }
    });


    GameLogic.EachFrame("Physical").push( function(p,elapsedTime) {
      // Slow down the elapsedTime
      elapsedTime = elapsedTime / 14;
      if (!isInsideGround(p) && !isOnGround(p)){
        // Gravity
        p.speed[1] -= 0.02 * elapsedTime;
        if (p.speed[1] < -0.4) {
          p.speed[1] = -0.4;
        }          
      }

      p.position[1] += p.speed[1];  

      p.updateBB();
    });

    return this;
  };
});
