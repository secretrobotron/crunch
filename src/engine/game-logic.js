define(["engine/schedule", "engine/debug-canvas"], function(Schedule,DebugCanvas){

  var module = {
      // lists of the game objects 
      gameObjects: {
          byFamily : {}
        , all : []
      }
      // lists of gameplay rules
    , logic: {
          eachFrame : []
        , boxCollisions : []
      }
    , lastFrameTime:0
  };

  // return the array of all the game objects belonging to family 
  module.GetFamily = function(family) {
    if (module.gameObjects.byFamily[family] === undefined || module.gameObjects.byFamily[family] === null) {
      module.gameObjects.byFamily[family] = [];
    }
    return module.gameObjects.byFamily[family];
  };

  // registers a game object
  module.AddGameObject = function(obj) {
    for (var i in obj.families) {
      if (module.GetFamily(obj.families[i]) === undefined) {
        module.logic.byFamily[obj.families[i]] = [];
      }
      module.GetFamily(obj.families[i]).push(obj);
    }
    module.gameObjects.all.push(obj);
    return obj;
  };

  module.RemoveGameObject = function(obj) {
    // remove from gameObjects.all
    var all = module.gameObjects.all;
    for(var k=0; k<all.length;++k) {
      if (all[k]===obj) {
        all.splice(k,1);
        break;
      }
    }
    // remove from byfamily arrays
    for (var i in obj.families) { 
      var fam = module.GetFamily(obj.families[i]);
      if ( fam !== undefined) {
        for(var j=0; j<fam.length;++j) {
          if (fam[j]===obj) {
            fam.splice(j,1);
          }
        }
      }
    }
    module.gameObjects.all.push(obj);
    return obj;
  }

  // usage: EachFrame("BadGuys").push( function(bad) { bad.doNastyThings();} );
  // Register a gameplay rule callback for a given family name
  module.EachFrame = function(familyName) {
    if ( !module.logic.eachFrame[familyName]){
      module.logic.eachFrame[familyName] = [];
    }
    return module.logic.eachFrame[familyName];
  }

  ProcessEachFrame = function(elapsedTime) {
    for (var familyName in module.logic.eachFrame) {
      var family = module.GetFamily(familyName);
      for( var objIdx = 0; objIdx < family.length; ++objIdx ) {
        for( var i=0; i<module.logic.eachFrame[familyName].length;++i )
        module.logic.eachFrame[familyName][i](family[objIdx],elapsedTime);
      }
    }
  }

  // usage: OnBoxCollision("hero","enemy").push( function(hero,enemy) {hero.kill();} );
  // Register a gameplay rule callback between two families of objects
  module.OnBoxCollision = function(f1, f2) {
    if ( !module.logic.boxCollisions[f1]){
      module.logic.boxCollisions[f1] = {};
      module.logic.boxCollisions[f1][f2] = []
    }
    else if (!module.logic.boxCollisions[f1][f2]){
      module.logic.boxCollisions[f1][f2] = [];
    }
    return module.logic.boxCollisions[f1][f2];
  };

  // called each frame, before the rest of the gameplay code
  ProcessBoxCollisions = function(elapsedTime) {
    var objByFamily = module.gameObjects.byFamily;
    for( var f1 in module.logic.boxCollisions ){
      for( var i1 = 0; i1 < module.GetFamily(f1).length;++i1 ){
        for( var f2 in module.logic.boxCollisions[f1] ){
          for( var i2 = 0; i2 < module.GetFamily(f2).length;++i2 ){
            var b1 = objByFamily[f1][i1].getAABB()
              , b2 = objByFamily[f2][i2].getAABB();
            if( module.BoxCollisionTest2d( b1, b2 ) ){
              // invoke every callback for collision evt between these two folks
              (function(a, b, ff1, ff2){module.logic.boxCollisions[ff1][ff2].forEach(function(cb){
                cb( a, b, elapsedTime );
              })}(objByFamily[f1][i1], objByFamily[f2][i2], f1, f2));
            }
          }
        }
      }
    }
  };

  module.BoxCollisionTest_old = function ( box1, box2 ) {
      var ax1 = box1.x,
          ax2 = box1.x + box1.width,
          bx1 = box2.x,
          bx2 = box2.x + box2.width,
          ay1 = box1.y,
          ay2 = box1.y + box1.height,
          by1 = box2.y,
          by2 = box2.y + box2.height;
      return (
          (ax2 > bx1) && (bx2 > ax1)
          &&(ay2 > by1) && (by2 > ay1)
      );
  };

  module.BoxCollisionTest2d = function ( box1, box2 ) {
    var ax1 = box1[0][0]
      , ax2 = box1[1][0]
      , bx1 = box2[0][0]
      , bx2 = box2[1][0]
      , ay1 = box1[0][1]
      , ay2 = box1[1][1]
      , by1 = box2[0][1]
        by2 = box2[1][1];
    return (
        (ax2 > bx1) && (bx2 > ax1)
        &&(ay2 > by1) && (by2 > ay1)
    );
  };

  module.PointCollisionTest2d = function ( point, box ) {
    return (
        point[0]>box[0][0] && point[0]<box[1][0] && //x
        point[1]>box[0][1] && point[1]<box[1][1]    //y
    );
  };

  ProcessPointCollisions = function () {
    var pointList = module.GetFamily("HasCollisionPoints");
    var boxList = module.GetFamily("PointCollision");
    for(var i=0; i<pointList.length;++i ) {
      for(var cp in pointList[i].collisionPoints) {
        var currPoint = pointList[i].collisionPoints[cp];
        currPoint.state = false;
        for(var j=0; j<boxList.length;++j ) {
          var worldPosition = currPoint.slice();
          var objPosAB = pointList[i].getAABB();
          var objPosA = objPosAB[0];
          var objPosB = objPosAB[1];
          worldPosition[0]+=(objPosA[0]+objPosB[0])/2.0;
          worldPosition[1]+=(objPosA[1]+objPosB[1])/2.0;
          //worldPosition[2]+=(objPosA[2]+objPosB[2])/2.0;
          if(!currPoint.state) {
            currPoint.state = module.PointCollisionTest2d(worldPosition, boxList[j].getAABB()); 
          };
        }
        if(currPoint.state) DebugCanvas.DrawPoint(worldPosition,"white");
        else DebugCanvas.DrawPoint(worldPosition,"green");
      }
    }
  }

  unittest = function() {
    var aabb = [[1,1,-1],[10,10,10]];
    // dont collid
    var p1 = [0,0,0];
    var p2 = [-1,0,0];
    var p3 = [0,5,0];
    var p4 = [5,0,0];
    var p5 = [15,0,0];
    var p6 = [0,15,0];
    // collide
    var p7 = [5,5,5];
    var p8 = [2,5,5];
    var p9 = [9,8,5];

    if( module.PointCollisionTest2d(p1,aabb) ) alert("fail1");
    if( module.PointCollisionTest2d(p2,aabb) ) alert("fail2");
    if( module.PointCollisionTest2d(p3,aabb) ) alert("fail3");
    if( module.PointCollisionTest2d(p4,aabb) ) alert("fail4");
    if( module.PointCollisionTest2d(p5,aabb) ) alert("fail5");
    if( module.PointCollisionTest2d(p6,aabb) ) alert("fail6");
    if( !module.PointCollisionTest2d(p7,aabb) ) alert("fail7");
    if( !module.PointCollisionTest2d(p8,aabb) ) alert("fail8");
    if( !module.PointCollisionTest2d(p9,aabb) ) alert("fail9");
  }


  // helper function to test if a game object touches the ground
  module.IsGrounded = function(gameObject){
    return (gameObject.collisionPoints && (gameObject.collisionPoints.downA2.state===true || gameObject.collisionPoints.downB2.state===true));
  };
  
  module.DoOneFrame = function() {
    var now = Date.now();
    // to avoid weird stuff in first frame
    if (module.lastFrameTime === 0) {
      module.lastFrameTime = now - 16;
    }

    var elapsedTime = module.elapsedTime = now - module.lastFrameTime;

    // precompute all pointCollisions, the state is cached in entity.collisionPoints["pointName"].state
    ProcessPointCollisions([]);
    // process all boxCollision
    ProcessBoxCollisions(elapsedTime);
    ProcessEachFrame(elapsedTime)

    //if (module.logic.eachFrame) {
    //  module.logic.eachFrame.forEach(function(callback) {
    //      callback(elapsedTime);
    //  });
    //}
    module.lastFrameTime = now;
  };

  return module;
});//module GameLogic
