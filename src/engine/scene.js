define(["./event", "./graphics"], function(Event, Graphics){

  var DEFAULT_FOV = 80;
  
  return function(width, height, fov){
    var _this = this;

    Event(this);

    width = width || Graphics.width;
    height = height || Graphics.height;
    fov = fov || DEFAULT_FOV;

    var cubicvrScene = new CubicVR.Scene(width, height, fov);

    this.cubicvr = cubicvrScene;

    this.addEntity = function(entity){
      entity.scene = _this;
      _this.event.dispatch("entity-added", entity);
    };

    this.removeEntity = function(entity){
      entity.scene = null;
      _this.event.dispatch("entity-removed", entity);
    };
  };

});