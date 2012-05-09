define([], function(){

  var __scenes = [];
  
  var Graphics = {

    addScene: function(scene){
      __scenes.push(scene);
    },

    removeScene: function(scene){
      var idx = __scenes.indexOf(scene);
      if(idx > -1){
        __scenes.splice(idx, 1);  
      }
    },

    render: function(){
      var gl = CubicVR.GLCore.gl;
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      for (var i = __scenes.length - 1; i >= 0; i--) {
        __scenes[i].render();
      };
    },

    setup: function(events){
      events = events || {};

      var mainCanvas = document.getElementById("main-canvas");
      Graphics.viewport.width = mainCanvas.width = window.innerWidth;
      Graphics.viewport.height = mainCanvas.height = window.innerHeight;

      CubicVR.start(mainCanvas, events.success, events.failure);
    },

    viewport: {
      width: 0,
      height: 0
    }

  };

  return Graphics;

});