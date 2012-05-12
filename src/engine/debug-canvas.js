
define([], function () {
  var module = {};

  module.canvas = document.getElementById('debug-canvas').getContext('2d');;

  module.Clear = function () {
    module.canvas.width = module.canvas.width;
  }

  var coef = 20;

  module.DrawBox = function(aabb) {
    var canvas = module.canvas;
    canvas.lineWidth = 1;
    canvas.strokeStyle = "red";
    var w = (aabb[1][0] - aabb[0][0]) * coef;
    var h = (aabb[1][0] - aabb[0][0]) * coef;
    canvas.strokeRect(aabb[0][0]*coef,aabb[0][1]*coef,w,h);
//    console.log("> "+aabb[0][0]*coef+ " "+ aabb[0][1]*coef+ " "+w+" "+h);
  }

  module.DrawPoint = function(pos,color) {
    var canvas = module.canvas;
    canvas.fillStyle = color;
    canvas.fillRect(pos[0]*coef,pos[1]*coef,5,5);
//    console.log("> "+aabb[0][0]*coef+ " "+ aabb[0][1]*coef+ " "+w+" "+h);
  }

  return module;  
}

);