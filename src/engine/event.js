define([], function(){

  /*
   * Simple Event class and functions
   *
   * When dispatch is called, event instances are placed in queue. Event.flush empties the queue by calling each function and removing it.
   */

  var __callbackPool = [];

  function flush(){
    while(__callbackPool.length > 0){
      var item = __callbackPool.pop();
      item.callback(item.context);
    }
  }

  function add(name, callback, callbacks){
    if(!callbacks[name]){
      callbacks[name] = [];
    }
    callbacks[name].push(callback);
  }

  function remove(name, callback, callbacks){
    if(callbacks[name]){
      var idx = callbacks[name].indexOf(callback);
      if(idx > -1){
        callbacks[name].splice(idx, 1);
      }
    }    
  }

  function dispatch(name, data, callbacks, origin){
    var list = callbacks[name];
    if(list){
      list = list.slice();
      var context = {
        name: name,
        data: data,
        origin: origin
      };
      for(var i = 0, l = list.length; i < l; ++i){
        __callbackPool.push({
          context: context,
          callback: list[i]
        });
      }
    }
  }

  function Event(object){

    var _callbacks = {};

    object._event = {
      add: function(name, callback){
        add(name, callback, _callbacks);
      },
      remove: function(name, callback){
        remove(name, callback, _callbacks);
      },
      dispatch: function(name, data){
        dispatch(name, data, _callbacks, object);
      }
    };

  }

  Event.flush = flush;
  
  return Event;

});