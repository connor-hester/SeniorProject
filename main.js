import './style.css';

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import * as ThreeMeshUI from "https://cdn.skypack.dev/three-mesh-ui";

import FontJSON from './RobotoMono-Italic-VariableFont_wght-msdf.json';
import FontImage from './RobotoMono-Italic-VariableFontwght.png';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { GUI } from 'dat.gui'

let scene, camera, renderer, controls;
let zDist, buttonCount, wall1, wall2, wall3, wall4, wall5, wall6, rules;
let vid1, vid2, vid3, vid4, vid5, vid6;
let vid1End, vid2End, vid3End, vid4End, vid5End, vid6End;
let isMoving= false;
let glassCase;
let fontMesh;
const objsToTest = [];
let model = new THREE.Object3D( );
let c, size;
let yRotation=3.21;
let star;
let xPosition=-1.5;
let zPosition=3.1;
let modelContainer= new Array();

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );

// compute mouse position in normalized device coordinates
// (-1 to +1) for both directions.
// Used to raycasting against the interactive elements

const raycaster = new THREE.Raycaster();

const mouse = new THREE.Vector2();
mouse.x = mouse.y = null;

let selectState = false;

window.addEventListener( 'pointermove', ( event ) => {
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'pointerdown', () => {
	selectState = true;
} );

window.addEventListener( 'pointerup', () => {
	selectState = false;
} );

window.addEventListener( 'touchstart', ( event ) => {
	selectState = true;
	mouse.x = ( event.touches[ 0 ].clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -( event.touches[ 0 ].clientY / window.innerHeight ) * 2 + 1;
} );

window.addEventListener( 'touchend', () => {
	selectState = false;
	mouse.x = null;
	mouse.y = null;
} );

//

function init() {

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Texture('');

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton( renderer ) );
	document.body.appendChild( renderer.domElement );

	// Orbit controls for no-vr

	//controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.3, 200 );
	//controls.target = new THREE.Vector3( 0, 1, 0 );

	////////
	//GUI
	////////

	const gui = new GUI()
	const cameraFolder = gui.addFolder('Camera');
	cameraFolder.add(camera.position, 'z', 23, 200).name('Move');
	cameraFolder.add(camera.position, 'z', 20,20).name('Video 1');
	cameraFolder.add(camera.position, 'z',17,17).name('Video 2');
	cameraFolder.add(camera.position, 'z',14,14).name('Video 3');
	cameraFolder.add(camera.position, 'z',11,11).name('Video 4');
	cameraFolder.add(camera.position, 'z',8,8).name('Video 5');
	cameraFolder.add(camera.position, 'z',5,5).name('Video 6');
	//cameraFolder.open()

	////////////
	//STARS
	////////////
	function addStar() {
		  const geometry = new THREE.SphereGeometry(0.15, 24, 24);
		  const material = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
			star = new THREE.Mesh(geometry, material);
		
		  const [x, y, z] = Array(3)
		    .fill()
		    .map(() => THREE.MathUtils.randFloatSpread(400));
		
		  star.position.set(x, y, z);
		  scene.add(star);
		}
		
		Array(1200).fill().forEach(addStar);
	//////////
	//TEXT
	//////////
	const fontLoader = new THREE.FontLoader()
	fontLoader.load( './sourceCodePro.json', function (font) {
		let text = 'impermanent'
		const fontGeometry = new THREE.TextGeometry(text, {
		   font: font,
		   size: 3,
		   height: 0.4,
		   curveSegments: 12,
		   bevelEnabled: true,
		   bevelOffset: 0,
		   bevelThickness: 0.5,
		   bevelSize: 0.3,
		   bevelSegments: 5
		})
		const fontMaterial = [
		   new THREE.MeshPhongMaterial({
			  color: 0xffffff,
		   flatShading: true
		   }), // front
		   new THREE.MeshPhongMaterial({
		   color: 0x000000
		   }) // side
		]
		fontMesh = new THREE.Mesh(fontGeometry, fontMaterial)
		fontGeometry.computeBoundingBox()
		fontGeometry.computeVertexNormals()
		fontGeometry.boundingBox.getCenter(fontMesh.position).multiplyScalar(-1)
		fontMesh.position.x = -fontGeometry.boundingBox.max.x / 2
		const parent = new THREE.Object3D()
		fontMesh.scale.set(3,3,3);
		fontMesh.position.set(-40,19,150);
		parent.add(fontMesh)
		scene.add(parent)
		}, undefined, function ( error ) {
		
			console.error( error );
		});
	
	// promisify font loading
	function loadFont(url) {
	   return new Promise((resolve, reject) => {
		  fontLoader.load(url, resolve, undefined, reject)
	   })
	}
		const font = loadFont('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json')
		
	//////////
	// Light
	//////////

	const hemLight = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF );

	scene.add( hemLight );

	/////////////
	//TEST STUFF
	/////////////
	var image = document.createElement( 'img' );
	image.src = './brain.png';
	
	var texture = new THREE.Texture( image );
	texture.needsUpdate = true;


	const geometry = new RoundedBoxGeometry(4.5,3.5,0.1,5,3);
	const material = new THREE.MeshStandardMaterial({ map:texture });
	wall1 = new THREE.Mesh(geometry, material);
	wall1.position.set(0,1.25,17);
	scene.add(wall1);
	wall2 = new THREE.Mesh(geometry, material);
	wall2.position.set(0,1.25,14);
	scene.add(wall2);
	wall3 = new THREE.Mesh(geometry, material);
	wall3.position.set(0,1.25,11);
	scene.add(wall3);
	wall4 = new THREE.Mesh(geometry, material);
	wall4.position.set(0,1.25,8);
	scene.add(wall4);
	wall5 = new THREE.Mesh(geometry, material);
	wall5.position.set(0,1.25,5);
	scene.add(wall5);
	wall6 = new THREE.Mesh(geometry, material);
	wall6.position.set(0,1.25,2);
	scene.add(wall6);

	const rulesGeo = new THREE.BoxGeometry(45,80,10,10,10,10);
	const rulesMat = new THREE.MeshStandardMaterial({color:0xFFFFFF});
	rules = new THREE.Mesh(rulesGeo,rulesMat);
	//scene.add(rules);
	rules.position.copy( camera.position );
	rules.updateMatrix();
	rules.translateZ( - 20 );
	rules.translateX(30);

	const glassCaseGeo=new RoundedBoxGeometry(55,55,55,7,6);
	const glassCaseMat=new THREE.MeshPhysicalMaterial({metalness: .9,
		metalness: 0.9,
		color:0xCCFFFF,
        roughness: 0.1,
        envMapIntensity: 0.9,
        clearcoat: 1,
        transparent: true,
        transmission: .95,
        opacity: 0.5,
        reflectivity: 0.4,
		});
	glassCase=new THREE.Mesh(glassCaseGeo,glassCaseMat);
	glassCase.position.set(-1,-3,20);
	scene.add(glassCase);
	// camera.add(rules);
	// rules.position.set(0,0,-10);

	////////
	//Video
	////////

	const video1 = document.getElementById( 'video1' );
	//vid1End=document.getElementById('video1').addEventListener('ended',proceedButton(18.05,1),false);
	const vid1Texture = new THREE.VideoTexture( video1 );
	vid1 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid1Texture }));
	vid1.position.set(0,1.24,17.1);
	scene.add(vid1);
	
	const video2 = document.getElementById( 'video2' );
	//vid2End=document.getElementById('video2').addEventListener('ended',proceedButton(15.05,2),false);
	const vid2Texture = new THREE.VideoTexture( video2 );
	vid2 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid2Texture }));
	vid2.position.set(0,1.24,14.1);
	scene.add(vid2);

	const video3 = document.getElementById( 'video3' );
	//vid3End=document.getElementById('video3').addEventListener('ended',proceedButton(12.05,3),false);
	const vid3Texture = new THREE.VideoTexture( video3 );
	vid3 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid3Texture }));
	vid3.position.set(0,1.24,11.1);
	scene.add(vid3);

	const video4 = document.getElementById( 'video4' );
	//vid4End=document.getElementById('video4').addEventListener('ended',proceedButton(9.05,4),false);
	const vid4Texture = new THREE.VideoTexture( video4 );
	vid4 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid4Texture }));
	vid4.position.set(0,1.24,8.1);
	scene.add(vid4);

	const video5 = document.getElementById( 'video5' );
	//vid5End=document.getElementById('video5').addEventListener('ended',proceedButton(6.05,5),false);
	const vid5Texture = new THREE.VideoTexture( video5 );
	vid5 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid5Texture }));
	vid5.position.set(0,1.24,5.1);
	scene.add(vid5);

	const video6 = document.getElementById( 'video6' );
	//vid6End=document.getElementById('video6').addEventListener('ended',proceedButton(3.05,6),false);
	const vid6Texture = new THREE.VideoTexture( video6 );
	vid6 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid6Texture }));
	vid6.position.set(0,1.24,2.1);
	scene.add(vid6);

	///////////////
	//MODEL LOADER
	///////////////
	
	const loader = new GLTFLoader();
	loader.load( 'models/blenderModel.gltf', process);

	loader.load( 'models/greek/scene.gltf', function ( gltf ) {

		scene.add( gltf.scene );
		  gltf.scene.position.set(0,-110,15);
		  gltf.scene.rotation.set(0,0.38,0);
		  gltf.asset;
		  gltf.scene.scale.set(165,80,165);
		  
		}, undefined, function ( error ) {
		
			console.error( error );
		});
		loader.load( 'models/case4.gltf', function ( gltf ) {

			scene.add( gltf.scene );
			  gltf.scene.position.set(0,-15,15);
			  gltf.asset;
			  gltf.scene.scale.set(30,30,30);
			  
			}, undefined, function ( error ) {
			
				console.error( error );
			});
	

	//////////
	// Panel
	//////////

	makePanel(18,2,1);
	makePanel(15,2,2);
	makePanel(12,2,3);
	makePanel(9,2,4);
	makePanel(6,2,5);
	makePanel(3,2,6);
	//makePanel(198.5,1);
	//makePanel(68,1);

	//

	animate();

}

