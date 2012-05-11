define(["./event", "./raf-loop", "./graphics"], function(Event, RAFLoop, Graphics){

  var Schedule = {};

  Event(Schedule);

  var __status = {
    lastTime: 0,
    currentTime: 0,
    dt: 0
  };

  var __mainLoop = new RAFLoop(function(){
    var currentTime = Date.now();
    __status.dt = currentTime - __status.lastTime;
    __status.currentTime = currentTime;
    Event.flush();
    Graphics.render();
    __status.lastTime = currentTime;
    Schedule.status = __status;
    Schedule.event.dispatch("update", __status);
  });

  Schedule.start = function(){
    __mainLoop.start();
  };

  Schedule.stop = function(){
    __mainLoop.stop();
  };

  Schedule.status = __status;

  return Schedule;

});