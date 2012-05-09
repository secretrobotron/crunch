define([], function(){
  var requestAnimFrame = (function(){
    return  window.requestAnimationFrame       || 
            window.webkitRequestAnimationFrame || 
            window.mozRequestAnimationFrame    || 
            window.oRequestAnimationFrame      || 
            window.msRequestAnimationFrame     || 
            function( callback ){
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  return function(updateFunction){
    var _stopFlag = true;
    
    if(!updateFunction){
      throw new Error("No updateFunction supplied to loop.");
    }

    function loop(){
      if(!_stopFlag){
        updateFunction();
        requestAnimFrame(loop);
      }
    }

    return {
      start: function(){
        _stopFlag = false;
        requestAnimFrame(loop);
      },
      stop: function(){
        _stopFlag = true;
      }
    };

  };

});