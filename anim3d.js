const model='./assets/hand3.glb',
	envMap='./assets/map1.webp'

import {THREE, vec3} from './threeCustom.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

function addLight(color, w, h, power, x, y, z, ro=0) {
	const light = new THREE.RectAreaLight(color, power*1.6, w*3, h*3);
	light.position.set(x,y,z).multiplyScalar(3);
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
		color: '#fff',
		roughness: .18,
		metalness: 1,
		emissive: new THREE.Color().multiplyScalar(-.08),
		envMapIntensity: 1.3
	}),
	{PI, cos, sin}=Math,

	lights = new THREE.Group(),
	hLight = new THREE.AmbientLight( );
	//hLight = new THREE.HemisphereLight('#def', '#000', 15);

hLight.intencity=-1;
scene.add(camera, lights)//hLight);

new THREE.TextureLoader().load(envMap, tex=>{
	scene.environment = new THREE.PMREMGenerator(renderer)
	.fromEquirectangular(tex).texture
}).colorSpace='srgb';

//renderer.toneMapping = THREE.ACESFilmicToneMapping;

hLight.position.set(0, -2.5, 3).normalize()

RectAreaLightUniformsLib.init();

addLight('#85f', 4, 120, 100, 0, 80, 10, 1.8)
//addLight('#f3a', 38, 160, .5, 150, 70, 80, 5)
addLight('#0ff', 360, 64, .8, 70, 80, -190, 2.5)
//addLight('#af3', 100, 30, 15, 70, -80, 20, -.2)
addLight('#f30', 30, 80, 15, -70, 10, -80,0)

addLight('#adf', 210, 140, .1, -100, -220, -190, 0)

for (var i = 0; i < PI; i += PI/8) {
	//addLight('#adf', 90, 2, 3, 0, 100*sin(i), 100*cos(i), .3)
}

canvas.className = 'anim3d'
document.body.prepend(canvas);

camera.position.set(0, 25, 30);
camera.lookAt(0,0,0);
scene.rotation.set(-4.13, -5.41, 0)


let hand, arm, mesh; 

new GLTFLoader().load(model, obj=>{
	console.log(obj);
	scene.add(...obj.scene.children);

	hand = scene.getObjectByName('hand');
	mesh = scene.getObjectByName('mesh');
	arm = scene.getObjectByName('arm');

	mesh.material = material;
	//mesh.geometry.computeVertexNormalsFine()

	hand.rotation.set(-0.25, 0.32, 0);
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

//ajustment
canvas.onmousemove=e=>{
    if (e.which==1) {
        hand.rotation.x += e.movementY*.01
        hand.rotation.y += e.movementX*.01
    }
    if (e.which>1) {
        scene.rotation.x += e.movementY*.01
        scene.rotation.y += e.movementX*.01
        // hand.position.x += e.movementX*.03
        // hand.position.z += e.movementY*.03*(4-e.which)
        // if (e.which ==3) hand.position.y -= e.movementY*.03
    }
}
canvas.onwheel=e=>{
	camera.zoom *= 1 - e.deltaY*.001;
	camera.updateProjectionMatrix()
}