///////////////
//PROCEED POPUP
///////////////
function proceedButton(x,video){
	makePanel(x,3,video);
}

//////////////////
//DELETE FUNCTION
//////////////////

function deleteFunction(obj) {
    scene.remove(obj);
    obj.geometry.dispose();
    obj.material.dispose();
    obj = undefined; //clear any reference for it to be able to garbage collected
}

///////////////////
// UI contruction
///////////////////

function makePanel(zDist,buttonCount,video) {

	// Container block, in which we put the two buttons.
	// We don't define width and height, it will be set automatically from the children's dimensions
	// Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

	const container = new ThreeMeshUI.Block( {
		justifyContent: 'center',
		contentDirection: 'row-reverse',
		fontFamily: FontJSON,
		fontTexture: FontImage,
		fontSize: 0.07,
		padding: 0.02,
		borderRadius: 0.11
	} );
	if(buttonCount==3){
		container.position.set(0,0.5,zDist);
	}
	else{
		container.position.set( 0, 0.7, zDist);
	}
	container.rotation.x = -0.55;
	scene.add( container );

	// BUTTONS

	// We start by creating objects containing options that we will use with the two buttons,
	// in order to write less code.

	const buttonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
	};

	// Options for component.setupState().
	// It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

	const hoveredStateAttributes = {
		state: 'hovered',
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x999999 ),
			backgroundOpacity: 1,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	const idleStateAttributes = {
		state: 'idle',
		attributes: {
			offset: 0.035,
			backgroundColor: new THREE.Color( 0x666666 ),
			backgroundOpacity: 0.3,
			fontColor: new THREE.Color( 0xffffff )
		},
	};

	// Buttons creation, with the options objects passed in parameters.
