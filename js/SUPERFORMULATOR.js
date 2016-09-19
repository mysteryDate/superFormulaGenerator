"use strict";
var SUPERFORMULATOR = (function(){
	// --------------------
	// Variables
	// --------------------
	var scene 		= new THREE.Scene(),
		camera 		= new THREE.PerspectiveCamera( 75, window.innerWidth/window.innerHeight, 0.1, 1000 ),
		container 	= document.getElementById("container"),
		renderer 	= new THREE.WebGLRenderer({ antialias: true }),
		controls 	= new THREE.OrbitControls( camera, renderer.domElement),
		geometry 	= new THREE.BoxGeometry( 0.5, 0.5, 0.5 ),
		superMesh   = new SuperMesh(80,80);
	// ---------------------

	// ---------------------
	// Options
	// ---------------------
		solid_border = true, // Do planets reflect off the border?
	// ---------------------
		paper,               // The canvas
		Planets      = [],   // An array containing all Planets

		windowWidth  = $(window).width(),
		windowHeight = $(window).height(),

		looping      = false,
		lastRequest;
		// accelerationLines = false;

	function loop() {
		looping = true;
		update();
		draw();
		queue();
	}

	return {
		TIME_STEP    	: TIME_STEP,
		loop         	: loop,
		looping      	: looping,
		isLooping	 	: isLooping,
		stopLoop     	: stopLoop,
		clear        	: clear,
		create_planet	: create_planet,
		solid_border	: solid_border,
		paper        	: paper,
		seed 			: seed,
		Planets 		: Planets
	}
})();