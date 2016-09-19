
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var container = document.getElementById("container");
var renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );
var controls = new THREE.OrbitControls( camera, renderer.domElement);
$("canvas").attr("id","viewer");

var geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );

var material = new THREE.MeshNormalMaterial( { color: 0x00ff00, shininess: 200 } );

camera.position.z = .707;
camera.position.y = -0.707;

var superGeometry = new THREE.Geometry();



var WIDTH = 80;
var HEIGHT = 80;
var VERTICES = [];
var tempVertices = [];
var r1 = [];
var r2 = [];
var thetas = [];
var phis = [];

for(var ii = 0; ii < WIDTH * HEIGHT + 1; ii++) {
	VERTICES.push(new THREE.Vector3(0,0,0));
	tempVertices.push(new THREE.Vector3(0,0,0));
}
for(var ii = 0; ii < WIDTH; ii++) {
	r1.push(0);
	thetas.push(0);
}
for(var ii = 0; ii < HEIGHT; ii++) {
	r2.push(0);
	phis.push(0);
}

var CONTROLS = {
	animate: false,
	rotate : false,
	lerpSpeed : 0.05,
	animationSpeed : 50000,
	animateLobes: false,
	animateRidges: true,
	P1n_a: false,
	P1n_b: true,
	P2n_a: false,
	P2n_b: false
};

var P1n = {
	a : 1.0,
	b : 1.0,
	m : 11.25,
	n1: 7.3,
	n2: 1,
	n3: 3.31
};

var P2n = {
	a : 1.0,
	b : 1.0,
	m : 9.08,
	n1: 2.2,
	n2: 0.53,
	n3: 2.02
};

var P1 = {
	a : 1,
	b : 1,
	m : 2.0,
	n1: 2,
	n2: 2,
	n3: 2
};

var P2 = {
	a : 1,
	b : 1,
	m : 2,
	n1: 2,
	n2: 2,
	n3: 2
};


P1n_a =
    new TWEEN.Tween(P1n)
    	.to({ a: 2}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)

P1n_b =
    new TWEEN.Tween(P1n)
    	.to({ b: 2}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)

P1n_m =
    new TWEEN.Tween(P1n)
    	.to({ m: 50}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)

P2n_a =
    new TWEEN.Tween(P2n)
    	.to({ a: 2}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)

P2n_b =
    new TWEEN.Tween(P2n)
    	.to({ b: 2}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)

P2n_m =
    new TWEEN.Tween(P2n)
    	.to({ m: 50}, CONTROLS.animationSpeed)
    .easing(TWEEN.Easing.Quadratic.In)
    .repeat(Infinity)
    .yoyo(true)


function animationCheck(){
	if(CONTROLS.animateLobes){
		TWEEN.add(P1n_m);
	}
	if(CONTROLS.animateRidges){
		TWEEN.add(P2n_m);
	}
	if(CONTROLS.P1n_a){
		TWEEN.add(P1n_a);
	}
	if(CONTROLS.P1n_b){
		TWEEN.add(P1n_b);
	}
	if(CONTROLS.P2n_a){
		TWEEN.add(P2n_a);
	}
	if(CONTROLS.P2n_b){
		TWEEN.add(P2n_b);
	}
}



