define(["./game-logic", "engine/entity", "components/sprite", "entities/platform", "entities/monster",
        "text!sprites/background.json", "text!sprites/coin.json"], 
  function(GameLogic, Entity, SpriteComponent, PlatformEntity, MonsterEntity, BG_SPRITE_SRC, COIN_SRC){
  return function(setupOptions) {

    var BG_SPRITE_JSON = JSON.parse(BG_SPRITE_SRC);
    var COIN_JSON = JSON.parse(COIN_SRC);

    setupOptions = setupOptions || {};

    this.buildBackground = function(scene) {
      // back
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-30+100*i, 15, -100],
        });
        scene.add(entity);
      }
      // back 2
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-10+100*i, 5, -50],
        });
        scene.add(entity);
      }
    }

    this.spawnCoint = function(scene, x, y) {
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
        console.log("remove");
        GameLogic.RemoveGameObject(coin);
        scene.remove(coin); 
      }
      GameLogic.AddGameObject(coin);
      scene.add(coin);
    }

    this.buildToScene = function(scene) {
      var x = setupOptions.levelOrigin[0];
      while (x < setupOptions.goalAtY) {
        var h = 4 + Math.random() * 4;
        var w = 6 + Math.random() * 8;
        x += w * 2;
        var floorEntity = new PlatformEntity({
          position: [x, setupOptions.levelOrigin[1] + h, 0],
          width: w,
          height: h
        });
        if (Math.random() > 0.3) {
          this.spawnCoint(scene, x - w + 2*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        GameLogic.AddGameObject(floorEntity);
        scene.add(floorEntity);
      }

      this.buildBackground(scene);

      // var monsters = 20;
      // var SAFE_ZONE = 5;
      // while(monsters--){
      //   var monsterEntity = new MonsterEntity({
      //     position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), 115, 0],
      //     rotation: [0, 0, 0]
      //   });
      //   GameLogic.AddGameObject(monsterEntity);
      //   scene.add(monsterEntity);
      // }
    };

    var isInsideGround = function(p) {
      return p.collisionPoints.downA1.state || p.collisionPoints.downB1.state;
    };

    var isOnGround = function(p) {
      return p.collisionPoints.downA2.state || p.collisionPoints.downB2.state;
    };

    GameLogic.OnBoxCollision("Player", "floor").push(function(p, c, e){
      if(isInsideGround(p)){
        p.position[1] = c.position[1] + (c.size[1]/2) + (p.size[1]/2) + p.collisionPoints.downA2[1];
        p.speed[1] = 0;
        p.updateBB();
      }
    });

    GameLogic.EachFrame("Physical").push( function(p,elapsedTime) {
      // Slow down the elapsedTime
      elapsedTime = elapsedTime / 20;
      if (!p.collisionPoints.downA2.state || !p.collisionPoints.downB2.state ){
        // Gravity
        p.speed[1] -= 0.03 * elapsedTime;
        if (p.speed[1] < -0.4) {
          p.speed[1] = -0.4;
        }          
      }

      p.position[1] += p.speed[1];

      if (isInsideGround(p)) {
        //p.position[1] += 0.05 * elapsedTime;
      } else if (p.collisionPoints.right1.state) {
        //p.position[0] -= 0.05 * elapsedTime;
      }

      p.updateBB();
    });

    return this;
  };
});
