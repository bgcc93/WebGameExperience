var controls;
var scene	= new THREE.Scene();
var renderer	= new THREE.WebGLRenderer();
var camera	= new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, .01, 500 );
var velocity = new THREE.Vector3();
var planeSize = 6;
var corridorSize = 8;
var wallHeigth = 9;
var wallLength = 10;

var reached = false;
var controlsEnabled = false;
var moveForward = false;
var moveBackward = false;
var moveLeft = false;
var moveRight = false;
var videoMaterials = [];
var videoUrls = GetVideos();
var videoTextures = []
var onRenderFcts = [];
var planeTvs = [];
var havePointerLock = checkForPointerLock();
var geometry	= new THREE.PlaneGeometry(planeSize,planeSize,1);

videoUrls.forEach(function(videoUrl){
	// create the videoTexture
	var videoTexture = new THREEx.VideoTexture(videoUrl);
	videoTextures.push(videoTexture);
	
	onRenderFcts.push(function(delta, now){
		videoTexture.update(delta, now)
	})
	
	videoMaterials.push(new THREE.MeshBasicMaterial({
		map	: videoTexture.texture
	}));
})

var onKeyDown = function ( event ) {

	switch ( event.keyCode ) {
		case 38: // up
		case 87: // w
			moveForward = true;
			break;
		case 37: // left
		case 65: // a
			moveLeft = true; break;
		case 40: // down
		case 83: // s
			moveBackward = true;
			break;
		case 39: // right
		case 68: // d
			moveRight = true;
			break;
	}
}

var onKeyUp = function ( event ) {

	switch( event.keyCode ) {
		case 38: // up
		case 87: // w
			moveForward = false;
			break;
		case 37: // left
		case 65: // a
			moveLeft = false;
			break;
		case 40: // down
		case 83: // s
			moveBackward = false;
			break;
		case 39: // right
		case 68: // d
			moveRight = false;
			break;
	}
}

function checkForPointerLock() {
  return 'pointerLockElement' in document || 
         'mozPointerLockElement' in document || 
         'webkitPointerLockElement' in document;
}   

function initPointerLock() {
  var element = document.body;
	  if (havePointerLock) {
	    var pointerlockchange = function (event) {
	      if (document.pointerLockElement === element ||
	          document.mozPointerLockElement === element ||
	          document.webkitPointerLockElement === element) {
	        controlsEnabled = true;
	        controls.enabled = true;
	      } else {
	        controlsEnabled = false;
	        controls.enabled = false;
	      }
	    };

	    var pointerlockerror = function (event) {
	      element.innerHTML = 'PointerLock Error';
	    };

	    document.addEventListener('pointerlockchange', pointerlockchange, false);
	    document.addEventListener('mozpointerlockchange', pointerlockchange, false);
	    document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

	    document.addEventListener('pointerlockerror', pointerlockerror, false);
	    document.addEventListener('mozpointerlockerror', pointerlockerror, false);
	    document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

	    var requestPointerLock = function(event) {
	      element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
	      element.requestPointerLock();
	    };
	    element.addEventListener('click', requestPointerLock, false);
	  } else {
	    element.innerHTML = 'Bad browser; No pointer lock';
	  }
}

function checkForPointerLock() {
    return 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
}

function addControls() {
    controls = new THREE.PointerLockControls( camera );
    scene.add( controls.getObject() );
    
    //initPointerLock();
}

function FinishIt(){	
	setTimeout(function() {
		$('#overlay').animate({
       		opacity: 1,
	     }, 5000, function() {
	        window.location = "end.html";
	     });	
	}, 4500);
}

function CreateWall(side = -1){
	for(var i = -wallHeigth; i < wallHeigth; i++){
		for(var j = -wallLength + 3; j < wallLength*2.2; j++){
			for(var k = .7; k < 3; k++){
				var mesh	= new THREE.Mesh( geometry, videoMaterials[Math.floor(Math.random()*videoMaterials.length)] );
				scene.add( mesh );
				mesh.material.side = THREE.DoubleSide;
				mesh.rotateY(side * (Math.PI / 2));
				mesh.position = new THREE.Vector3( side * -corridorSize * k * 1.7, i * (planeSize + 1), (j * -(planeSize + 1)));
				
				planeTvs.push(mesh);
			}
		}
	}
}


renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById("threeD").appendChild( renderer.domElement );

addControls();

// create the webcamTexture	
var webcamTexture	= new THREEx.WebcamTexture()
	onRenderFcts.push(function(delta, now){
		webcamTexture.update(delta, now)
})

var material = new THREE.MeshBasicMaterial({
	map	: webcamTexture.texture,
});	

var youGeometry	= new THREE.PlaneGeometry(planeSize*2,planeSize*2,4);
var you = new THREE.Mesh( youGeometry, material);
scene.add( you );
you.position = new THREE.Vector3( 0, 0, -110 );

CreateWall();
CreateWall(1);


//Add controls
onRenderFcts.push(function(delta, now){
	velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;

    var velAmount = 150;

    if ( moveForward ) velocity.z -= velAmount * delta;
    if ( moveBackward ) velocity.z += velAmount * delta;

    if ( moveLeft ) velocity.x -= velAmount * delta;
    if ( moveRight ) velocity.x += velAmount * delta;

    controls.getObject().translateX( velocity.x * delta );
    controls.getObject().translateY( velocity.y * delta );
    controls.getObject().translateZ( velocity.z * delta );

    if(controls.getObject().position.x >= corridorSize - 1) controls.getObject().position.x = corridorSize - 1;
    if(controls.getObject().position.x <= -corridorSize + 1) controls.getObject().position.x = -corridorSize + 1;
    if(controls.getObject().position.z >= 0) controls.getObject().position.z = 0;
    if(controls.getObject().position.z <= -105) controls.getObject().position.z = -105;
    if(controls.getObject().position.z <= -95) {reached = true; FinishIt();}
})

onRenderFcts.push(function(delta, now){
	 planeTvs.forEach(function(tv){
	 	if (!reached ){
		 	var factor = Math.sin(now) * (controls.getObject().position.z * .3	) * .4 * Math.random();

		 	tv.position.z += delta * factor;
		 	tv.position.y += delta * factor;
		 	tv.position.x += delta * factor * (tv.position.x / 15);

		 }else{
		 	tv.material = material; 
		 	tv.lookAt(controls.getObject().position)
		 }
	 });
})

//////////////////////////////////////////////////////////////////////////////////
//		render the whole thing on the page
//////////////////////////////////////////////////////////////////////////////////

// handle window resize
window.addEventListener('resize', function(){
	renderer.setSize( window.innerWidth, window.innerHeight )
	camera.aspect	= window.innerWidth / window.innerHeight
	camera.updateProjectionMatrix()}, false)
document.addEventListener( 'keydown', onKeyDown, false );
document.addEventListener( 'keyup', onKeyUp, false );

renderer.setClearColor( 0x101010 );
scene.fog = new THREE.FogExp2( 0x101010, 0.038 );

// render the scene
onRenderFcts.push(function(){
	renderer.render( scene, camera );
})

// run the rendering loop
var lastTimeMsec= null
requestAnimationFrame(function animate(nowMsec){
	// keep looping
	requestAnimationFrame( animate );
	// measure time
	lastTimeMsec	= lastTimeMsec || nowMsec-1000/60
	var deltaMsec	= Math.min(200, nowMsec - lastTimeMsec)
	lastTimeMsec	= nowMsec
	// call each update function
	onRenderFcts.forEach(function(onRenderFct){
		onRenderFct(deltaMsec/1000, nowMsec/1000)
	})
})