define([],
  function(){
    var module = {};
    module.spectrum = [];
    module.spectrumMax = 0;
    for (var i = 0; i < 32; i++) {
      module.spectrum.push(0);
    }

    function beat() {
      //console.log("beat");
    }
    function spectrum_callback(spectrum) {
      module.spectrum = spectrum;
      module.spectrumMax = 0;
      for (var i = 0; i < spectrum.length; i++) {
        if (spectrum[i] > module.spectrumMax) {
          module.spectrumMax = spectrum[i];
        }
      }
    }
    function vu_callback(vu) {
      //console.log(vu);
    }

    module.play = function(track) {
      if (navigator.userAgent.indexOf("Firefox")!=-1) {
        new BeatHelper(track, beat, spectrum_callback);
      }
    };

    return module;
  }
);
