define(["./game-logic", "entities/platform"], function(GameLogic, PlatformEntity){
  return function(setupOptions) {

    setupOptions = setupOptions || {};

    this.buildToScene = function(scene) {
      var x = setupOptions.levelOrigin[0];
      while (x < setupOptions.goalAtY) {
        var h = 2 + Math.random() * 2;
        var w = 1 + Math.random() * 1;
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
    };

    return this;
  };
});
