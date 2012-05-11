define(["engine/schedule", "engine/component"], function(Schedule, Component){
  
  return Component("test", function(testArg1, testArg2){

    var _this = this;

    this.event.add("entity-changed", function(e){
      console.log("entity changed!", e.data);
    });

    Schedule.event.add("update", function(){
      console.log("test update", testArg1, testArg2);
    });

  });

});