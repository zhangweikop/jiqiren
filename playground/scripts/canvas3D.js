function makeMyWorldView(rootDom, rows, columns){
	var world = [];
	var boardObjects = {};
	var rootContainer = $(rootDom);
	var canvasID = rootContainer.children()[0].id;
	var width = columns;
	var length = rows;
	var worldUnit = 100;
	function makeCanvas(canvasID, width, length, worldUnit) {
		var canvasDom;
		var glCamera;
		var glScene;
		var glLight;
		var glAmbientLight;
		var renderer;
		var myWorld = {};
		var myCharacters = {};
		var unit = worldUnit;
		var updates = (function() {
			var actions = [];
			return {
				addNewAction: function(fun) {
					actions.push(fun);
				},
				executeActions: function() {
					var i = 0;
					while (i <actions.length) {
						var fun = actions[i];
						var finished = false;
						if (!fun) {
							finished = true;
						} else {
							finished = fun();
						}
						if(finished) {
							actions.splice(i, 1);
						} else {
							i++;
						}
					}
				}
			};
		})();
		var canvasStyle = (function() {
			var canvasVisible = true;
			return {
				visible : canvasVisible,
				show : function() {
					if (!canvasVisible) {
						var canvas = $('#' + canvasID);
						var canvasOverlay = canvas.next()[0];
						if (canvasOverlay) {
							$(canvasOverlay).hide();
						}
						canvasVisible = true;
						canvas.show();
					}
				},
				hide : function() {
					if (canvasVisible) {
						var canvas = $('#' + canvasID);
						var canvasOverlay = canvas.next()[0];
						if (canvasOverlay) {
							$(canvasOverlay).show();
						}
						canvas.hide();
						canvasVisible = false;
					}
				}
			};
		})();
		var loadFiles = (function(){
				var files = [];
				return {
					pendingFiles: files,
					loadNew: function (url) {
						files.push(url);
						canvasStyle.hide();
					},
					finishLoad: function (url) {
						var index = files.indexOf(url);
						files.splice(index, 1);
						if(files.length == 0) {
							canvasStyle.show();
						}
					}
				}
			})();
		var walls = [{ width : width, length : 1, height : 0.5, position : {x : 0, y :0}}, 
					 { width : 1, length : length-1, height : 0.5, position : {x : 0, y :1}},
					 { width : width-1, length : 1, height : 0.5, position : {x : 1, y : length -1}},
					 { width : 1, length : length-2, height : 0.5, position : {x : width-1, y : 1}}
					 //{ width : 7, length : 1, height : 0.5, position : {x : 1, y : 3}} 
					 // { width : 1, length : 3, height : 0.5, position : {x : 2, y : 4}}

					];


		function init (argument) {
			canvasDom = document.getElementById(canvasID);

			var canvasWidth = rootContainer.innerWidth();
			var canvasHeight = canvasWidth*3/4;

			canvasDom.width = canvasWidth;
			canvasDom.height = canvasHeight;
			var canvasOverlay = $(canvasDom).next()[0];
			if (canvasOverlay) {
				$(canvasOverlay).width(canvasWidth);
				$(canvasOverlay).height(canvasHeight);
				$(canvasOverlay).css({display:"none", "padding-top": canvasHeight/2});
			}
			

			glScene = new THREE.Scene();
			console.log($(canvasDom).innerWidth());
			glCamera = new THREE.PerspectiveCamera(75, $(canvasDom).innerWidth() / $(canvasDom).innerHeight() , 0.1, 20000 );
			glCamera.position.set(0, 1200, 800);
			glCamera.lookAt(new THREE.Vector3( 0, -100, 200));	

			glLight = new THREE.DirectionalLight( 0xffffff, 1 );
			glLight.position.set( 200, 200, 0 );
	 		glScene.add( glLight );

	 		glAmbientLight = new THREE.AmbientLight( 0x808080 );
	 		glScene.add( glAmbientLight );

	
			glScene.add(glCamera);
			renderer = new THREE.WebGLRenderer({canvas: canvasDom, antialias:true});
			buildFloor();
		}

		function worldObject(canvasOrigin, width, length, unit) {
			this.unit = unit;
			this.canvasOrigin = canvasOrigin;
			this.width = width;
			this.length = length;
			this.cells = [];
			this.children = [];
			for (var x = 0; x <= width; x++) {
				this.cells[x] = [];
				for (var y = 0 ; y <= length; y++) {
					this.cells[x][y] = null;
				}
			}
		};
		worldObject.prototype.hasObject = function(position) {
			return (this.cells[position.x][position.y] === 0) || (!!this.cells[position.x][position.y]);
		};
		worldObject.prototype.transformCellOriginToCanvas = function(position, width, length, height) {
			var canvasPosition = {};
			canvasPosition.x = this.canvasOrigin.x + this.unit*position.x;
			if (position.h) {
				canvasPosition.y = this.canvasOrigin.y + this.unit*position.h;
			} else {
				canvasPosition.y = this.canvasOrigin.y;
			}
			canvasPosition.z = this.canvasOrigin.z - this.unit*position.y;

			if (width) {
				canvasPosition.x += width*this.unit/2;
			}
			if (length) {
				canvasPosition.z -= length*this.unit/2;
			}
			if (height) {

				canvasPosition.y += height*this.unit/2;
			}
			return canvasPosition;
		};
		
		worldObject.prototype.transformCellCenterToCanvas = function(position, width, length, height) {
			var canvasPosition = {};
			canvasPosition.x = this.canvasOrigin.x + this.unit*position.x + this.unit/2;
			if (position.h) {
				canvasPosition.y = this.canvasOrigin.y + this.unit*position.h + this.unit/2;
			} else {
				canvasPosition.y = this.canvasOrigin.y;
			}
			canvasPosition.z = this.canvasOrigin.z - this.unit*position.y - this.unit/2;
			return canvasPosition;
		};

		worldObject.prototype.addChild = function (child, position, width, length) {
			this.children.push(child);
			var key = this.children.length;
			var sx = position.x;
			var sy = position.y;
			for (var x = sx; x < sx + width; x++) {
				for(var y = sy; y < sy + length; y ++) {
					this.cells[x][y] = key;
				}
			}
		};

		function buildFloor() {
			var loader = new THREE.TextureLoader();
			var url = 'webgl/textures/texture-half-2.png';
			loadFiles.loadNew(url);
			var cellTexture = loader.load(
			// resource URL
			'webgl/textures/texture-half-2.png' );
				// Function when resource is loaded
				(function ( cellTexture ) {
					cellTexture.wrapS = THREE.RepeatWrapping;
					cellTexture.wrapT = THREE.RepeatWrapping;
					cellTexture.repeat.set(width, length);
					var floorMaterial = new THREE.MeshPhongMaterial( { map: cellTexture, side: THREE.DoubleSide } );
					var floorGeometry = new THREE.PlaneGeometry(width * unit, length*unit, 1, 1);
					var floor = new THREE.Mesh(floorGeometry, floorMaterial);
					
					floor.position.set(0, 0, 0);
					floor.rotation.x = Math.PI * -0.5;
					//floor.rotation.z = Math.PI / 4;
					var floorOrigin = {x : 0 -  width * unit /2, y : 0, z : length * unit /2};

					myWorld = new worldObject(floorOrigin, width, length, unit);
					world.push(myWorld);
					//myWorld = new worldObject({x:0 -  width * unit /2, y : 0-length * unit /2, z : 0}, width, length, unit);

				 	glScene.add(floor);

					var wallMaterial = new THREE.MeshPhongMaterial( { color: 0x0C81CD } );

					var finalGeo = new THREE.Geometry();
					for (var i = 0; i < walls.length; i ++) {
						var wall = walls[i];
						var wallGeometry = new THREE.BoxGeometry(wall.width * unit, wall.height*unit, wall.length*unit);
						var cube = new THREE.Mesh( wallGeometry, wallMaterial );
						var position = wall.position;
						var canvasPosition = myWorld.transformCellOriginToCanvas({x : position.x, y : position.y}, wall.width, wall.length, wall.height);
						cube.position.set(canvasPosition.x, canvasPosition.y, canvasPosition.z);
						myWorld.addChild(cube, {x : position.x, y : position.y}, wall.width, wall.length);
					//	console.log(cube.position.x + ' cube, ' + cube.position.y)
						cube.updateMatrix();

						finalGeo.merge(cube.geometry, cube.matrix);
						//myWorld.addChild(cube);
						//glScene.add(cube);

					}	
					var finalMesh = new THREE.Mesh(finalGeo, wallMaterial);
					finalMesh.position.set(0,0,0);
					glScene.add(finalMesh);
					loadFiles.finishLoad(url);
			})(cellTexture);	
			
		}
		function createF50Model() {
				//http://threejs.org/examples/#webgl_materials_cars
				var textureCube = null;
				var mlib = {
					"Orange": 	new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.3 } ),
					"Blue": 	new THREE.MeshLambertMaterial( { color: 0x001133, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.3 } ),
					"Red": 		new THREE.MeshLambertMaterial( { color: 0x660000, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 } ),
					"Black": 	new THREE.MeshLambertMaterial( { color: 0x000000, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.15 } ),
					"White":	new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 } ),
					"Carmine": 	new THREE.MeshPhongMaterial( { color: 0x770000, specular:0xffaaaa, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Gold": 	new THREE.MeshPhongMaterial( { color: 0xaa9944, specular:0xbbaa99, shininess:50, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Bronze":	new THREE.MeshPhongMaterial( { color: 0x150505, specular:0xee6600, shininess:10, envMap: textureCube, combine: THREE.MixOperation, reflectivity: 0.25 } ),
					"Chrome": 	new THREE.MeshPhongMaterial( { color: 0xffffff, specular:0xffffff, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Orange metal": new THREE.MeshLambertMaterial( { color: 0xff6600, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Blue metal": 	new THREE.MeshLambertMaterial( { color: 0x001133, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Red metal": 	new THREE.MeshLambertMaterial( { color: 0x770000, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Green metal": 	new THREE.MeshLambertMaterial( { color: 0x007711, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Black metal":	new THREE.MeshLambertMaterial( { color: 0x222222, envMap: textureCube, combine: THREE.MultiplyOperation } ),
					"Pure chrome": 	new THREE.MeshLambertMaterial( { color: 0xffffff, envMap: textureCube } ),
					"Dark chrome":	new THREE.MeshLambertMaterial( { color: 0x444444, envMap: textureCube } ),
					"Darker chrome":new THREE.MeshLambertMaterial( { color: 0x222222, envMap: textureCube } ),
					"Black glass": 	new THREE.MeshLambertMaterial( { color: 0x101016, envMap: textureCube, opacity: 0.975, transparent: true } ),
					"Dark glass":	new THREE.MeshLambertMaterial( { color: 0x101046, envMap: textureCube, opacity: 0.25, transparent: true } ),
					"Blue glass":	new THREE.MeshLambertMaterial( { color: 0x668899, envMap: textureCube, opacity: 0.75, transparent: true } ),
					"Light glass":	new THREE.MeshBasicMaterial( { color: 0x223344, envMap: textureCube, opacity: 0.25, transparent: true, combine: THREE.MixOperation, reflectivity: 0.25 } ),
					"Red glass":	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.75, transparent: true } ),
					"Yellow glass":	new THREE.MeshLambertMaterial( { color: 0xffffaa, opacity: 0.75, transparent: true } ),
					"Orange glass":	new THREE.MeshLambertMaterial( { color: 0x995500, opacity: 0.75, transparent: true } ),
					"Orange glass 50":	new THREE.MeshLambertMaterial( { color: 0xffbb00, opacity: 0.5, transparent: true } ),
					"Red glass 50": 	new THREE.MeshLambertMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } ),
					"Fullblack rough":	new THREE.MeshLambertMaterial( { color: 0x000000 } ),
					"Black rough":		new THREE.MeshLambertMaterial( { color: 0x050505 } ),
					"Darkgray rough":	new THREE.MeshLambertMaterial( { color: 0x090909 } ),
					"Red rough":		new THREE.MeshLambertMaterial( { color: 0x330500 } ),
					"Darkgray shiny":	new THREE.MeshPhongMaterial( { color: 0x000000, specular: 0x050505 } ),
					"Gray shiny":		new THREE.MeshPhongMaterial( { color: 0x050505, shininess: 20 } )
					};

			var f50 = {
						name: 	"Ferrari F50",
						url:	"webgl/objs/F50NoUv_bin.js",
						init_rotation: [ 0, Math.PI, 0 ],
						scale: 0.0115,
						init_material: 2,
						body_materials: [ 3, 6, 7, 8, 9, 10, 23, 24 ],
						object:	null,
						buttons: null,
						materials: null
					};
			var F50Material = new THREE.MeshLambertMaterial( { color: 0x770000, combine: THREE.MultiplyOperation } );

			f50.materials = {
				body: [
					[ "Orange", 	mlib[ "Orange" ] ],
					[ "Blue", 		mlib[ "Blue" ] ],
					[ "Red", 		mlib[ "Red" ] ],
					[ "Black", 		mlib[ "Black" ] ],
					[ "White", 		mlib[ "White" ] ],
					[ "Orange metal", 	mlib[ "Orange metal" ] ],
					[ "Blue metal", 	mlib[ "Blue metal" ] ],
					[ "Black metal", 	mlib[ "Black metal" ] ],
					[ "Carmine", 	mlib[ "Carmine" ] ],
					[ "Gold", 		mlib[ "Gold" ] ],
					[ "Bronze", 	mlib[ "Bronze" ] ],
					[ "Chrome", 	mlib[ "Chrome" ] ]
				],
			};
			var m = f50.materials;
			var mi = f50.init_material;
			f50.mmap = {
				0:  mlib[ "Dark chrome" ], 		// interior + rim
				1:  mlib[ "Pure chrome" ], 		// wheels + gears chrome
				2:  mlib[ "Blue glass" ], 		// glass
				3:  m.body[ mi ][ 1 ], 			// torso mid + front spoiler
				4:  mlib[ "Darkgray shiny" ], 	// interior + behind seats
				5:  mlib[ "Darkgray shiny" ], 	// tiny dots in interior
				6:  m.body[ mi ][ 1 ], 			// back torso
				7:  m.body[ mi ][ 1 ], 			// right mirror decal
				8:  m.body[ mi ][ 1 ], 			// front decal
				9:  m.body[ mi ][ 1 ], 			// front torso
				10: m.body[ mi ][ 1 ], 			// left mirror decal
				11: mlib[ "Pure chrome" ], 		// engine
				12: mlib[ "Darkgray rough" ],	// tires side
				13: mlib[ "Darkgray rough" ],	// tires bottom
				14: mlib[ "Darkgray shiny" ], 	// bottom
				15: mlib[ "Black rough" ],		// ???
				16: mlib[ "Orange glass" ],		// front signals
				17: mlib[ "Dark chrome" ], 		// wheels center
				18: mlib[ "Red glass" ], 		// back lights
				19: mlib[ "Black rough" ], 		// ???
				20: mlib[ "Red rough" ], 		// seats
				21: mlib[ "Black rough" ], 		// back plate
				22: mlib[ "Black rough" ], 		// front light dots
				23: m.body[ mi ][ 1 ], 			// back torso
				24: m.body[ mi ][ 1 ] 			// back torso center
			};
			return f50;
		}

		function createF50 (geometry, car, position) {
			geometry.sortFacesByMaterialIndex();

			var m = new THREE.MultiMaterial();
			var scale = car.scale * 1;
			var rotation = car.init_rotation;
			var	materials = car.materials;
			var	mi = car.init_material;
			var bm = car.body_materials;
			for ( var i in car.mmap ) {
				m.materials[ i ] = car.mmap[ i ];
			}
			var mesh = new THREE.Mesh( geometry, m );
			mesh.rotation.x = rotation[ 0 ];
			mesh.rotation.y = rotation[ 1 ];
			mesh.rotation.z = rotation[ 2 ];
			
			var box = new THREE.Box3().setFromObject( mesh );
			var carSize = box.size();
			scale = 0.98*unit/Math.max(carSize.x, carSize.y, carSize.z);
			mesh.scale.x = mesh.scale.y = mesh.scale.z = scale;
			box = new THREE.Box3().setFromObject( mesh );
			carSize = box.size();

		 	var carWidth = carSize.x/unit;
		 	var carLength = carSize.z/unit;
			var canvasPosition = myWorld.transformCellCenterToCanvas({x : position.x, y : position.y}, carWidth, carLength, 0);
			mesh.position.set(canvasPosition.x, canvasPosition.y, canvasPosition.z);
		
			console.log(mesh.position);
			boardObjects['f50'] = new characterObject(position, 0, mesh, myWorld);
			glScene.add( mesh );
		}

		function characterObject(position, direction, object, worldObject) {
			// body...
			this.direction = direction;
			this.worldObject = worldObject;
			this.position = position;
			this.object3D = object;
		}
		characterObject.prototype.makeTurn = function(rightorLeft, cb, time) {
			var that = this;
			var startTime = Date.now();
			var startPosition = that.position;
			if(!time) {
				time = 1000;
			}
			var newDirection;
			var newPosition = {x: startPosition.x, y: startPosition.y};
			var startAngle = that.object3D.rotation.y;
			var rotationSpeed;
			var finalRotation =  Math.PI/2;
			if(rightorLeft) {
				switch(that.direction) {
					case 0:
						newPosition.x = startPosition.x + 1;
					break;
					case 1:
						newPosition.y = startPosition.y - 1;
					break;
					case 2:
						newPosition.x = startPosition.x - 1;
					break;
					case 3:
						newPosition.y = startPosition.y + 1;
					break;
				}
				newDirection = (that.direction + 1)%4;
				finalRotation =  0- finalRotation;
				rotationSpeed = finalRotation/time;
			} else {
				switch(that.direction) {
					case 0:
						newPosition.x = startPosition.x - 1;
					break;
					case 1:
						newPosition.y = startPosition.y + 1;
					break;
					case 2:
						newPosition.x = startPosition.x + 1;
					break;
					case 3:
						newPosition.y = startPosition.y - 1;
					break;
				}
				newDirection = (that.direction + 3)%4;
				rotationSpeed = finalRotation/time;
			}
			if(that.worldObject.hasObject(newPosition)) {
				if(cb) {
					cb();
				}
				return false;
			}
			var speedX = (newPosition.x - startPosition.x)/time;
			var speedY = (newPosition.y - startPosition.y)/time;
			updates.addNewAction(function(){
				var finished = false;
				var currentTime = Date.now();
				var angle;
				if(time < currentTime - startTime) {
					that.position = newPosition;
					that.direction = newDirection;
					finished = true;
					angle = finalRotation;
				} else {
					var position = {};
					position.x = startPosition.x + (currentTime - startTime)*speedX;
					position.y = startPosition.y + (currentTime - startTime)*speedY;
					that.position = position;
					angle = rotationSpeed*(currentTime - startTime);
				}
				var canvasPosition = that.worldObject.transformCellCenterToCanvas(that.position);
				that.object3D.position.set(canvasPosition.x, canvasPosition.y, canvasPosition.z);
				that.object3D.rotation.y = startAngle + angle;
				if(finished && (!!cb)) {
					cb();
				}
				return finished;
			});
		}
		characterObject.prototype.moveDirection = function (forward, cb, time) {
			var that = this;
			var startTime = Date.now();
			var startPosition = that.position;
			if(!time) {
				time = 1000;
			}
			var newPosition = {x: startPosition.x, y : startPosition.y};
			var delta = 1;
			if(forward) {
				delta = 1;
			} else {
				delta = -1;
			}
			switch(that.direction) {
				case 0:
					newPosition.y = startPosition.y + delta;
					break;
				case 1:
					newPosition.x = startPosition.x + delta;
					break;
				case 2:
					newPosition.y = startPosition.y - delta;
					break;
				case 3:
					newPosition.x = startPosition.x - delta;
					break;
			}
			return that.moveToPosition(newPosition, cb, time);
		}

		characterObject.prototype.moveToPosition = function (newPosition, cb, time) {
			var that = this;
			var startTime = Date.now();
			var startPosition = that.position;
			if(!time) {
				time = 1000;
			}
			var speedX = (newPosition.x - startPosition.x)/time;
			var speedY = (newPosition.y - startPosition.y)/time;
			if(that.worldObject.hasObject(newPosition)) {
				if(cb) {
					cb();
				}
				return false;
			}
			updates.addNewAction(function(){
				var finished = false;
				var currentTime = Date.now();
				if(time < currentTime - startTime) {
					that.position = newPosition;
					finished = true;
				} else {
					var position = {};
					position.x = startPosition.x + (currentTime - startTime)*speedX;
					position.y = startPosition.y + (currentTime - startTime)*speedY;
					that.position = position;
				}
				var canvasPosition = that.worldObject.transformCellCenterToCanvas(that.position);
				that.object3D.position.set(canvasPosition.x, canvasPosition.y, canvasPosition.z);
				if(finished && (!!cb)) {
					cb();
				}
				return finished;
			});
		}

		function update() {
			updates.executeActions();
		}
		function initializeCharacter(positionX, positionY) {
			var loader1 = new THREE.TextureLoader();
			var url = 'webgl/textures/car2.png';
			var carTexture = loader1.load(
			// resource URL
			'webgl/textures/car2.png' );

			var material = new THREE.MeshPhongMaterial( { color: 0xffff00} );
			var carGeometry = new THREE.BoxGeometry(unit, unit, unit);
			var carMaterial = new THREE.MeshPhongMaterial( {  map: carTexture} );

			var multiMaterial = new THREE.MultiMaterial([material, material, carMaterial, material, material, material]);


			var carMesh = new THREE.Mesh(carGeometry, multiMaterial);
			carMesh.position.set(300, 100 ,0);
			carMesh.castShadow = true;
			//glScene.add( carMesh );

			var loader = new THREE.BinaryLoader();

			var f50 = createF50Model();
			loadFiles.loadNew(f50.url);

			loader.load(f50.url, function( geometry ) { 
				createF50(geometry, f50, {x: positionX, y: positionY}); 
				loadFiles.finishLoad(f50.url);
			} );
		}

		function render() {
				renderer.render( glScene, glCamera );
		}

		function animate() {
			    requestAnimationFrame( animate );
				render();		
				update();
		}
		function main() {
			init();

			//glCamera.lookAt(new THREE.Vector3( 0, 0, 0 ));
			
			initializeCharacter(1, 1);


			animate();
		}


		$(window.self).on("resize", resizeThrottler);

	    var resizeTimeout;
	    function resizeThrottler() {
	    	// ignore resize events as long as an actualResizeHandler execution is in the queue
	    	if ( !resizeTimeout ) {
	      		resizeTimeout = setTimeout(function() {
	        	resizeTimeout = null;
	        	actualResizeHandler();	     
	       		// The actualResizeHandler will execute at a rate of 15fps
	       		}, 20);
	    	}
	  	}

	    function actualResizeHandler() {

	    	var canvasWidth = rootContainer.width();
			var canvasHeight = canvasWidth*3/4;
	
			glCamera.aspect = canvasWidth / canvasHeight;
			glCamera.updateProjectionMatrix();
			var canvas = $('#' + canvasID);
			var canvasOverlay = canvas.next()[0];
			if (canvasOverlay) {
				$(canvasOverlay).width(canvasWidth);
				$(canvasOverlay).height(canvasHeight);

			}
			renderer.setSize( canvasWidth, canvasHeight );
	  	}
		main();
	}

	function createElement(x, y, elementName, element) {

		return false;
	}

	function moveForward(objectName, cb, time) {
		var element = boardObjects[objectName];
		if(element) {
			element.moveDirection(true, cb, time);
		} else {
			console.error('element ' + objectName + ' unfound');
			cb();
		}

	}
	function moveBackward(objectName, cb, time) {
		var element = boardObjects[objectName];
		if(element) {
			element.moveDirection(false, cb, time);
		} else {
			console.error('element ' + objectName + ' unfound');
			cb();
		}

	}
	function makeTurn(rightorLeft, objectName, cb, time) {
		var element = boardObjects[objectName];
		if(element) {
			element.makeTurn(rightorLeft, cb, time);
		} else {
			console.error('element ' + objectName + ' unfound');
			cb();
		}
	}

	function moveElementToPosition(newx, newy, objectName, cb, time) {
		var element = boardObjects[objectName];
		if(element) {
			element.moveToPosition({x:newx, y:newy}, cb, time);
		} else {
			console.error('element ' + objectName + ' unfound');
			cb();
		}
		
	}

	makeCanvas(canvasID, width, length, worldUnit);

	return {
		rootElement: rootDom,
		board: world,
		defaultCharacter: 'f50',
		createElementAtBoard: createElement,
		boardObjects: boardObjects,  
		MoveElementInsideBoard: moveElementToPosition,
		MoveElementForward: moveForward,
		MoveElementBackward: moveBackward,
		makeTurn: makeTurn
	}
}
