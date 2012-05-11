define(["./event", "./graphics"], function(Event, Graphics){

  var DEFAULT_FOV = 80;
  
  return function(width, height, fov){
    var _this = this;

    Event(this);

    width = width || Graphics.width;
    height = height || Graphics.height;
    fov = fov || DEFAULT_FOV;

    var cubicvrScene = new CubicVR.Scene(width, height, fov);

    CubicVR.addResizeable(cubicvrScene);

    this.cubicvr = cubicvrScene;

    this.add = function(obj){
      obj.scene = _this;
      cubicvrScene.bind(obj.sceneObject);
      _this.event.dispatch("entity-added", obj);
    };

    this.remove = function(obj){
      obj.scene = null;
      cubicvrScene.unbind(obj.sceneObject);
      _this.event.dispatch("entity-removed", obj);
    };

  };

});