define(["engine/keyboard"], function(Keyboard){
  
  function onAKey(){
    
  }

  return {

    start: function(){

      Keyboard.bind("a", onAKey);

    },

    stop: function(){
      Keyboard.unbind("a", onAKey);
    }

  };

});