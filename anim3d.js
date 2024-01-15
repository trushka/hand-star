const model='./assets/hand2.glb'

import {THREE, vec3} from './threeCustom.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

function addLight(color, w, h, power, x, y, z, ro=0) {
	const light = new THREE.RectAreaLight(color, power, w, h);
	light.position.set(x,y,z);
	lights.add(light);
	light.lookAt(0,0,0)
	light.rotateZ(ro);
}
const
	renderer = new THREE.WebGLRenderer( {alpha:true, antialias:true} ),
	canvas = renderer.domElement,
	camera=new THREE.PerspectiveCamera( 40, 1, .1, 1000 ),
	scene = new THREE.Scene(),
	material = new THREE.MeshStandardMaterial({
		color: '#ddd',
		roughness: .17,
		metalness: .99
	}),

	lights = new THREE.Group(),
	hLight = new THREE.HemisphereLight('#eef', '#030301', 1);

scene.add(hLight, lights);
RectAreaLightUniformsLib.init();

addLight('#85f', 4, 120, 100, 0, 80, 10, -.3)
addLight('#f3a', 38, 160, .5, 150, 70, 80, 1.7)
addLight('#0ff', 190, 4, 20, 70, 80, -190, .3)
addLight('#9f3', 100, 30, 15, 70, -80, 20, -.2)
addLight('#f30', 20, 130, 15, -90, 30, -60,.3)

canvas.className = 'anim3d'
document.body.prepend(canvas);

camera.position.set(0, 25, 30);
camera.lookAt(0,0,0);



let hand, arm, mesh; 

new GLTFLoader().load(model, obj=>{
	console.log(obj);
	scene.add(...obj.scene.children);

	hand = scene.getObjectByName('hand');
	mesh = scene.getObjectByName('mesh');
	arm = scene.getObjectByName('arm');

	mesh.material = material;
	//mesh.geometry.computeVertexNormalsFine()

	hand.rotation.set(-0.14, 0.17, 0);
	hand.position.y = -4.6

	requestAnimationFrame(anim)
	Object.assign(window, {scene,camera, renderer, THREE, hand, arm, mesh, hLight, lights})
})

function resize() {
	renderer.setPixelRatio(devicePixelRatio);
	renderer.setSize(innerWidth, innerHeight, false);
	camera.aspect = ( innerWidth / innerHeight );
	camera.updateProjectionMatrix()
}
addEventListener('resize', resize);
resize();

let t0=0;
function anim(t) {
	requestAnimationFrame(anim)

	const dt = Math.max(100, t-t0),
		reaching = dt * .002,
		{opacity} = canvas.style;
	t0 = t;

	renderer.render(scene, camera)
}

