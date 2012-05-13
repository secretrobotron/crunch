define(["engine/observe"], function(Observe){

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
      var renderContext = {
        gl: gl,
        clear: true
      };
      Graphics.observe.notify("start-render", renderContext);
      if(renderContext.clear){
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  
      }
      Graphics.observe.notify("render", renderContext);
      for (var i = __scenes.length - 1; i >= 0; i--) {
        __scenes[i].cubicvr.render();
      };
      Graphics.observe.notify("end-render", renderContext);
    },

    setup: function(events){
      events = events || {};

      var mainCanvas = document.getElementById("main-canvas");
      Graphics.viewport.width = mainCanvas.width = window.innerWidth;
      Graphics.viewport.height = mainCanvas.height = window.innerHeight;

      Graphics.canvas = mainCanvas;

      CubicVR.start(mainCanvas, function(){
          CubicVR.setSoftShadows(true);
          //CubicVR.setFixedAspect(window.innerWidth/window.innerHeight);
          CubicVR.addResizeable(mainCanvas);
          window.addEventListener("resize", CubicVR.GLCore.onResize, false);
          Graphics.observe.notify("ready");
          events.success();
        }, events.failure);
    },

    show: function(){
      Graphics.canvas.classList.add("fade-in");
    },

    viewport: {
      width: 0,
      height: 0
    },

    canvas: null

  };

  Observe(Graphics);

  return Graphics;

});