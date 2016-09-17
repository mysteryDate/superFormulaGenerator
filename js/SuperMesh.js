// The mesh representing a superformula object
var SuperMesh = function(size) {
	this.HEIGHT = size;
	this.WIDTH = size;
	this.geometry = new THREE.Geometry();

	this.P1 = {
		a : 1,
		b : 1,
		m : 2,
		n1: 2,
		n2: 2,
		n3: 2
	};

	this.P2 = {
		a : 1,
		b : 1,
		m : 2,
		n1: 2,
		n2: 2,
		n3: 2
	};

	this.update = function() {
		GenerateMeshVertices();
		geometry.vertices = VERTICES;

		geometry.verticesNeedUpdate = true;
	}

	this.GenerateFaces = function() {

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
					geometry.faces.push( new THREE.Face3( a, b, c));
					// geometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
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
					geometry.faces.push( new THREE.Face3( a, b, c));
					// geometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
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
			geometry.faces.push( new THREE.Face3( a,b,c));  
		}

		geometry.computeBoundingSphere();
		geometry.computeFaceNormals();
		geometry.computeVertexNormals();
	}

	this.GenerateMeshVertices = function() {
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
}