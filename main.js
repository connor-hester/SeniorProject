import './style.css';

import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import * as ThreeMeshUI from "https://cdn.skypack.dev/three-mesh-ui";

import FontJSON from './fonts/instrumentMsdf.json';
import FontImage from './fonts/instrument.png';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

import { GUI } from 'dat.gui'

let scene, camera, renderer, controls;
let zDist, buttonCount, wall1, wall2, wall3, wall4, wall5, wall6, rules;
let vid1, vid2, vid3, vid4, vid5, vid6;
let modelStand;
let isMoving=false;
let glassCase;
let fontMesh1,fontMesh2;
const objsToTest = [];
let model = new THREE.Object3D( );
let c, size;
let yRotation=3.21;
let star;
let xPosition=-1.5;
let zPosition=3.1;

window.addEventListener( 'load', init );
window.addEventListener( 'resize', onWindowResize );

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

function init() {

	////////////////////////
	//  Basic Three Setup
	////////////////////////

	scene = new THREE.Scene();
	scene.background = new THREE.Texture('');
	scene. fog = new THREE. Fog( 0xffffff, 0.015, 250 );

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.setPixelRatio( window.devicePixelRatio );
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	document.body.appendChild( VRButton.createButton( renderer ) );
	document.body.appendChild( renderer.domElement );

	//controls = new OrbitControls( camera, renderer.domElement );
	camera.position.set( 0, 1.3, 200 );
	//controls.target = new THREE.Vector3( 0, 1, 0 );

	////////
	//GUI
	////////

	const gui = new GUI()
	const first = gui.addFolder('I');
	first.add(camera.position, 'z', 19.25, 200).name('insecurity');
	const second  = gui.addFolder('II');
	second.add(camera.position,'z',16.25,19.25).name('innocence');
	const third  = gui.addFolder('III');
	third.add(camera.position,'z',13.25,16.25).name('self-loathing');
	const fourth  = gui.addFolder('IV');
	fourth.add(camera.position,'z',10.25,13.25).name('willpower');
	const fifth  = gui.addFolder('V');
	fifth.add(camera.position,'z',7.25,10.25).name('shame');
	const sixth  = gui.addFolder('VI');
	sixth.add(camera.position,'z',4.25,7.25).name('everything');

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
		
		Array(2000).fill().forEach(addStar);

	//////////
	//TEXT
	//////////

	const fontLoader = new THREE.FontLoader()
	fontLoader.load( './fonts/instrument.json', function (font) {
		let text1 = 'impermanent'
		const fontGeometry1 = new THREE.TextGeometry(text1, {
		   font: font,
		   size: 3,
		   height: 0.4,
		   curveSegments: 12,
		   bevelEnabled: true,
		   bevelOffset: 0,
		   bevelThickness: 0.1,
		   bevelSize: 0.3,
		   bevelSegments: 5
		})
		let text2 = 'created by connor hester'
		const fontGeometry2 = new THREE.TextGeometry(text2, {
		   font: font,
		   size: 3,
		   height: 0.4,
		   curveSegments: 12,
		   bevelEnabled: true,
		   bevelOffset: 0,
		   bevelThickness: 0.1,
		   bevelSize: 0.3,
		   bevelSegments: 5
		})
		const fontMaterial = [
		   new THREE.MeshPhongMaterial({
			  color: 0x330404,
		   flatShading: true
		   }), // front
		   //new THREE.MeshPhongMaterial({
		   //color: 0x000000
		   //}) // side
		]
		fontMesh1 = new THREE.Mesh(fontGeometry1, fontMaterial)
		fontGeometry1.computeBoundingBox()
		fontGeometry1.computeVertexNormals()
		fontGeometry1.boundingBox.getCenter(fontMesh1.position).multiplyScalar(-1)
		fontMesh1.position.x = -fontGeometry1.boundingBox.max.x / 2
		fontMesh2 = new THREE.Mesh(fontGeometry2, fontMaterial)
		fontGeometry2.computeBoundingBox()
		fontGeometry2.computeVertexNormals()
		fontGeometry2.boundingBox.getCenter(fontMesh2.position).multiplyScalar(-1)
		fontMesh2.position.x = -fontGeometry2.boundingBox.max.x / 2
		const parent = new THREE.Object3D()
		fontMesh1.scale.set(3,3,3);
		fontMesh1.position.set(-30,19,150);
		fontMesh2.scale.set(1.5,1.5,1.5);
		fontMesh2.position.set(-26,17,125);
		parent.add(fontMesh1)
		parent.add(fontMesh2);
		scene.add(parent)
		}, undefined, function ( error ) {
		
			console.error( error );
		});

	//////////
	// Light
	//////////

	const hemLight = new THREE.HemisphereLight( 0xFFFFFF, 0xFFFFFF );

	scene.add( hemLight );

	const spotLight = new THREE.SpotLight(0xE0E0E0,0.2);
	spotLight.position.set( 0, 30, 20 );
	spotLight.map = new THREE.TextureLoader().load( "/images/perlin.png" );

	spotLight.castShadow = true;

	spotLight.shadow.mapSize.width = 1024;
	spotLight.shadow.mapSize.height = 1024;

	spotLight.shadow.camera.near = 500;
	spotLight.shadow.camera.far = 4000;
	spotLight.shadow.camera.fov = 30;

	scene.add( spotLight );
	const targetObject=new THREE.Object3D();
	targetObject.position.set(-1,-3,-20);
	scene.add(targetObject);
	spotLight.target=targetObject;

	/////////////
	//OBJECTS
	/////////////

	var image = document.createElement( 'img' );
	image.src = '/images/brain.png';
	
	var texture = new THREE.Texture( image );
	texture.needsUpdate = true;

	const geometry = new RoundedBoxGeometry(5,4,1,5,3);
	const material = new THREE.MeshStandardMaterial({ map:texture });
	wall1 = new THREE.Mesh(geometry, material);
	wall1.position.set(0,1.25,16.65);
	scene.add(wall1);
	wall2 = new THREE.Mesh(geometry, material);
	wall2.position.set(0,1.25,13.65);
	scene.add(wall2);
	wall3 = new THREE.Mesh(geometry, material);
	wall3.position.set(0,1.25,10.65);
	scene.add(wall3);
	wall4 = new THREE.Mesh(geometry, material);
	wall4.position.set(0,1.25,7.65);
	scene.add(wall4);
	wall5 = new THREE.Mesh(geometry, material);
	wall5.position.set(0,1.25,4.65);
	scene.add(wall5);
	wall6 = new THREE.Mesh(geometry, material);
	wall6.position.set(0,1.25,1.65);
	scene.add(wall6);

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
	glassCase.position.set(-1,-3,20);n
	scene.add(glassCase);

	const modelStandGeo=new RoundedBoxGeometry(65,200,65,7,6);
	const modelStandMat= new THREE.MeshPhongMaterial({reflectivity:1, color:0x000000});
	modelStand=new THREE.Mesh(modelStandGeo,modelStandMat);
	modelStand.position.set(-1,-130,20);
	scene.add(modelStand);

	////////
	//Video
	////////

	const video1 = document.getElementById( 'video1' );
	const vid1Texture = new THREE.VideoTexture( video1 );
	vid1 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid1Texture }));
	vid1.position.set(0,1.24,17.1);
	scene.add(vid1);
	
	const video2 = document.getElementById( 'video2' );
	const vid2Texture = new THREE.VideoTexture( video2 );
	vid2 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid2Texture }));
	vid2.position.set(0,1.24,14.1);
	scene.add(vid2);

	const video3 = document.getElementById( 'video3' );
	const vid3Texture = new THREE.VideoTexture( video3 );
	vid3 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid3Texture }));
	vid3.position.set(0,1.24,11.1);
	scene.add(vid3);

	const video4 = document.getElementById( 'video4' );
	const vid4Texture = new THREE.VideoTexture( video4 );
	vid4 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid4Texture }));
	vid4.position.set(0,1.24,8.1);
	scene.add(vid4);

	const video5 = document.getElementById( 'video5' );
	const vid5Texture = new THREE.VideoTexture( video5 );
	vid5 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid5Texture }));
	vid5.position.set(0,1.24,5.1);
	scene.add(vid5);

	const video6 = document.getElementById( 'video6' );
	const vid6Texture = new THREE.VideoTexture( video6 );
	vid6 = new THREE.Mesh(new THREE.BoxGeometry(4,3,0.1), new THREE.MeshBasicMaterial({ map: vid6Texture }));
	vid6.position.set(0,1.24,2.1);
	scene.add(vid6);

	///////////////
	//MODEL LOADER
	///////////////
	
	const loader = new GLTFLoader();
	loader.load( 'models/blenderModel.gltf', process);

	//////////
	// Panel
	//////////

	makePanel(18,2,1);
	makePanel(15,2,2);
	makePanel(12,2,3);
	makePanel(9,2,4);
	makePanel(6,2,5);
	makePanel(3,2,6);


	animate();
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

	const buttonOptions = {
		width: 0.4,
		height: 0.15,
		justifyContent: 'center',
		offset: 0.05,
		margin: 0.02,
		borderRadius: 0.075
	};

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

