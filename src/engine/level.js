define(["./game-logic", "engine/entity", "components/sprite", "entities/platform", "entities/monster", "entities/pigeon",
        "text!sprites/background.json", "text!sprites/coin.json", "text!sprites/spikes.json"], 
  function(GameLogic, Entity, SpriteComponent, PlatformEntity, MonsterEntity, PigeonEntity, BG_SPRITE_SRC, COIN_SRC, SPIKE_SRC){
  return function(setupOptions) {

    var BG_SPRITE_JSON = JSON.parse(BG_SPRITE_SRC);
    var COIN_JSON = JSON.parse(COIN_SRC);
    var SPIKE_JSON = JSON.parse(SPIKE_SRC);

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
      coin.collectedBy = function(player) {
        GameLogic.RemoveGameObject(coin);
        scene.remove(coin); 
      }
      GameLogic.AddGameObject(coin);
      scene.add(coin);
    }

    this.buildToScene = function(scene) {
      var x = setupOptions.levelOrigin[0];
      // Make the platforms go lower down
      var EXTEND_PLATFORMS = 10;
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
        var floorEntity = new PlatformEntity({
          position: [x, setupOptions.levelOrigin[1] + h - EXTEND_PLATFORMS, 0],
          width: w,
          height: h + EXTEND_PLATFORMS,
          moving: isMoving,
          falling: isFalling
        });
        if (Math.random() > 0.2) {
          this.spawnCoin(scene, x - w + 2*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        if (Math.random() > 0.8) {
          this.spawnSpikes(scene, x - 0.8*w + 1.6*w*Math.random(), setupOptions.levelOrigin[1] + h);
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

      var pigeons = 0;
      var SAFE_ZONE = 5;
      while(pigeons--){
        var pigeonEntity = new PigeonEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), Math.random()*3 + 8, 0],
          rotation: [0, 0, 0],
        });
        GameLogic.AddGameObject(pigeonEntity);
        scene.add(pigeonEntity);
      }


    };

    var isInsideGround = function(p) {
      return p.collisionPoints.downA1.state || p.collisionPoints.downB1.state;
    };

    var isOnGround = function(p) {
      return p.collisionPoints.downA2.state || p.collisionPoints.downB2.state;
    };

    GameLogic.OnBoxCollision("Physical", "floor").push(function(p, c, e){
      if(isInsideGround(p) || isOnGround(p)){
        if(!p.collisionPoints.right2.state){
          p.position[1] = c.position[1] + c.size[1]/2 - p.collisionPoints.downA1[1];
          if(p.speed[1] < 0){
            p.speed[1] = 0;  
          }
          p.updateBB();
        }
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