if(buttonCount==2){
	const buttonNext = new ThreeMeshUI.Block( buttonOptions );
	const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

	// Add text to buttons

	buttonNext.add(
		new ThreeMeshUI.Text( { content: 'play' } )
	);

	buttonPrevious.add(
		new ThreeMeshUI.Text( { content: 'pause' } )
	);

	// Create states for the buttons.
	// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonNext.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {
			if(video==1){
				video1.play();
			}
			else if (video==2){
				video2.play();
			}
			else if (video==3){
				video3.play();
			}
			else if (video==4){
				video4.play();
			}
			else if (video==5){
				video5.play();
			}
			else if (video==6){
				video6.play();
			}
		}
	} );
	buttonNext.setupState( hoveredStateAttributes );
	buttonNext.setupState( idleStateAttributes );

	//

	buttonPrevious.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {

			if(video==1){
				video1.pause();
			}
			else if (video==2){
				video2.pause();
			}
			else if (video==3){
				video3.pause();
			}
			else if (video==4){
				video4.pause();
			}
			else if (video==5){
				video5.pause();
			}
			else if (video==6){
				video6.pause();
			}
		}
	} );
	buttonPrevious.setupState( hoveredStateAttributes );
	buttonPrevious.setupState( idleStateAttributes );

	//

	container.add( buttonNext, buttonPrevious );
	objsToTest.push( buttonNext, buttonPrevious );
}
else if (buttonCount==1){
	const buttonEnter = new ThreeMeshUI.Block( buttonOptions );

	// Add text to buttons

	buttonEnter.add(
		new ThreeMeshUI.Text( { content: 'enter' } )
	);

	// Create states for the buttons.
	// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonEnter.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {

			//deleteFunction(wall);
			camera.position.z=20;

		}
	} );
	buttonEnter.setupState( hoveredStateAttributes );
	buttonEnter.setupState( idleStateAttributes );

	//

	container.add( buttonEnter );
	objsToTest.push(buttonEnter );
}
else if (buttonCount==3){
	const buttonEnter = new ThreeMeshUI.Block( buttonOptions );

	// Add text to buttons

	buttonEnter.add(
		new ThreeMeshUI.Text( { content: 'proceed' } )
	);

	// Create states for the buttons.
	// In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonEnter.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {
			//camera.position.z-=1.5;
			if(video==1){
				deleteFunction(vid1);
				camera.position.z=17;
			}
			else if (video==2){
				deleteFunction(vid2);
				camera.position.z=14;
			}
			else if (video==3){
				deleteFunction(vid3);
				camera.position.z=11;
			}
			else if (video==4){
				deleteFunction(vid4);
				camera.position.z=8;
			}
			else if (video==5){
				deleteFunction(vid5);
				camera.position.z=5;
			}
			else if (video==6){
				deleteFunction(vid6);
				camera.position.z=80;
			//vid1.position.y=-100;
			}
			
		}
	} );
	buttonEnter.setupState( hoveredStateAttributes );
	buttonEnter.setupState( idleStateAttributes );

	//

	container.add( buttonEnter );
	objsToTest.push(buttonEnter );
}
}

