

define( function(){

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

  // usage OnBoxCollision("hero","enemy").push( function(hero,enemy) {hero.kill();} );
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
            var b1 = { width:objByFamily[f1][i1].boundingBox.width
                , height:objByFamily[f1][i1].boundingBox.height},
                b2 = {width:objByFamily[f2][i2].boundingBox.width
                , height:objByFamily[f2][i2].boundingBox.height};
            b1.x = objByFamily[f1][i1].x;
            b1.y = objByFamily[f1][i1].y;
            b2.x = objByFamily[f2][i2].x;
            b2.y = objByFamily[f2][i2].y;
            if( module.BoxCollisionTest( b1, b2 ) ){
              module.logic.boxCollisions[f1][f2].forEach(function(cb){
                cb( objByFamily[f1][i1], objByFamily[f2][i2], elapsedTime );
              });
            }
          }
        }
      }
    }
  };

  module.BoxCollisionTest = function ( box1, box2 ) {
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

  // helper function to test if a game object touches the ground
  // TODO
  module.IsGrounded = function(gameObject){
    if(gameObject.collisionPoints && gameObject.collisionPoints.feet2){
        return (gameObject.collisionPoints.feet2.state >= 0)
    } else return false;
  };

  
  
  module.DoOneFrame = function() {
    
    var now = Date.now();
    // to avoid weird stuff in first frame
    if (module.lastFrameTime === 0) {
      module.lastFrameTime = now - 16;
    }

    var elapsedTime = module.elapsedTime = now - module.lastFrameTime;
    
    /*
    // precomute all point collisions
    for (var o = 0; o < physical.length; o++) {
      for(var cp in physical[o].collisionPoints) {
        physical[o].collisionPoints[cp].state = this.testCollision(
          physical[o].x + physical[o].collisionPoints[cp].x,
          physical[o].y + physical[o].collisionPoints[cp].y,
          Carre.Tile.layers.solid,
          Carre.Tile.solidMapData
        );
      }
    }
    */

    // precompute all boxCollisions
    ProcessBoxCollisions(elapsedTime);

    if (module.logic.eachFrame) {
      module.logic.eachFrame.forEach(function(callback) {
          callback(elapsedTime);
      });
    }
    module.lastFrameTime = now;
  };
  
  // simple 2D bounding box collision test
  module.TestCollision = function(x, y, layer, mapData) {
    var tx = Math.floor(x / Carre.Tile.map.tilewidth),
        ty = Math.floor(y / Carre.Tile.map.tileheight),
        id = tx + ty * layer.width,
        tId = layer.data[id],
        tileData = mapData[id];
    if (typeof tId !== "undefined" && tId !== 0 &&
        tx >= 0 && ty >= 0 &&
        tx <= layer.width && ty <= layer.height) {
      return Carre.colorConv[tileData.color];
    }
    return -1;
  };

  return module;
});//module GameLogic