define(["engine/event", "engine/graphics"], function(Event, Graphics){
  
  return function(description){

    description = description || {};

    var _this = this;
    var _scene = null;
    var _parentEntity = null;
    var _sceneObject = this.sceneObject = new CubicVR.SceneObject();

    Event(this);

    this.components = {};
    this.name = description.name || null;
    this.families = description.families;
    this.collisionPoints = description.collisionPoints;
    this.speed = description.speed;

    this.aabb = [
      [0,0,0],
      [0,0,0]
    ];

    this.size = description.size || [0,0];

    this.position = description.position || [0,0,0];

    this.updateBB = function(){
      var hw = _this.size[0]/2;
      var hh = _this.size[1]/2;
      var position = _this.position;
      _this.aabb[0] = [
        position[0] - hw,
        position[1] - hh,
      ];
      _this.aabb[1] = [
        position[0] + hw,
        position[1] + hh
      ];
    };

    _this.updateBB();

    _sceneObject.rotation = description.rotation || _sceneObject.rotation;

    Graphics.observe.subscribe("start-render", function(){
      _sceneObject.position = _this.position;
    });

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
      parent: {
        enumerable: true,
        get: function(){
          return _parentEntity;
        },
        set: function(newParent){
          _parentEntity = newParent;
          _this.scene = _parentEntity.scene;
          _parentEntity.sceneObject.bindChild(_sceneObject);
          _this.event.dispatch("parent-changed", _parentEntity);
        }
      },
      scene: {
        enumerable: true,
        get: function(){
          return _scene;
        },
        set: function(newScene){
          if(newScene !== _scene){
            _scene = newScene;
            _this.event.dispatch("scene-changed", _scene);
          }
        }
      }
    });

  };

});
