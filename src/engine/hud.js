define([], function(){
  
  function HUD(){

    var _bigMessage = document.getElementById("big-message-wrapper");

    _bigMessage.classList.add("can-fade");

    return {
      showBigMessage: function(msg){
        _bigMessage.firstChild.innerHTML = msg;
        _bigMessage.style.visibility = "visible";
        setTimeout(function(){
          _bigMessage.classList.add("fade-in");
        }, 0);
      },
      hideBigMessage: function(){
        _bigMessage.classList.remove("fade-in");
        setTimeout(function(){
          _bigMessage.style.visibility = "hidden";
        }, 1000);
      }
    };

  }

  return HUD;

});