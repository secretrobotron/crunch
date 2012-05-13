define(["engine/schedule", "engine/beats"], function(Schedule, Beats){
  
  var loadMessage = document.getElementById("cube-load");
  var startMessage = document.getElementById("cube-start");
  var container = document.getElementById("container");
  var background = document.getElementById("background-container");
  var cube = document.getElementById("cube");
  var fftCanvas = document.getElementById("cube-fft");
  var fftCtx = fftCanvas.getContext("2d");

  function drawFFT(){
    fftCtx.clearRect(0, 0, fftCanvas.width, fftCanvas.height);
    fftCtx.fillStyle = "#FF670F";
    var numSpectrumSlots = Beats.spectrum.length/2;
    var slotWidth = fftCanvas.width / numSpectrumSlots * 2;
    for(var i=0, l=numSpectrumSlots; i<l; ++i){
      var n = Beats.spectrum[i]*3000;
      if(n<fftCanvas.height/2){
        n*=1.5;
      }
      else{
        n/=1.5;
      }
      fftCtx.fillRect(i*slotWidth, fftCanvas.height - n, slotWidth, n);
    }
  }

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
      Schedule.event.add("update", drawFFT);
    },

    hide: function(){
      background.classList.remove("fade-in");
      container.classList.remove("fade-in");
      cube.classList.remove("animate");
      setTimeout(function(){
        container.style.display = "none";
        Schedule.event.remove("update", drawFFT);
      }, 2000);
    }

  };

});