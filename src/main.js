require(["engine/observe", "engine/event", "engine/raf-loop"], 
        function(Observe, Event, RAFLoop){

  var testObj = {};
  Observe(testObj);
  Event(testObj);

  testObj._observe.subscribe("test", function(context){
    console.log("Observer success:", context);
  });

  testObj._event.add("test", function(event){
    console.log("Event success:", event);
  });

  testObj._event.dispatch("test", {
    lol: "cat"
  });

  testObj._observe.notify("test", {
    bar: "foo"
  });

  var _mainLoop = new RAFLoop(function(){
    Event.flush();
    _mainLoop.stop();
    console.log('mainloop!');
  });

  _mainLoop.start();

});