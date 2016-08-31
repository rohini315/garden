var camera, scene, renderer;
var geometry, material, mesh;
var controls;
var objects = [];
var raycaster;
var blocker = document.getElementById( 'blocker' );
var intro = document.getElementById("intro");
var instructions = document.getElementById('intro');


// First Person Controls
var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
    if ( havePointerLock ) {
        var element = document.body;
        var pointerlockchange = function ( event ) {
            if ( document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element ){
                controlsEnabled = true;
                controls.enabled = true;
                blocker.style.display = 'none';
            } 

            else {
                controls.enabled = false;
                blocker.style.display = '-webkit-box';
                blocker.style.display = '-moz-box';
                blocker.style.display = 'box';
                instructions.style.display = '';
            } 
        }; // end of pointlockchange

        var pointerlockerror = function ( event ) {
            instructions.style.display = '';
        };

        // PointerLock Settings for Different Browsers
        document.addEventListener( 'pointerlockchange', pointerlockchange, false );
        document.addEventListener( 'mozpointerlockchange', pointerlockchange, false );
        document.addEventListener( 'webkitpointerlockchange', pointerlockchange, false );

        document.addEventListener( 'pointerlockerror', pointerlockerror, false );
        document.addEventListener( 'mozpointerlockerror', pointerlockerror, false );
        document.addEventListener( 'webkitpointerlockerror', pointerlockerror, false );

        instructions.addEventListener( 'click', function ( event ) {

            instructions.style.display = 'none';

            // Locking the Pointer
            element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;
        
            if ( /Firefox/i.test( navigator.userAgent ) ) {
                var fullscreenchange = function ( event ) {
                    if ( document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element ) {
                        document.removeEventListener( 'fullscreenchange', fullscreenchange );
                        document.removeEventListener( 'mozfullscreenchange', fullscreenchange );
                        element.requestPointerLock();
                    }
                }; // end of fullscreenchange

                document.addEventListener( 'fullscreenchange', fullscreenchange, false );
                document.addEventListener( 'mozfullscreenchange', fullscreenchange, false );
                element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;
                element.requestFullscreen();
            } 

            else {
                element.requestPointerLock();
            }
        }, false ); 

    } 


    // Establishing the Scene
    init();
    animate();
    var controlsEnabled = false;
    var moveForward = false;
    var moveBackward = false;
    var moveLeft = false;
    var moveRight = false;
    var canJump = false;
    var prevTime = performance.now();
    var velocity = new THREE.Vector3();


    function init() {
        camera = new THREE.PerspectiveCamera( 30, window.innerWidth / window.innerHeight, 3, 10000 );
            camera.position.x = 0;
            camera.position.y = 0;
            camera.position.z = 0;

            scene = new THREE.Scene();
            var light = new THREE.HemisphereLight( 0xeeeeff, 0x777788, 0.75 );
            light.position.set( 0.5, 1, 0.75 );
            scene.add( light );
            controls = new THREE.PointerLockControls( camera );
            scene.add(controls.getObject());   

        var onKeyDown = function ( event ) {
            switch ( event.keyCode ) {
            case 38: // up
            moveForward = true;
            break;

            case 37: // left
            moveLeft = true; break;

            case 40: // down
            moveBackward = true;
            break;

            case 39: // right
            moveRight = true;
            break;

            case 32: // space
            if ( canJump === true ) velocity.y += 350;
            canJump = false;
            break;
            }
        };

        var onKeyUp = function ( event ) {

        switch( event.keyCode ) {
            case 38: // up

            moveForward = false;
            break;

            case 37: // left

            moveLeft = false;
            break;

            case 40: // down
           
            moveBackward = false;
            break;

            case 39: // right
            moveRight = false;
            break;

            }
        };

        document.addEventListener( 'keydown', onKeyDown, false );
        document.addEventListener( 'keyup', onKeyUp, false );

        raycaster = new THREE.Raycaster( new THREE.Vector3(), new THREE.Vector3( 0, - 1, 0 ), 0, 10 );
    
        // ground
        var loader = new THREE.TextureLoader();
        var groundTexture = loader.load( 'js/examples/textures/terrain/grass.jpg' );
        groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set( 25, 25 );
        groundTexture.anisotropy = 16;

        var groundMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x111111, map: groundTexture } );
        var mesh = new THREE.Mesh( new THREE.PlaneBufferGeometry( 1700, 7500 ), groundMaterial );
        mesh.position.y = -100;
        mesh.rotation.x = - Math.PI / 2;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // Garden Elements JSONfiles
        garden = new THREE.JSONLoader();
        garden.load("models/justgardenjoin3.json",addGarden);
    
        boc = new THREE.JSONLoader();
        boc.load("models/boc1.json",addSculp);

        ganesh = new THREE.JSONLoader();
        ganesh.load("models/ganesha.json",addSculp);

        sword = new THREE.JSONLoader();
        sword.load("models/sword2.json",addSculp);

        head = new THREE.JSONLoader();
        head.load("models/head2.json",addSculp);

        buddha = new THREE.JSONLoader();
        buddha.load("models/buddha2.json",addSculp);

        torso = new THREE.JSONLoader();
        torso.load("models/torso2.json",addSculp);

        flower = new THREE.JSONLoader();
        flower.load("models/flowers.json",addSculp);

        flowers2 = new THREE.JSONLoader();
        flowers2.load("models/flower2.json",addSculp);


        // Renderer
        renderer = new THREE.WebGLRenderer();
        renderer.setClearColor( 0xADD8E6);
        renderer.setPixelRatio( window.devicePixelRatio );
        renderer.setSize( window.innerWidth, window.innerHeight );
        document.body.appendChild( renderer.domElement );
        window.addEventListener( 'resize', onWindowResize, false );

    }

    function addGarden(geometry,materials){
        var material= new THREE.MeshFaceMaterial(materials);
        model= new THREE.Mesh(geometry,material);
        model.position.set(20,-100,-2000);
        model.scale.set(100,100,100);
        model.rotateY((3*Math.PI)/2);
        scene.add(model);
    } 

      function addSculp(geometry,materials){
        var material= new THREE.MeshFaceMaterial(materials);
        model= new THREE.Mesh(geometry,material);
        model.position.set(20,-100,-2000);
        model.scale.set(100,100,100);
        model.rotateY((3*Math.PI)/2); 
        scene.add(model);
    } 



        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize( window.innerWidth, window.innerHeight );
        }

        function animate() {
            requestAnimationFrame( animate );
            if(controlsEnabled) {
                raycaster.ray.origin.copy( controls.getObject().position );
                raycaster.ray.origin.y -= 10;
                var intersections = raycaster.intersectObjects( objects );
                var isOnObject = intersections.length > 0;
                var time = performance.now();
                var delta = ( time - prevTime ) / 1000;
                velocity.x -= velocity.x * 10.0 * delta;
                velocity.z -= velocity.z * 10.0 * delta;
                velocity.y -= 9.8 * 100.0 * delta; 

            if (moveForward) velocity.z -= 3000.0 * delta;
            if (moveBackward) velocity.z += 3000.0 * delta;
            if (moveLeft) velocity.x -= 3000.0 * delta;
            if (moveRight) velocity.x += 3000.0 * delta;

            if (isOnObject === true) {
                velocity.y = Math.max( 0, velocity.y );
                canJump = true;
            }

            controls.getObject().translateX( velocity.x * delta );
            controls.getObject().translateY( velocity.y * delta );
            controls.getObject().translateZ( velocity.z * delta );

            if (controls.getObject().position.y < 10) {
                velocity.y = 0;
                controls.getObject().position.y = 10;
                canJump = true;
            }

            prevTime = time;
        }

            renderer.render( scene, camera );
    }



