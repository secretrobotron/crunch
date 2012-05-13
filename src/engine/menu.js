define([], function(){
  
  var loadMessage = document.getElementById("cube-load");
  var startMessage = document.getElementById("cube-start");
  var container = document.getElementById("container");
  var background = document.getElementById("background-container");
  var cube = document.getElementById("cube");

  return {

    showLoadMessage: function(){
      loadMessage.classList.add("fade-in");
    },

    hideLoadMessage: function(){
      loadMessage.classList.remove("animate");
      loadMessage.classList.remove("fade-in");
    },

    showStartMessage: function(onclick){
      startMessage.classList.add("fade-in");
      startMessage.addEventListener("click", onclick, false);
    },

    show: function(){
      container.style.display = "block";
      background.classList.add("fade-in");
      container.classList.add("fade-in");
      cube.classList.add("animate");
    },

    hide: function(){
      background.classList.remove("fade-in");
      container.classList.remove("fade-in");
      cube.classList.remove("animate");
      setTimeout(function(){
        container.style.display = "none";
      }, 2000);
    }

  };

});