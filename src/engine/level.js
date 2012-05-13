define(["./game-logic", "engine/entity", "components/sprite", "entities/platform", "entities/monster",
        "text!sprites/background.json", "text!sprites/coin.json", "text!sprites/spikes.json"], 
  function(GameLogic, Entity, SpriteComponent, PlatformEntity, MonsterEntity, BG_SPRITE_SRC, COIN_SRC, SPIKE_SRC){
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
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-30+100*i, 15, -100],
        });
        GameLogic.AddGameObject(entity);
        scene.add(entity);
      }
      // back 2
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          families : ["beats-z"],
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
      while (x < setupOptions.goalAtY) {
        var h = 2 + Math.random() * 2;
        var w = 3 + Math.random() * 4;
        x += w * 2;
        var floorEntity = new PlatformEntity({
          position: [x, setupOptions.levelOrigin[1] + h - EXTEND_PLATFORMS, 0],
          families : setupOptions.floorFamilies,
          width: w,
          height: h + EXTEND_PLATFORMS
        });
        if (Math.random() > 0.2) {
          this.spawnCoin(scene, x - w + 2*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        if (Math.random() > 0.8) {
          this.spawnSpikes(scene, x - 0.8*w + 1.6*w*Math.random(), setupOptions.levelOrigin[1] + h);
        }
        GameLogic.AddGameObject(floorEntity);
        scene.add(floorEntity);
      }

      this.buildBackground(scene);

      var monsters = 20;
      var SAFE_ZONE = 5;
      while(monsters--){
        var monsterEntity = new MonsterEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), 115, 0],
          rotation: [0, 0, 0],
          families : ["Monster", "HasCollisionPoints", "Physical"],
          collisionPoints: { // TODO fix the collisionPoints positions
            downA1: [-0.3, -0.6, 0], 
            downA2: [-0.3, -0.90, 0],
            downB1: [ 0.3, -0.6, 0], 
            downB2: [ 0.3, -0.90, 0],
            right1: [0.5, -0.3, 0],
            right2: [0.6, -0.3, 0]
          },
          speed:[0,0,0],
          size: 2
        });
        GameLogic.AddGameObject(monsterEntity);
        scene.add(monsterEntity);
      }
    };

    return this;
  };
});
