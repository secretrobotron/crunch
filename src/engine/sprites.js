/**
 * Sprites module.
 *
 * Provides both a canvas and a webgl based animated sprite displayComponent
 * Animated sprite display components are initialized with a descriptor of the form:
 * 
 * SpriteDesc = {
 *     resource:"hero.png",
 *     tileWidth: 32,
 *     tileHeight: 32,
 *     imageWidth: 256,
 *     imageHeight: 256,
 *     animations : {
 *         idle : {
 *             frameCount: 2,
 *             speed: 0.5,
 *             index: 0
 *         },
 *         walking : {
 *             frameCount: 2,
 *             speed: 2,
 *             index: 1
 *         }
 *     }
 *   };
 *   
 */
var Sprites = (function() {
    var module = {};

    // ------------------------------ things that are common to both canvas and webgl backends
    var Common = (function() {
        var common_submodule = {};

        function CreateEmptyDisplayComponent(componentType) {
            return {
              type: componentType
            , loaded: false
            , advance: function(a,b) {}
            , display: function(a,b) {}
            }
        }

        LoadImageAsset = function(url, callback) {
          console.log("Loading image '" + url +"'");
          var sprite = new Image();
          sprite.onload = function() {
              console.log("Loaded '" + url +"'");
              //Util.assets[url] = sprite;
              callback(sprite);
          };
          sprite.src = url;
        };

        function AnimatedSpriteAdvanceFrame(obj, elapsedTime) {
            obj.animation.time = 
                (obj.animation.time 
                + obj.displayComponent.spriteDescriptor.animations[obj.animation.name].speed 
                * elapsedTime/1000)%1.0;
        }

    // public:
        common_submodule.CreateEmptyDisplayComponent = CreateEmptyDisplayComponent;
        common_submodule.AnimatedSpriteAdvanceFrame  = AnimatedSpriteAdvanceFrame;
        common_submodule.LoadImageAsset = LoadImageAsset;

        return common_submodule;
    }());



    // ------------------------------------------------------------- canvas backend
    var Canvas2d = (function() {
        var canvas_submodule = {};

        function AnimatedSpriteDisplay(ctx, obj) {
            var display = obj.displayComponent;
            var spriteDescriptor = display.spriteDescriptor;
            var animDescriptor = spriteDescriptor.animations[obj.animation.name];
            var line = animDescriptor.index * 2 + obj.animation.direction;
            DisplayAnimationFrame(ctx
                , obj.x, obj.y, obj.animation.time
                , spriteDescriptor.spriteSheet
                , line
                , animDescriptor);
        }


        function CreateAnimatedScriptDisplayComponent(descriptor) {
          var component = Common.CreateEmptyDisplayComponent("CanvasAnimatedSprite");
          Common.LoadImageAsset(descriptor.resource, function(spriteSheet) {
            spriteSheet.tileWidth  = descriptor.tileWidth;
            spriteSheet.tileHeight = descriptor.tileHeight;
            descriptor.spriteSheet = spriteSheet;
            component.spriteDescriptor = descriptor;
            component.advance = Common.AnimatedSpriteAdvanceFrame;
            component.display = AnimatedSpriteDisplay;
            component.loaded  = true;
          });
          return component;
        }


        function DisplayAnimationFrame(ctx, x, y, time, spriteSheet, line, animDesc) {
          var currentFrame;
          //animation.currentTime = (animation.time + elapsedTime / animation.currentAnimation.animspeed) % 1;
          currentFrame = Math.floor(time * animDesc.frameCount);
          var sx = currentFrame * spriteSheet.tileWidth;
          var sy = spriteSheet.tileHeight * line

          try {
            ctx.drawImage(spriteSheet
              , sx, sy
              , spriteSheet.tileWidth, spriteSheet.tileHeight
              , x, y
              , spriteSheet.tileWidth, spriteSheet.tileHeight);
          } catch ( err ) {
            if (loaded === true) {
                console.log("drawImage error");
            }
          }
        }

    // public:
        canvas_submodule.Init = function(ctx) { module.hasCanvas = true; };
        canvas_submodule.CreateAnimatedScriptDisplayComponent = CreateAnimatedScriptDisplayComponent;
        
        return canvas_submodule;
    }()); // submodule Canvas2d



    // -------------------------------------------------------------- WebGL backend
    var WebGL = (function(){
        webgl_submodule = {};

        // from learningwebgl.com
        function CreateShader(gl, id) {
            var shaderScript = document.getElementById(id);
            if (!shaderScript) {
              alert("shader not found: "+id);
              return null;
            }

            var str = "";
            var k = shaderScript.firstChild;
            while (k) {
              if (k.nodeType == 3)
                  str += k.textContent;
              k = k.nextSibling;
            }

            var shader;
            if (shaderScript.type == "x-shader/x-fragment") {
              console.log("Loading fragment shader "+id);
              shader = gl.createShader(gl.FRAGMENT_SHADER);
            } else if (shaderScript.type == "x-shader/x-vertex") {
              console.log("Loading vertex shader "+id);
              shader = gl.createShader(gl.VERTEX_SHADER);
            } else {
              alert("error: "+id+"has wrong shader type : "+shaderScript.type);
              return null;
            }

            gl.shaderSource(shader, str);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
              alert(gl.getShaderInfoLog(shader));
              return null;
            }

            return shader;
        }

        function CreateShaderProgram(gl, vsName, fsName) {
            var vertexShader   = CreateShader(gl, vsName);
            var fragmentShader = CreateShader(gl, fsName);

            var shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
              alert("Could not initialise shaders");
            }

            shaderProgram.uPMatrix  = gl.getUniformLocation(shaderProgram, "uPMatrix");
            shaderProgram.uMVMatrix = gl.getUniformLocation(shaderProgram, "uMVMatrix");
            shaderProgram.uTexture  = gl.getUniformLocation(shaderProgram, "uTexture");
            shaderProgram.uLine     = gl.getUniformLocation(shaderProgram, "uLine");
            shaderProgram.uRow      = gl.getUniformLocation(shaderProgram, "uRow");
            shaderProgram.uTileWidth= gl.getUniformLocation(shaderProgram, "uTileWidth");
            shaderProgram.uTileHeight= gl.getUniformLocation(shaderProgram, "uTileHeight");
            shaderProgram.aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
            shaderProgram.atexCoordinates = gl.getAttribLocation(shaderProgram, "aTexCoordinates");

            gl.enableVertexAttribArray(shaderProgram.aVertexPosition);
            gl.enableVertexAttribArray(shaderProgram.aTexCoordinates);
            
            shaderProgram.bind = function() {
                gl.useProgram(shaderProgram);  
            }

            return shaderProgram;

        }

        function RenderAnimatedSpriteQuad(shaderProgram, projMatrix, modelViewMatrix, tex, line, row, tw, th) {
            var gl = webgl_submodule.ctx;

            var quadVBO = webgl_submodule.quadVBO;
            var texCoordsABO = webgl_submodule.texCoordsABO;
            // uniforms
            gl.useProgram(shaderProgram);
            
            gl.uniformMatrix4fv(shaderProgram.uPMatrix, false, projMatrix);
            gl.uniformMatrix4fv(shaderProgram.uMVMatrix, false, modelViewMatrix);
            gl.uniform1f(shaderProgram.uLine, line);
            gl.uniform1f(shaderProgram.uRow, row);
            gl.uniform1f(shaderProgram.uTileWidth, tw);
            gl.uniform1f(shaderProgram.uTileHeight, th);
            // vertex pos attrib
            gl.enableVertexAttribArray(0);
            gl.enableVertexAttribArray(1);
            gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
            gl.vertexAttribPointer(shaderProgram.aVertexPosition, quadVBO.itemSize, gl.FLOAT, false, 0, 0);
            // tex coords attrib
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsABO);
            gl.vertexAttribPointer(shaderProgram.aTexCoordinates, texCoordsABO.itemSize, gl.FLOAT, false, 0, 0);
            
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.uniform1i(shaderProgram.uTexture, 0);
        
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, webgl_submodule.quadVBO.numItems);
        }

        function AnimatedSpriteDisplay(ctx, obj) {
            if (ctx !== webgl_submodule.ctx) alert("error, wrong context");
            var dc = obj.displayComponent;
            var spriteDescriptor = dc.spriteDescriptor;
            var animDescriptor = spriteDescriptor.animations[obj.animation.name];
            var line = animDescriptor.index * 2 + obj.animation.direction;
            var currentFrame = Math.floor(obj.animation.time * animDescriptor.frameCount);
            
            RenderAnimatedSpriteQuad( dc.shader
                , Sprites.WebGL.projectionMatrix, obj.modelViewMatrix
                , dc.texture
                , line, currentFrame
                , dc.tileWidth_tex, dc.tileHeight_tex );
        }

        function CreateAnimatedScriptDisplayComponent(descriptor) {
          var component = Common.CreateEmptyDisplayComponent("WebGLAnimatedSprite");
          
          Common.LoadImageAsset(descriptor.resource, function(spriteSheet) {
            component.tileWidth  = descriptor.tileWidth;
            component.tileHeight = descriptor.tileHeight;
            component.tileWidth_tex  = descriptor.tileWidth/descriptor.imageWidth;
            component.tileHeight_tex = descriptor.tileHeight/descriptor.imageHeight;

            descriptor.spriteSheet = spriteSheet;
            component.spriteDescriptor = descriptor
            ;
            component.advance = Common.AnimatedSpriteAdvanceFrame;
            component.display = AnimatedSpriteDisplay;
            
            var gl = module.WebGL.ctx;
            var tex = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, tex);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteSheet);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D, null);

            component.texture = tex;
            component.shader = webgl_submodule.animatedSpriteShaderProgram;
            component.loaded = true;
          });
          return component;
        }

        function InitGL(gl) {
            module.hasWebGl = true;
            webgl_submodule.ctx = gl;

            var quadVertices = [
                  -0.5,  0.5, 0.0
                ,  0.5,  0.5, 0.0
                , -0.5, -0.5, 0.0
                ,  0.5, -0.5, 0.0
            ];
            var quadTexCoords = [
                  0.0, 1.0
                , 1.0, 1.0
                , 0.0, 0.0
                , 1.0, 0.0
            ];

            // vertices
            var quadVBO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, quadVBO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
            quadVBO.itemSize = 3;
            quadVBO.numItems = 4;
            webgl_submodule.quadVBO = quadVBO;
            // texture coordinates
            var texCoordsABO = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsABO);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexCoords), gl.STATIC_DRAW);
            texCoordsABO.itemSize = 2;
            texCoordsABO.numItems = 4;
            webgl_submodule.texCoordsABO = texCoordsABO;

            webgl_submodule.animatedSpriteShaderProgram = CreateShaderProgram(gl, "sprites-vs", "sprites-fs");
        }// InitGL

        
        

        // TODO DisplayComponent, texture stuff

    //public:
        webgl_submodule.Init        = InitGL;
        webgl_submodule.GetShader   = CreateShader;
        webgl_submodule.CreateShaderProgram = CreateShaderProgram;
        webgl_submodule.CreateAnimatedScriptDisplayComponent = CreateAnimatedScriptDisplayComponent;
        webgl_submodule.RenderAnimatedSpriteQuad = RenderAnimatedSpriteQuad;

        return webgl_submodule;
    }()); // submodule WebGL

// public:
    module.ANIM_LEFT=1;
    module.ANIM_RIGHT=0;
    module.Canvas2d = Canvas2d;
    module.WebGL    = WebGL;
    
    return module;
}()); // module Sprites