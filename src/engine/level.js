define(["./game-logic", "entities/platform", "entities/monster"], function(GameLogic, PlatformEntity, MonsterEntity){
  return function(setupOptions) {

    setupOptions = setupOptions || {};

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

      var monsters = 20;
      var SAFE_ZONE = 5;
      while(monsters--){
        var monsterEntity = new MonsterEntity({
          position: [SAFE_ZONE + Math.random()*(setupOptions.goalAtY-SAFE_ZONE), 115, 0],
          rotation: [0, 180, 0],
          families : ["Monster", "HasCollisionPoints", "Physical"],
          collisionPoints: { // TODO fix the collisionPoints positions
            downA1: [-0.3, -0.6, 0], 
            downA2: [-0.3, -0.85, 0],
            downB1: [ 0.3, -0.6, 0], 
            downB2: [ 0.3, -0.85, 0],
            right1: [0.5, -0.3, 0],
            right2: [0.6, -0.3, 0]
          },
          speed:[0,0,0],
          size: 1
        });
        GameLogic.AddGameObject(monsterEntity);
        scene.add(monsterEntity);
      }
    };

    return this;
  };
});
