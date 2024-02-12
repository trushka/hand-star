const model='./assets/hand3.glb',
	envMap='./assets/map1.webp',
	bumpMap = './assets/bump1.webp',
	nMap = './assets/normal.webp'

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
		envMapIntensity: 1.3,
		//normalMap: new THREE.TextureLoader().load(nMap),
		bumpMap: new THREE.TextureLoader().load(bumpMap),
		bumpScale: -3.5,
		//normalScale: -.5
	}),
	{PI, cos, sin, abs}=Math,

	lights = new THREE.Group(),
	//hLight = new THREE.AmbientLight( );
	hLight = new THREE.HemisphereLight('#def', '#000', 15);

material.color.b=1.4
hLight.intencity=-1;
scene.add(camera, lights);//, hLight);

new THREE.TextureLoader().load(envMap, tex=>{
	scene.environment = tex//new THREE.PMREMGenerator(renderer)
	//.fromEquirectangular(tex).texture
	tex.mapping = THREE.EquirectangularReflectionMapping
}).colorSpace='srgb';

//renderer.toneMapping = THREE.ACESFilmicToneMapping;

hLight.position.set(0, -2.5, 3).normalize()

RectAreaLightUniformsLib.init();

//addLight('#85f', 4, 120, 100, 0, 80, 10, 1.8)
//addLight('#f3a', 38, 160, .5, 150, 70, 80, 5)
addLight('#0ff', 900, 900, .16, 0, 0, -200, PI/4)
//addLight('#af3', 100, 30, 15, 70, -80, 20, -.2)
//addLight('#f30', 90, 80, 15, -200, -200, -80 ,0)

addLight('#adf', 900, 900, .13, 0, 0, -200)

for (var i = 0; i < PI; i += PI/8) {
	//addLight('#adf', 90, 2, 3, 0, 100*sin(i), 100*cos(i), .3)
}
//lights.rotation.set(-1.3, 7, -0.7);

canvas.className = 'anim3d'
document.body.prepend(canvas);

camera.position.set(0, 25, 30);
camera.lookAt(0,0,0);
lights.lookAt(camera.position)

let hand, arm, mesh; 

new GLTFLoader().load(model, obj=>{
	console.log(obj);
	scene.add(...obj.scene.children);

	hand = scene.getObjectByName('hand');
	mesh = scene.getObjectByName('mesh');
	arm = scene.getObjectByName('arm');
	arm.rotation.set(-3.01, -0.34, -1.11)

	mesh.material = material;
	//mesh.geometry.computeVertexNormalsFine()

	//scene.rotation.set(1.9, 0.19, 0.52);
	//hand.rotation.set(-0.01, 0.63, 0);
	//hand.position.y = -4.6

	hand.rotation.set(-0.13,0.91,0.29,"XYZ");
	hand.position.set(2.49,-3.82,6.87);
	hand.scale.set(1.1,1.1,1.1);
	scene.rotation.set(1.81,-0.1,0.79,"XYZ");

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
	if (!e.which) return;
    if (e.which==1) {
		const {width, height} = canvas,
			pos0 = scene.localToWorld(hand.position.clone()).project(camera).addScalar(1).multiply({x: width/2, y: height/2}),
			pos = new THREE.Vector2( e.x, height - e.y ).sub(pos0),
			r = pos.length(),
			dPos = vec3(e.movementX, -e.movementY);

		let ro = pos.angle() - pos.sub(dPos).angle(),
			dr = r-pos.length();
		if (abs(ro)>PI) ro = Math.sign(ro)*(abs(ro) - 2*PI);

		console.log(ro, dr);
        if (!e.shiftKey) hand.rotateOnWorldAxis(vec3(-pos.y, pos.x).normalize().applyQuaternion(camera.quaternion), dr*.01)
		hand.rotateOnWorldAxis(camera.position.clone().sub(hand.position).normalize(), ro*THREE.MathUtils.smoothstep(r, 0, 350));
        //hand.rotateOnWorldAxis(vec3(1,0,0), e.movementY*dr)
    }
   if (e.which==2) {
        scene.rotateOnAxis(vec3(0,1,0).applyQuaternion(camera.quaternion), -e.movementX*.003)
        scene.rotateX(-e.movementY*.003)
        // if (e.which ==3) hand.position.y -= e.movementY*.03
    }
    if (e.which==3) {
        hand.position.x += e.movementX*.03
        hand.position[e.shiftKey?'y':'z'] += e.movementY*(e.shiftKey?-.06:.03)
    }
    getCode()
}
canvas.onwheel=e=>{
	hand.scale.multiplyScalar(1 - e.deltaY*.001);
	getCode()
}
const {controls} = document, {code} = controls;
controls.code.onfocus=function(){this.select()}

function getCode(){
	code.style='';
	code.value = `
		hand.rotation
		hand.position
		hand.scale
		scene.rotation
    `.replace(/^\s+/mg, '')
     .replace(/\S+/g, str=>`	${str}.set(${eval(str).toArray().map(e=> isNaN(e)? '"'+e+'"' : +(+e).toFixed(2))});`);

    code.style.width=code.scrollWidth+'px';
    code.style.height=code.scrollHeight+'px';
}