if(buttonCount==2){
	const buttonNext = new ThreeMeshUI.Block( buttonOptions );
	const buttonPrevious = new ThreeMeshUI.Block( buttonOptions );

	buttonNext.add(
		new ThreeMeshUI.Text( { content: 'play' } )
	);

	buttonPrevious.add(
		new ThreeMeshUI.Text( { content: 'pause' } )
	);

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

	container.add( buttonNext, buttonPrevious );
	objsToTest.push( buttonNext, buttonPrevious );
}
else if (buttonCount==1){
	const buttonEnter = new ThreeMeshUI.Block( buttonOptions );

	buttonEnter.add(
		new ThreeMeshUI.Text( { content: 'enter' } )
	);

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonEnter.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {

			camera.position.z=20;

		}
	} );
	buttonEnter.setupState( hoveredStateAttributes );
	buttonEnter.setupState( idleStateAttributes );

	container.add( buttonEnter );
	objsToTest.push(buttonEnter );
}
else if (buttonCount==3){
	const buttonEnter = new ThreeMeshUI.Block( buttonOptions );

	buttonEnter.add(
		new ThreeMeshUI.Text( { content: 'proceed' } )
	);

	const selectedAttributes = {
		offset: 0.02,
		backgroundColor: new THREE.Color( 0x777777 ),
		fontColor: new THREE.Color( 0x222222 )
	};

	buttonEnter.setupState( {
		state: 'selected',
		attributes: selectedAttributes,
		onSet: () => {

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
			}
			
		}
	} );
	buttonEnter.setupState( hoveredStateAttributes );
	buttonEnter.setupState( idleStateAttributes );

	container.add( buttonEnter );
	objsToTest.push(buttonEnter );
}
}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );

}

function animate() {
	requestAnimationFrame(animate);

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
	
	updateButtons();
	ThreeMeshUI.update();
	renderer.render( scene, camera );

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
	
	const cz = c.z * Math.cos( yRotation ) - c.x * Math.sin( yRotation );
	const cx = c.z * Math.sin( yRotation ) + c.x * Math.cos( yRotation );
	
	gltf.scene.position.set( xPosition - cx+2, size.y / 2 - c.y-205, zPosition - cz+10 );

}

function updateButtons() {

	let intersect;

	if ( mouse.x !== null && mouse.y !== null ) {

		raycaster.setFromCamera( mouse, camera );

		intersect = raycast();

	}

	if ( intersect && intersect.object.isUI ) {

		if ( selectState ) {

			intersect.object.setState( 'selected' );

		} else {

			intersect.object.setState( 'hovered' );

		}

	}

	objsToTest.forEach( ( obj ) => {

		if ( ( !intersect || obj !== intersect.object ) && obj.isUI ) {

			obj.setState( 'idle' );

		}

	} );

}

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