// Handle resizing the viewport

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	requestAnimationFrame(animate);
	// Don't forget, ThreeMeshUI must be updated manually.
	// This has been introduced in version 3.0.0 in order
	// to improve performance

	//controls.update();
	if(camera.position.z<150 && camera.position.z>100){
		glassCase.position.y+=0.5;
	}
	if (camera.position.z>150){
		glassCase.position.y=-3;
	}
	if(camera.position.z>80){
	yRotation+=0.005;
	isMoving=false;
	move(model);
	}
	else{
		yRotation=3.2;
		move(model);
	}
	//fontMesh.rotation.x+=0.005;
	//fontMesh.rotation.z+=0.005;
	//star.rotation.y+=0.01;
	//modelContainer[0].scene.rotation.y+=0.1;
	updateButtons();
	ThreeMeshUI.update();
	renderer.render( scene, camera );

	//rules.position.copy( camera.position );
	//rules.updateMatrix();
}

function process( gltf ) {	
		
	const box = new THREE.Box3( ).setFromObject( gltf.scene );		 
	const boxHelper = new THREE.Box3Helper( box, 0xffff00 );
    scene.add( boxHelper );
	
	c = box.getCenter( new THREE.Vector3( ) );
	size = box.getSize( new THREE.Vector3( ) );
	
	move( gltf );
	gltf.scene.scale.set(120,120,120);
	scene.add( gltf.scene );
	
	model = gltf;

}

function move( gltf) {
	gltf.scene.rotation.set( 0, yRotation, 0 );
	
	// rotate center
	const cz = c.z * Math.cos( yRotation ) - c.x * Math.sin( yRotation );
	const cx = c.z * Math.sin( yRotation ) + c.x * Math.cos( yRotation );
	
	gltf.scene.position.set( xPosition - cx+2, size.y / 2 - c.y-205, zPosition - cz+10 );

}


// Called in the loop, get intersection with either the mouse or the VR controllers,
// then update the buttons states according to result