function GenerateMesh() {
	GenerateMeshVertices(P1, P2);
	for(var ii = 0; ii < tempVertices.length; ii++) {
		VERTICES[ii].set(tempVertices[ii].x,tempVertices[ii].y,tempVertices[ii].z);
	}
	superGeometry.vertices = VERTICES;

	for(var ii = 0; ii < HEIGHT; ii++) {
		// Downward rows
		if(ii != 0) {
			for(var jj = ii * WIDTH; jj < (ii + 1) * WIDTH; jj++) {
				var a = jj;
				var b = jj + 1 - WIDTH;
				var c = jj + 1;
				if(jj == (ii + 1) * WIDTH - 1) {
					b = ii * WIDTH - WIDTH;
					c = ii * WIDTH;
				}
				superGeometry.faces.push( new THREE.Face3( a, b, c));
			}
		}
		// Upward rows
		if(ii != HEIGHT - 1) {
			for(var jj = ii * WIDTH; jj < (ii + 1) * WIDTH; jj++) {
				var a = jj;
				var b = jj + 1;
				var c = jj + WIDTH;
				if(jj == (ii + 1) * WIDTH - 1) {
					b = ii * WIDTH;
				}
				superGeometry.faces.push( new THREE.Face3( a, b, c));
			}
		}
	}
	// Seal the top!
	for(var ii = VERTICES.length - WIDTH - 2; ii < VERTICES.length - 1; ii++) {
		var a = ii;
		var b = ii + 1;
		var c = VERTICES.length - 1;
		if(ii == VERTICES.length - 2) {
			b = VERTICES.length - WIDTH - 1;
		}
		superGeometry.faces.push( new THREE.Face3( a,b,c));  
	}

	superGeometry.computeBoundingSphere();
	superGeometry.computeFaceNormals();
	superGeometry.computeVertexNormals();
	superGeometry.verticesNeedUpdate = true;
}

