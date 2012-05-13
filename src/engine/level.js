define(["./game-logic", "engine/entity", "components/sprite", "entities/platform", "entities/monster", "text!sprites/background.json"], 
  function(GameLogic, Entity, SpriteComponent, PlatformEntity, MonsterEntity, BG_SPRITE_SRC){
  return function(setupOptions) {

    var BG_SPRITE_JSON = JSON.parse(BG_SPRITE_SRC);

    setupOptions = setupOptions || {};

    this.buildBackground = function(scene) {
      for (var i = 0; i < 100; i++) {
        var entity = new Entity({
          name: "background",
          components: [
            new SpriteComponent({
              size: 100,
              sprite: BG_SPRITE_JSON
            }),
          ],
          position: [-10+101*i, -10, -100],
        });
        scene.add(entity);
      }
    }

    this.buildToScene = function(scene) {
      var x = setupOptions.levelOrigin[0];
      while (x < setupOptions.goalAtY) {
        var h = 2 + Math.random() * 2;
        var w = 3 + Math.random() * 4;
        x += w * 2;
        var floorEntity = new PlatformEntity({
          position: [x, setupOptions.levelOrigin[1] + h, 0],
          families : setupOptions.floorFamilies,
          width: w,
          height: h
        });
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
          size: 7
        });
        GameLogic.AddGameObject(monsterEntity);
        scene.add(monsterEntity);
      }
    };

    return this;
  };
});
