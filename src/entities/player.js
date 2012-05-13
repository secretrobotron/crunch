define(["engine/entity", "components/sprite", "engine/schedule", "text!sprites/player.json"], 
  function(Entity, SpriteComponent, Schedule, SPRITE_SRC){

  var SPRITE_JSON = JSON.parse(SPRITE_SRC);

  return function(setupOptions){

    setupOptions = setupOptions || {};

    var entity = new Entity({
      name: "player",
      components: [
        new SpriteComponent({
          size: setupOptions.size,
          sprite: SPRITE_JSON
        }),
      ],
      families: setupOptions.families,
      collisionPoints: setupOptions.collisionPoints,
      speed: setupOptions.speed,
      position: setupOptions.position,
      rotation: setupOptions.rotation, 
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
            entity.sceneObject.position[0] -= Math.max(0, (1000 - elapsed)/8000);
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
          };
        }(Date.now()));
        Schedule.event.add("update",_playerHurtFunction);
      }
    };

    return entity;

  };

});
