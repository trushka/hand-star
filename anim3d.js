const model='./assets/hand3.glb',
	envMap='./assets/map1.webp',
	bumpMap = './assets/bump1.webp',
	nMap = './assets/normal.webp'

import {THREE, vec3} from './threeCustom.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

//import { RectAreaLightHelper } from 'three/addons/helpers/RectAreaLightHelper.js';
//import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';

function addLight(x=0, y=0, z=1, color, power) {
	const light = new THREE.DirectionalLight(color, power);
	light.position.set(x,y,z);
	const i=lights.children.length;
	lights.add(light);
	document.querySelector('.lights').innerHTML += `<input type="radio" name="light" value=${i}>`
}
const
	renderer = new THREE.WebGLRenderer( {alpha:true, antialias:true} ),
	canvas = renderer.domElement,
	camera=new THREE.PerspectiveCamera( 40, 1, .1, 1000 ),
	scene = new THREE.Scene(),
	material = new THREE.MeshPhysicalMaterial({
		bumpMap: new THREE.TextureLoader().load(bumpMap),

		color: '#7b61ff',
		roughness: 0.2,
		metalness: 0.9,
		bumpScale: -3.5,
		envMapIntensity: 30,
		sheenColor: '#eb00b8',
		sheenRoughness: 0.3,
		specularIntensity: 15,
		specularColor: '#f2acfb',
		sheen: 1,
	}),
	{PI, cos, sin, abs}=Math,

	lights = new THREE.Group(),
	//hLight = new THREE.AmbientLight( );
	hLight = new THREE.HemisphereLight('#def', '#000', 15);

hLight.intensity=-1;
scene.add(camera, lights);//, hLight);
material.emissive.set(-.04, -.04, -.04)

addLight(-0.41, 0.90, 0.16, '#6bff7c', 7.1)
addLight(-0.21, 0.97, 0.12, '#02f23e', 5.42)
addLight(-0.62, -0.65, 0.44, '#4efb4b', 6.44)
addLight(0.67, -0.22, 0.71, '#f3ff52', 2.91)
addLight(0.50, 0.71, 0.50, '#29ff74', 5.82)
addLight(-0.47, 0.75, 0.46, '#fff36b', 1.37)
addLight(0.66, 0.33, -0.67, '#e76e6e', 0.63)

new THREE.TextureLoader().load(envMap, tex=>{
	scene.environment = tex//new THREE.PMREMGenerator(renderer)
	//.fromEquirectangular(tex).texture
	tex.mapping = THREE.EquirectangularReflectionMapping
}).colorSpace='srgb';

//renderer.toneMapping = THREE.ACESFilmicToneMapping;

hLight.position.set(0, -2.5, 3).normalize()

//RectAreaLightUniformsLib.init();

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
	hand.position.set(2.4,-1.6,8.31);
	hand.scale.set(1,1,1);
	scene.rotation.set(-1.54,0.24,0.09,"XYZ");

	requestAnimationFrame(anim)
	Object.assign(window, {scene,camera, renderer, THREE, hand, arm, mesh, material, hLight, lights, addLight})
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
window.curLight = '';

canvas.onmousemove=e=>{
	if (!e.which) return;
    if (e.which==1) {
    	curLight.position.applyEuler(new THREE.Euler(e.movementY*.003, e.movementX*.003), 0)

    	return getCode('l')

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

controls.oninput=e=>{
	const {lcolor, lpower, light} = controls;
	if (e.target.name=='light'){
		curLight = lights.children[light.value]
		lcolor.value = '#'+curLight.color.getHexString();
		lpower.value = curLight.intensity
	}
	if (!curLight) return;
	if (e.target == lcolor) curLight.color.setStyle(lcolor.value);
	if (e.target == lpower) curLight.intensity = lpower.value;
	getCode('l')
}

['color', 'sheenColor', 'specularColor'].forEach(prop=>{
	const color = material[prop], inp=document.createElement('input');
	document.querySelector('.colors').append(inp);
	inp.type="color";
	inp.name=inp.title=prop;
	inp.value='#'+color.getHexString();
	inp.oninput = inp.onfocus = e=> {color.setStyle(inp.value); getCode('m'); return false}
})

function getCode(type){
	code.style.width='';
	code.value = '';
	if (!type) code.value = `
		hand.rotation
		hand.position
		hand.scale
		scene.rotation
    `.replace(/^\s+/mg, '')
     .replace(/\S+/g, str=>`	${str}.set(${eval(str).toArray().map(e=> isNaN(e)? '"'+e+'"' : +(+e).toFixed(2))});`);

    if (type=='l') lights.children.forEach(light=>{
    	code.value+=`\naddLight(${light.position.toArray().map(val=>val.toFixed(2)).join(', ')}, '#${light.color.getHexString()}', ${light.intensity})`
    })

    const getVal = val=> +val||`'#${val?.getHexString?.()}'`;
    if (type=='m') for (let key in material) {
    	if (key=='version') continue;
    	
    	const val = getVal(material[key=key.replace('_', '')]);
    	if (val != getVal(mat0[key])) code.value+=`		${key}: ${val},\n`
    }

    code.style.width=code.scrollWidth-code.clientWidth+code.offsetWidth+'px';
    //code.style.height=code.scrollHeight+'px';
}
const mat0=new THREE.MeshPhysicalMaterial()