function GenerateMeshVertices(p1, p2) {	

	// Generate longitudinal points [-pi to pi] (full circle)
	for (var ii = 0; ii < WIDTH; ii++) {
		var theta = (2 * Math.PI * ii / WIDTH) - Math.PI;
		var r 	=  Math.pow( Math.abs( Math.cos( p1.m * theta / 4 ) / p1.a ), p1.n2 );
		r 		+= Math.pow( Math.abs( Math.sin( p1.m * theta / 4 ) / p1.b ), p1.n3 );
		r 		=  Math.pow( r, -1 / p1.n1 );
		thetas[ii] = theta;
		r1[ii] = r;
	};

	// Generate latitudinal points [-pi/2 to pi/2] (semi-circle)
	for (var ii = 0; ii < HEIGHT; ii++) {
		var phi = (Math.PI * ii / HEIGHT) - Math.PI/2;
		var r 	=  Math.pow( Math.abs( Math.cos( p2.m * phi / 4 ) / p2.a ), p2.n2 );
		r 		+= Math.pow( Math.abs( Math.sin( p2.m * phi / 4 ) / p2.b ), p2.n3 );
		r 		=  Math.pow( r, -1 / p2.n1 );
		phis[ii] = phi;
		r2[ii] = r;
	}

	var lengthMaxSq = 0;

	// Add circles, from bottom to top
	for(var ii = 0; ii < HEIGHT; ii++) {
		for(var jj = 0; jj < WIDTH; jj++) {
			var x = r1[jj] * Math.cos(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
			var y = r1[jj] * Math.sin(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
			var z = r2[ii] * Math.sin(phis[ii]);
			lengthMaxSq = Math.max(lengthMaxSq, x * x + y * y + z * z );
			tempVertices[ii * WIDTH + jj].set(x,y,z);
		}
	}

	var scale = 0.5 / Math.sqrt(lengthMaxSq);
	
	for(var ii = 0; ii < tempVertices.length; ii++) {
		tempVertices[ii].multiplyScalar(scale);
	}

	tempVertices[tempVertices.length - 1].set(tempVertices[0].x, tempVertices[0].y, tempVertices[0].z);	
	tempVertices[tempVertices.length - 1].multiplyScalar(-1);
} 


var Ranges = {
	m: [0,50],
	a: [0.1,2],
	b: [0.1,2],
	n1:[1,10],
	n2:[-10,10],
	n3:[-10,10]
}

var gui;
CreateGUI = function() {
	gui = new dat.GUI();
	gui.add(P1n, 'm').min(0).max(50).listen().step(0.1).name("Lobes");
	gui.add(P2n, 'm').min(0).max(50).listen().name("Ridges");
	var f1 = gui.addFolder("Theta");
	var f2 = gui.addFolder("Phi");
	f1.add(P1n, 'a').min(0.1).max(2).listen().name("Cos Multiplier");
	f1.add(P1n, 'n2').min(-10).max(10).listen().name("Cos Power");
	f1.add(P1n, 'b').min(0.1).max(2).listen().name("Sin Multiplier");;
	f1.add(P1n, 'n3').min(-10).max(10).listen().name("Sin Power");
	f1.add(P1n, 'n1').min(3).max(20).listen().name("Theta Power");
	f2.add(P2n, 'a').min(0.1).max(2).listen().name("Cos Multiplier");
	f2.add(P2n, 'n2').min(-10).max(10).listen().name("Cos Power");
	f2.add(P2n, 'b').min(0.1).max(2).listen().name("Sin Multiplier");;
	f2.add(P2n, 'n3').min(-10).max(10).listen().name("Sin Power");
	f2.add(P2n, 'n1').min(1).max(10).listen().name("Phi Power");
	f1.open();
	f2.open();
	gui.add(window, "Randomize").name("Randomize");
	gui.add(CONTROLS, "rotate").name("Auto-rotate");
	gui.add(CONTROLS, "animate").name("Animate Shape").listen();
	var f3 = gui.addFolder("Animation Options");
	f3.add(CONTROLS, "animateLobes").name("Animate Lobes").listen();
	f3.add(CONTROLS, "animateRidges").name("Animate Ridges").listen();
	var l1 = f3.addFolder("Theta");
	var l2 = f3.addFolder("Phi");
	l1.add(CONTROLS, "P1n_a").name("Animate Cos Multiplier").listen();
	l1.add(CONTROLS, "P1n_b").name("Animate Sin Multiplier").listen();
	l2.add(CONTROLS, "P2n_a").name("Animate Cos Multiplier").listen();
	l2.add(CONTROLS, "P2n_b").name("Animate Sin Multiplier").listen();

}


function Randomize() {
	P1n.m  = Math.random() * 50;
	P1n.a  = (Math.random() * 2) + 0.1;
	P1n.b  = (Math.random() * 2) + 0.1;
	P1n.n1 = (Math.random() * 17) + 3;
	P1n.n2 = (Math.random() * 20) - 10;
	P1n.n3 = (Math.random() * 20) - 10;

	P2n.m  = Math.random() * 50;
	P2n.a  = (Math.random() * 2) + 0.1;
	P2n.b  = (Math.random() * 2) + 0.1;
	P2n.n1 = (Math.random() * 9) + 1;
	P2n.n2 = (Math.random() * 20) - 10;
	P2n.n3 = (Math.random() * 20) - 10;
}

$(".dg").on("mousedown", function(e){
	e.stopPropagation();
});

P1n.n2 = -1.68;


GenerateMesh();
var sup = new THREE.Mesh(superGeometry, material);
scene.add(sup);
CreateGUI();
var superMesh = new SuperMesh(80);

var render = function () {
	requestAnimationFrame( render );

	var slowLerp = 0.05;
	var fastLerp = 0.8;

	if(CONTROLS.rotate) {
		sup.rotation.x += 0.01;
		sup.rotation.y += 0.01;
		sup.rotation.z += 0.01;
	}

	if(CONTROLS.animate){
		TWEEN.removeAll();
		animationCheck();
		TWEEN.update();
	}else{
		TWEEN.removeAll();
	}

	for(var i in P1) {
		var current = P1[i];
		var goal = P1n[i];
		var lerpSpeed = fastLerp;
		if(i == "m") {
			lerpSpeed = slowLerp;
		}
		P1[i] = ((1 - lerpSpeed) * current + lerpSpeed * goal);
	}
	for(var i in P2) {
		var current = P2[i];
		var goal = P2n[i];
		var lerpSpeed = fastLerp;
		if(i == "m") {
			lerpSpeed = slowLerp;
		}
		P2[i] = ((1 - lerpSpeed) * current + lerpSpeed * goal);
	}

	GenerateMeshVertices(P1, P2);
	for(var ii = 0; ii < tempVertices.length; ii++) {
		superGeometry.vertices[ii].lerp(tempVertices[ii], 0.1);
	}

	superGeometry.computeBoundingSphere();
	superGeometry.verticesNeedUpdate = true;

	controls.update();
	renderer.render(scene, camera);
};

var sm = new SuperMesh(80);
sm.init();
window.setTimeout(function(){ 
	render();  
}, 0);