function updateButtons() {

	// Find closest intersecting object

	let intersect;

	if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast();

	}

	// Update targeted button state (if any)

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'selected' );

		} else {

			// Component.setState internally call component.set with the options you defined in component.setupState
			intersect.object.setState( 'hovered' );

		}

	}

	// Update non-targeted buttons state

	objsToTest.forEach( ( obj ) => {

		if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {

			// Component.setState internally call component.set with the options you defined in component.setupState
			obj.setState( 'idle' );

		}

	} );

}

//

function raycast() {

	return objsToTest.reduce( ( closestIntersection, obj ) => {

		const intersection = raycaster.intersectObject( obj, true );

		if ( !intersection[ 0 ] ) return closestIntersection;

		if ( !closestIntersection || intersection[ 0 ].distance < closestIntersection.distance ) {

			intersection[ 0 ].object = obj;

			return intersection[ 0 ];

		}

		return closestIntersection;

	}, null );

}

//////////////////
//ANIMATION LOOP
//////////////////
// function animate() {

// 					requestAnimationFrame( animate );
	
// 					controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true
	
// 					ThreeMeshUI.update();
	
// 					render();
	
// 				}
	
// 				function render() {
	
// 					renderer.render( scene, camera );
	
// 				}


// import * as THREE from 'three';
// //import { OrbitControls } from '@/node_modules/three/examples/jsm/controls/OrbitControls';
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import * as ThreeMeshUI from "https://cdn.skypack.dev/three-mesh-ui";
// import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
// import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry.js';
// import VRControl from './utils/VRControl.js';
// import ShadowedLight from './utils/ShadowedLight.js';

// import FontJSON from './assets/Roboto-msdf.json';
// import FontImage from './assets/Roboto-msdf.png';



// // Setup


// //import * as THREE from 'three';

// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// 			let camera, controls, scene, renderer;

// 			init();
// 			//render(); // remove when using next line for animation loop (requestAnimationFrame)
// 			animate();

// 			function init() {
// 				scene = new THREE.Scene();
// 				scene.background = new THREE.Color( 0xcccccc );
// 				//scene.fog = new THREE.FogExp2( 0xcccccc, 0.002 );

// 				renderer = new THREE.WebGLRenderer( { antialias: true } );
// 				renderer.setPixelRatio( window.devicePixelRatio );
// 				renderer.setSize( window.innerWidth, window.innerHeight );
// 				document.body.appendChild( renderer.domElement );

// 				camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
// 				camera.position.set( 0, 10, -200 );

// 				// controls

// 				controls = new OrbitControls( camera, renderer.domElement );
// 				controls.listenToKeyEvents( window ); // optional

// 				//controls.addEventListener( 'change', render ); // call this only in static scenes (i.e., if there is no animation loop)

// 				controls.enableDamping = false; // an animation loop is required when either damping or auto-rotation are enabled

// 				controls.screenSpacePanning = false;

// 				// controls.minDistance = 10;
// 				// controls.maxDistance = 2000;

// 				controls.maxPolarAngle = Math.PI / 2;

// 				controls.mouseButtons = {
// 					LEFT: THREE.MOUSE.ROTATE,
// 					MIDDLE: THREE.MOUSE.DOLLY*50,
// 					RIGHT: THREE.MOUSE.PAN
// 				}

// 				// world

// 				const geometry = new THREE.CylinderGeometry( 0, 10, 30, 4, 1 );
// 				const material = new THREE.MeshPhongMaterial( { color: 0xffffff, flatShading: true } );

// 				for ( let i = 0; i < 500; i ++ ) {

// 					const mesh = new THREE.Mesh( geometry, material );
// 					mesh.position.x = Math.random() * 1600 - 800;
// 					mesh.position.y = 0;
// 					mesh.position.z = Math.random() * 1600 - 800;
// 					mesh.updateMatrix();
// 					mesh.matrixAutoUpdate = false;
// 					scene.add( mesh );

// 				}

// 				// lights

// 				const dirLight1 = new THREE.DirectionalLight( 0xffffff );
// 				dirLight1.position.set( 1, 1, 1 );
// 				scene.add( dirLight1 );

