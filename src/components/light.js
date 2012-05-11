define(["engine/component", "engine/schedule"], function(Component, Schedule){

  // Create a scene using CubicVR
  return Component("light", function(setupOptions){
    
    setupOptions = setupOptions || {};

    var _this = this;

    var _light = new CubicVR.Light({
      type: setupOptions.type,
      position: setupOptions.position
    });

    if(setupOptions.position){
      _light.position = setupOptions.position;
    }

    this.cubicvr = _light;

    _this.event.add("entity-changed", function(e){
      var entity = e.data;
      entity.scene.cubicvr.bind(_light);
    });

  });

});