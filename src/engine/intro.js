define(["engine/loader", "engine/schedule"], function(Loader, Schedule){
  
  var __container = document.getElementById("story");

  return {

    init: function(){
    },

    play: function(){
      __container.style.display = "block";
      __container.classList.add("fade-in");

      var divs = __container.querySelectorAll("div");
      for (var i = divs.length - 1; i >= 0; i--) {
        divs[i].classList.add("playing");
      };

      setTimeout(function(){
        __container.style.display = "none";
        Schedule.event.dispatch("intro-complete");
      }, 7000);
      //}, 0);
    }

  };

});
