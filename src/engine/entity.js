define(["engine/event"], function(Event){
  
  return function(description){

    description = description || {};

    var _this = this;

    var _scene = null;

    this.name = description.name || null;

    Event(this);

    this.components = {};

    this.addComponent = function(component){
      var oldComponent = _this.components[component.name];
      if(oldComponent){
        oldComponent.entity = null;
      }
      _this.components[component.name] = component;
      component.entity = _this;
      return oldComponent;
    };

    this.removeComponent = function(name){
      var oldComponent = _this.components[name];
      if(oldComponent){
        _this.components[name] = null;
        oldComponent.entity = null;        
      }
      return oldComponent;
    };

    if(description.components){
      for(var i=0, l=description.components.length; i<l; ++i){
        _this.addComponent(description.components[i]);
      }
    }

    Object.defineProperties(_this, {
      scene: {
        enumerable: true,
        get: function(){
          return _scene;
        },
        set: function(newScene){
          _scene = newScene;
          _this.event.dispatch("scene-changed", _scene);
        }
      }
    });

  };

});