var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 );
var controls = new THREE.OrbitControls( camera);


var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var geometry = new THREE.BoxGeometry( 0.5, 0.5, 0.5 );
// for(var index in geometry.vertices) {
// 	geometry.vertices[index].x *= Math.random();
// 	geometry.vertices[index].y *= Math.random();
// 	geometry.vertices[index].x *= Math.random();
// }
var material = new THREE.MeshNormalMaterial( { color: 0x00ff00, shininess: 200 } );

var cube = new THREE.Mesh( geometry, material );

var light = new THREE.DirectionalLight( 0xdddddd, 0.8);
light.position.set(-80,80,80);
// scene.add( cube );
scene.add( light);

camera.position.z = 1;

var superGeometry = new THREE.Geometry();

var lerpValue = 0.01;

var render = function () {
	requestAnimationFrame( render );

	sup.rotation.x += 0.01;
	sup.rotation.y += 0.01;
	// sup.rotation.z += 0.01;

	// cube.scale.multiplyScalar(1.001);
	// light.position.x += 1;

	// sup.geometry.vertices[0].x += 0.01;
	for(var i in P1) {
		var current = P1[i];
		var goal = P1n[i];
		P1[i] = ((1 - lerpValue) * current + lerpValue * goal);
	}
	for(var i in P2) {
		var current = P2[i];
		var goal = P2n[i];
		P2[i] = ((1 - lerpValue) * current + lerpValue * goal);
	}
	GenerateMeshVertices(P1, P2);
	superGeometry.vertices = VERTICES;

	superGeometry.computeBoundingSphere();
	superGeometry.computeFaceNormals();
	superGeometry.computeVertexNormals();
	superGeometry.verticesNeedUpdate = true;

	controls.update();

	renderer.render(scene, camera);
};

var WIDTH = 80;
var HEIGHT = 80;
var VERTICES = [];

var P1n = {
	a : 1,
	b : 1,
	m : 11.25,
	// m : 1,
	n1: 7.3,
	n2: -1.68,
	n3: 3.31
};

var P2n = {
	a : 1,
	b : 1,
	m : 9.08,
	n1: 2.2,
	n2: 0.53,
	n3: 2.02
};

var P1 = {
	a : 1,
	b : 1,
	m : 2,
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

function GenerateMesh() {
	GenerateMeshVertices(P1, P2);
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
				// superGeometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
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
				// superGeometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
			}
		}
	}
	// Seal the top!
	for(var ii = VERTICES.length - WIDTH - 2; ii < VERTICES.length - 1; ii++) {
		var a = ii;
		var b = ii + 1;
		var c = VERTICES.length - 1;
		// var c = ii + 2;
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
	var r1 = [];
	var r2 = [];
	var thetas = [];
	var phis = [];

	VERTICES = [];

	// Generate longitudinal points [-pi to pi] (full circle)
	for (var ii = 0; ii < WIDTH; ii++) {
		var theta = (2 * Math.PI * ii / WIDTH) - Math.PI;
		var r 	=  Math.pow( Math.abs( Math.cos( p1.m * theta / 4 ) / p1.a ), p1.n2 );
		r 		+= Math.pow( Math.abs( Math.sin( p1.m * theta / 4 ) / p1.b ), p1.n3 );
		r 		=  Math.pow( r, -1 / p1.n1 );
		thetas.push(theta);
		r1.push(r);
	};

	// Generate latitudinal points [-pi/2 to pi/2] (semi-circle)
	for (var ii = 0; ii < HEIGHT; ii++) {
		var phi = (Math.PI * ii / HEIGHT) - Math.PI/2;
		var r 	=  Math.pow( Math.abs( Math.cos( p2.m * phi / 4 ) / p2.a ), p2.n2 );
		r 		+= Math.pow( Math.abs( Math.sin( p2.m * phi / 4 ) / p2.b ), p2.n3 );
		r 		=  Math.pow( r, -1 / p2.n1 );
		phis.push(phi);
		r2.push(r);
	}

	var lengthMaxSq = 0;

	// Add circles, from bottom to top
	for(var ii = 0; ii < HEIGHT; ii++) {
		for(var jj = 0; jj < WIDTH; jj++) {
			var x = r1[jj] * Math.cos(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
			var y = r1[jj] * Math.sin(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
			var z = r2[ii] * Math.sin(phis[ii]);
			var vertex = new THREE.Vector3(x,y,z);
			lengthMaxSq = Math.max(lengthMaxSq, vertex.lengthSq() );
			VERTICES.push(vertex);
		}
	}

	var scale = 0.5 / Math.sqrt(lengthMaxSq);

	

	for(var ii = 0; ii < VERTICES.length; ii++) {
		VERTICES[ii].multiplyScalar(scale);
	}

	var finalVertex = new THREE.Vector3(VERTICES[0].x, VERTICES[0].y, VERTICES[0].z);
	VERTICES.push(finalVertex.multiplyScalar(-1));
} 

GenerateMesh();
var sup = new THREE.Mesh(superGeometry, material);
scene.add(sup);

var getGUIValues = function() {

}

render();  