// 				const dirLight2 = new THREE.DirectionalLight( 0x002288 );
// 				dirLight2.position.set( - 1, - 1, - 1 );
// 				scene.add( dirLight2 );

// 				const ambientLight = new THREE.AmbientLight( 0x222222 );
// 				scene.add( ambientLight );

// 				//

// 				window.addEventListener( 'resize', onWindowResize );


// 			}

// 			function onWindowResize() {

// 				camera.aspect = window.innerWidth / window.innerHeight;
// 				camera.updateProjectionMatrix();

// 				renderer.setSize( window.innerWidth, window.innerHeight );

// 			}

// 			function animate() {

// 				requestAnimationFrame( animate );

// 				controls.update(); // only required if controls.enableDamping = true, or if controls.autoRotate = true

// 				ThreeMeshUI.update();

// 				render();

// 			}

// 			function render() {

// 				renderer.render( scene, camera );

// 			}












// const modelStorage=Array();
// let canScroll=true;
// let controls 

// const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);

// const renderer = new THREE.WebGLRenderer
// document.body.appendChild( renderer.domElement );

// renderer.setPixelRatio(window.devicePixelRatio);
// renderer.setSize(window.innerWidth, window.innerHeight);

// controls = new OrbitControls(camera, renderer.domElement);
// controls.autorotate=true;
// // scene.add(controls);

// //camera.position.setZ(30);
// camera.position.setX(-3);
// controls.update();

// renderer.render(scene, camera);

// const startButton = document.getElementById( 'startButton' );
// 			startButton.addEventListener( 'click', function () {
//       //disableScroll();
// 		playVideo1();
//     console.log(camera.position.x);
//     console.log(camera.position.y);
//     console.log(camera.position.z);

// 			}, false );

// const startButton2=document.getElementById('startButton2');
//       startButton2.addEventListener('click', function(){
//         playVideo2();},false);


//         const startButton3=document.getElementById('startButton3');
//         startButton3.addEventListener('click', function(){
//           playVideo3();},false);
          
// // document.getElementById('video1').addEventListener('ended',enableScroll,false);
// //   function enableScroll(){
// //     window.onScroll=function(){};
// //   }

// // Lights

// const pointLight = new THREE.PointLight(0xffffff);
// pointLight.position.set(5, 5, 5);

// const pointLight2= new THREE.PointLight(0xffffff);
// pointLight2.position.set(0,2,15);

// const ambientLight = new THREE.AmbientLight(0xffffff);
// scene.add(pointLight, ambientLight, pointLight2);

// // Helpers

// //const lightHelper = new THREE.PointLightHelper(pointLight)
// //const gridHelper = new THREE.GridHelper(200, 50);
// //scene.add(lightHelper, gridHelper)


// //Models
// const loader = new GLTFLoader();

// loader.load( 'models/CRTTVMODEL.gltf', function ( gltf ) {

// 	scene.add( gltf.scene );
//   gltf.scene.rotation.y=4.625;
//   gltf.scene.position.x=-2.6;
//   gltf.scene.position.y=-2.6;
//   gltf.scene.position.z=12.85;
//   gltf.asset;
//   //gltf.scene.scale(10,10);
//   modelStorage.push(gltf.scene);
  
// }, undefined, function ( error ) {

// 	console.error( error );

// });

// loader.load( 'models/CRTTVMODEL.gltf', function ( gltf ) {

// 	scene.add( gltf.scene );
//   gltf.scene.rotation.y=4.6;
//   gltf.scene.position.x=-3.4;
//   gltf.scene.position.y=-2.6;
//   gltf.scene.position.z=21;
//   gltf.asset;
//   //gltf.scene.scale(10,10);
//   modelStorage.push(gltf.scene);
  
// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// loader.load( 'models/CRTTVMODEL.gltf', function ( gltf ) {

// 	scene.add( gltf.scene );
//   gltf.scene.rotation.y=4.6;
//   gltf.scene.position.x=-3.4;
//   gltf.scene.position.y=-2.6;
//   gltf.scene.position.z=29;
//   gltf.asset;
//   //gltf.scene.scale(10,10);
//   modelStorage.push(gltf.scene);
  
// }, undefined, function ( error ) {

// 	console.error( error );

// } );


  

// loader.load( 'models/faceModels.gltf', function ( gltf ) {

