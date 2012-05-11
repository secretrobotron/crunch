define(["./event"], function(Event){
  
  var __components = {};

  function Component(name, ctor){

    var componentWrapper = function(){

      var object = {};

      var _entity = null;

      object.name = name;

      Event(object);

      Object.defineProperties(object, {
        entity: {
          enumerable: true,
          get: function(){
            return _entity;
          },
          set: function(newEntity){
            _entity = newEntity;
            object.event.dispatch("entity-changed", _entity);
          }
        }
      });

      ctor.apply(object, arguments);

      return object;
    };

    __components[name] = componentWrapper;

    return componentWrapper;

  };

  return Component;

});