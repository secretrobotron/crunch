define(["engine/event"], function(Event){
  
  var __currentPool = null;
  var __dummyFunc = function(){};

  var __audioAvailable = true;

  try {
    var testAudio = new Audio();
    testAudio.load();
  } catch (e) {
    __audioAvailable = false;
  }


  function __loadItems(items, callback){
    var toLoad = items.length,
        loaded = 0,
        loadedItems = {};

    function onLoaded(url, item){
      ++loaded;
      loadedItems[url] = item;

      if(loaded === toLoad){
        callback(loadedItems);
      }
    }

    for(var i=0; i<items.length; ++i){
      items[i].load(onLoaded);
    }
  }

  function Pool(){
    var _this = this;
    var _items = [];

    Event(this);

    this.push = function(item, callback){
      _items.push(item);
      _this.event.add("loaded", function(e){
        callback(e.data);
      });
    };

    this.load = function(callback){
      _this.event.add("loaded", function(e){
        callback(e.data);
      });
      __loadItems(_items, function(items){
        _this.event.dispatch("loaded", items);
      });
      _items = [];
    };
  }

  var Loader = {
    IsAudioAvailable: function() {
      return __audioAvailable;
    },

    Audio: function(url, callback){
      callback = callback || __dummyFunc;
      var audio = new Audio();
      audio.src = url;
      return {
        load: function(groupCallback){
          audio.addEventListener("canplay", function(e){
            callback(url, audio);
            groupCallback(url, audio);
          });
          audio.load();
        },
        url: url
      };
    },

    Image: function(url, callback){
      callback = callback || __dummyFunc;
      var image = new Image();
      return {
        load: function(groupCallback){
          image.addEventListener("load", function(e){
            callback(url, image);
            groupCallback(url, image);
          });
          image.src = url;
        },
        url: url
      };
    },

    lock: function(){
      __currentPool = new Pool();
    },

    unlock: function(callback){
      __currentPool.load(callback);
      __currentPool = null;
    },

    load: function(items, callback){
      if(__currentPool){
        if(items instanceof Array){
          var i=0;
          while(i--){
            __currentPool.push(items[i]);
          }
          __currentPool.event.add("loaded", function(e){
            callback(e.data);
          });
        }
        else{
          __currentPool.push(items, function(loadedItems){
            callback(loadedItems[items.url]);
          });
        }
      }
      else{
        __loadItems([item], callback);
      }
    }

  };

  return Loader;

});