// 	scene.add( gltf.scene );
//   gltf.scene.rotation.y=4.6;
//   //gltf.scene.rotation.x=0.5;
//   gltf.scene.rotation.z=-0.6;
//   gltf.scene.position.x=-3.6;
//   gltf.scene.position.y=-2.7;
//   gltf.scene.position.z=14;
//   gltf.asset;
//   //gltf.scene.scale(10,10);
//   modelStorage.push(gltf.scene);

// }, undefined, function ( error ) {

// 	console.error( error );

// } );

// //Video
// const video1 = document.getElementById( 'video1' );
// const vidTexture = new THREE.VideoTexture( video1 );
// const vid1 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vidTexture }));
// vid1.position.x=-2.75;
// vid1.position.y=-0.1;
// vid1.position.z=14.72;
// vid1.rotation.y=6.2;
// //vid1.rotation.y=modelStorage[1].asset.rotation.y;
// scene.add(vid1);

// const video2=document.getElementById('video2');
// const vid2Texture=new THREE.VideoTexture(video2);
// const vid2= new THREE.Mesh(new THREE.BoxGeometry(4,2.5,0.1),new THREE.MeshBasicMaterial({map: vid2Texture}));
// vid2.position.x=-3.5;
// vid2.position.y=0.15;
// vid2.position.z=22.95;
// vid2.rotation.y=6.18;
// vid2.rotation.z=-0.001;
// scene.add(vid2);


// const video3=document.getElementById('video3');
// const vid3Texture=new THREE.VideoTexture(video3);
// const vid3= new THREE.Mesh(new THREE.BoxGeometry(4,2.5,0.1),new THREE.MeshBasicMaterial({map: vid3Texture}));
// vid3.position.x=-3.5;
// vid3.position.y=0.15;
// vid3.position.z=31;
// vid3.rotation.y=6.18;
// vid3.rotation.z=-0.001;
// scene.add(vid3);

// function addStar() {
//   const geometry = new THREE.SphereGeometry(0.15, 24, 24);
//   const material = new THREE.MeshStandardMaterial({ color: 0x000000 });
//   const star = new THREE.Mesh(geometry, material);

//   const [x, y, z] = Array(3)
//     .fill()
//     .map(() => THREE.MathUtils.randFloatSpread(100));

//   star.position.set(x, y, z);
//   scene.add(star);
// }

// Array(200).fill().forEach(addStar);

// // Background

// const spaceTexture = new THREE.TextureLoader().load('sceneBackground.jpeg');
// scene.background = spaceTexture;


// function playVideo1(){
//   video1.play();
//   //canScroll=false;
//   //console.log("canScroll=false")
//   const overlay = document.getElementById( 'overlay' );
// 				overlay.remove();
// }

// function playVideo2(){
//   video2.play();
//   //canScroll=false;
//   //console.log("canScroll=false")
//   const overlay2 = document.getElementById( 'overlay2' );
// 				overlay2.remove();
// }

// function playVideo3(){
//   video3.play();
//   //canScroll=false;
//   //console.log("canScroll=false")
//   const overlay3 = document.getElementById( 'overlay3' );
// 				overlay3.remove();
// }

// // function disableScroll(){
// //   let scrollTop=window.pageYOffset||document.documentElement.scrollTop;
// //   let scrollLeft=window.pageXOffset||document.documentElement.scrollLeft;
// //     window.onScroll=function(){
// //      window.scrollTo(scrollLeft,scrollTop);
// //      console.log("success");
// //   }
// // }



// // Scroll Animation

// function moveCamera() {
//   const t = document.body.getBoundingClientRect().top;

//     camera.position.z = t * -0.01;
  
//   // if(camera.position.z>10 && camera.position.z<17){
//   //   camera.position.y+=0.025;
//   // }
//   //camera.position.x = t * -0.0002;
//   //camera.rotation.y = t * -0.0002;
// }

// document.body.onscroll = moveCamera;
// moveCamera();

// // Animation Loop

// function animate() {
//   requestAnimationFrame(animate);
//   // torus.rotation.x += 0.01;
//   // torus.rotation.y += 0.005;
//   // torus.rotation.z += 0.01;
//   //video1.update()

//   //moon.rotation.x += 0.005;
  
//    controls.update();
   
//   renderer.render(scene, camera);
// }

// animate();
