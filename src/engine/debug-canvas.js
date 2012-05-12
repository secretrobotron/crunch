
define([], function () {
  var module = {};

  module.canvas = document.getElementById('debug-canvas').getContext('2d');;

  module.Clear = function () {
    module.canvas.width = module.canvas.width;
  }

  var coef = 20;

  module.DrawBox = function(aabb) {
    if (!module._isEnabled)
      return;

    var canvas = module.canvas;
    canvas.lineWidth = 1;
    canvas.strokeStyle = "red";
    var w = (aabb[1][0] - aabb[0][0]) * coef;
    var h = (aabb[1][0] - aabb[0][0]) * coef;
    canvas.strokeRect(aabb[0][0]*coef,aabb[0][1]*coef,w,h);
//    console.log("> "+aabb[0][0]*coef+ " "+ aabb[0][1]*coef+ " "+w+" "+h);
  }

  module.DrawPoint = function(pos,color) {
    if (!module._isEnabled)
      return;

    var canvas = module.canvas;
    canvas.fillStyle = color;
    canvas.fillRect(pos[0]*coef,pos[1]*coef,5,5);
//    console.log("> "+aabb[0][0]*coef+ " "+ aabb[0][1]*coef+ " "+w+" "+h);
  }

  module.SetEnabled = function(val) {
    module.Clear();
    module._isEnabled = val;
    document.getElementById('debug-canvas').style.visibility = (module._isEnabled) ? "" : "hidden";
  }

  return module;  
}

);
