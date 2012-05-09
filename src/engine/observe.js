define([], function(){

  /*
   * Simple Observable class and functions
   *
   * Calling `notify` will call subscribed functions immediately.
   */

  function subscribe(name, callback, callbacks){
    if(!callbacks[name]){
      callbacks[name] = [];
    }
    callbacks[name].push(callback);
  }

  function unsubscribe(name, callback, callbacks){
    if(callbacks[name]){
      var idx = callbacks[name].indexOf(callback);
      if(idx > -1){
        callbacks[name].splice(idx, 1);
      }
    }    
  }

  function notify(name, data, callbacks, origin){
    var list = callbacks[name];
    if(list){
      list = list.slice();
      var callbackContext = {
        name: name,
        data: data,
        origin: origin
      };
      for(var i = 0, l = list.length; i < l; ++i){
        list[i](callbackContext);
      }
    }
  }

  function Observable(object){

    var _callbacks = {};

    object._observe = {
      subscribe: function(name, callback){
        subscribe(name, callback, _callbacks);
      },
      unsubscribe: function(name, callback){
        unsubscribe(name, callback, _callbacks);
      },
      notify: function(name, data){
        notify(name, data, _callbacks, object);
      }
    };

  }
  
  return Observable;

});