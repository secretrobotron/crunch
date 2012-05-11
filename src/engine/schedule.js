define(["./observe", "./event", "./raf-loop", "./graphics"], function(Observe, Event, RAFLoop, Graphics){

  var Schedule = {};

  Event(Schedule);
  Observe(Schedule);

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
    Schedule.observe.notify("render", __status);
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