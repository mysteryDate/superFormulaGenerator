"use strict";
var SUPERFORMULATOR = (function(){
	// --------------------
	// Variables
	// --------------------
	var scene 		= new THREE.Scene(),
			camera 		= new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
			container = document.getElementById("container"),
			renderer 	= new THREE.WebGLRenderer({ antialias: true }),
			controls 	= new THREE.OrbitControls( camera, renderer.domElement),
			superGeometry = new SuperGeometry(80,80);
	// ---------------------

	function init() {
		container.appendChild( renderer.domElement );
		renderer.setSize( window.innerWidth, window.innerHeight );
		camera.position.set(0, -.707, .707);

		superGeometry.init();
		superGeometry.p1.set({
			a : 1.0,
			b : 1.0,
			m : 11.25,
			n1: 7.3,
			n2: -1.68,
			n3: 3.31
		});
		superGeometry.p2.set({
			a : 1.0,
			b : 1.0,
			m : 9.08,
			n1: 2.2,
			n2: 0.53,
			n3: 2.02
		});

		scene.add(new THREE.Mesh(superGeometry.geometry,
			new THREE.MeshNormalMaterial()));
	}

	function render() {
		requestAnimationFrame( render );
		superGeometry.update();
		controls.update();
		renderer.render(scene, camera);
	}

	return {
		superGeometry : superGeometry,
		camera 				: camera,
		scene 				: scene,
		init 					: init,
		render 				: render,
	}
})();
