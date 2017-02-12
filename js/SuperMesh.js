var State = function(options) {
	this.a  = options.a  || 1;
	this.b  = options.b  || 1;
	this.m  = options.m  || 2;
	this.n1 = options.n1 || 2;
	this.n2 = options.n2 || 2;
	this.n3 = options.n3 || 2;

	this.set = function(options) {
		this.a  = options.a  || this.a;
		this.b  = options.b  || this.b;
		this.m  = options.m  || this.m;
		this.n1 = options.n1 || this.n1;
		this.n2 = options.n2 || this.n2;
		this.n3 = options.n3 || this.n3;
	}
}

// The mesh representing a superformula object
var SuperMesh = function(size) {
	this.height = size;
	this.width = size;
	this.geometry = new THREE.Geometry();
	// The vertices, we interpolate towards
	var tempVertices 	= [];
	var r1 	= [];
	var r2 	= [];
	var thetas 	= [];
	var phis 	= [];

	this.p1 = new State({});
	this.p2 = new State({});

	this.init = function() {
		for(var ii = 0; ii < this.width * this.height + 1; ii++) {
			this.geometry.vertices.push(new THREE.Vector3(0,0,0));
			tempVertices.push(new THREE.Vector3(0,0,0));
		}
		for(var ii = 0; ii < this.width; ii++) {
			r1.push(0);
			thetas.push(0);
		}
		for(var ii = 0; ii < this.height; ii++) {
			r2.push(0);
			phis.push(0);
		}
		this.GenerateMeshVertices();
		for(var ii = 0; ii < tempVertices.length; ii++) {
			this.geometry.vertices[ii].copy(tempVertices[ii]);
		}
		this.GenerateFaces();
		this.geometry.computeBoundingSphere();
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.verticesNeedUpdate = true;
	}.bind(this);

	this.update = function() {
		this.GenerateMeshVertices();
		for(var ii = 0; ii < tempVertices.length; ii++) {
			this.geometry.vertices[ii].lerp(tempVertices[ii], 0.1);
		}
		this.geometry.computeBoundingSphere();
		this.geometry.verticesNeedUpdate = true;
	}.bind(this);

	this.GenerateFaces = function() {

		for(var ii = 0; ii < this.height; ii++) {
			// Downward rows
			if(ii != 0) {
				for(var jj = ii * this.width; jj < (ii + 1) * this.width; jj++) {
					var a = jj;
					var b = jj + 1 - this.width;
					var c = jj + 1;
					if(jj == (ii + 1) * this.width - 1) {
						b = ii * this.width - this.width;
						c = ii * this.width;
					}
					this.geometry.faces.push( new THREE.Face3( a, b, c));
					// geometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
				}
			}
			// Upward rows
			if(ii != this.height - 1) {
				for(var jj = ii * this.width; jj < (ii + 1) * this.width; jj++) {
					var a = jj;
					var b = jj + 1;
					var c = jj + this.width;
					if(jj == (ii + 1) * this.width - 1) {
						b = ii * this.width;
					}
					this.geometry.faces.push( new THREE.Face3( a, b, c));
					// geometry.faceVertexUvs[0].push( [new THREE.Vector2(0,1), new THREE.Vector2(0,0), new THREE.Vector2(1,1)] );
				}
			}
		}
		// Seal the top!
		var numVertices = this.geometry.vertices.length;
		for(var ii = numVertices - this.width - 2; ii < numVertices - 1; ii++) {
			var a = ii;
			var b = ii + 1;
			var c = numVertices - 1;
			// var c = ii + 2;
			if(ii == numVertices - 2) {
				b = numVertices - this.width - 1;
			}
			this.geometry.faces.push( new THREE.Face3( a,b,c));
		}

		this.geometry.computeBoundingSphere();
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
	}.bind(this);

	this.GenerateMeshVertices = function() {
		// var r1 = [];
		// var r2 = [];
		// var thetas = [];
		// var phis = [];

		// The actual vertices of the mesh
		// VERTICES = [];
		// The vertices we interpolate towards
		// tempVertices = [];

		// Generate longitudinal points [-pi to pi] (full circle)
		for (var ii = 0; ii < this.width; ii++) {
			var t = (2 * Math.PI * ii / this.width) - Math.PI;
			var r 	=  Math.pow( Math.abs( Math.cos( this.p1.m * t / 4 ) / this.p1.a ), this.p1.n2 );
			r 		+= Math.pow( Math.abs( Math.sin( this.p1.m * t / 4 ) / this.p1.b ), this.p1.n3 );
			r 		=  Math.pow( r, -1 / this.p1.n1 );
			thetas[ii] = t;
			r1[ii] = r;
		};

		// Generate latitudinal points [-pi/2 to pi/2] (semi-circle)
		for (var ii = 0; ii < this.height; ii++) {
			var p = (Math.PI * ii / this.height) - Math.PI/2;
			var r 	=  Math.pow( Math.abs( Math.cos( this.p2.m * p / 4 ) / this.p2.a ), this.p2.n2 );
			r 		+= Math.pow( Math.abs( Math.sin( this.p2.m * p / 4 ) / this.p2.b ), this.p2.n3 );
			r 		=  Math.pow( r, -1 / this.p2.n1 );
			phis[ii] = p;
			r2[ii] = r;
		}

		var lengthMaxSq = 0;

		// Add circles, from bottom to top
		for(var ii = 0; ii < this.height; ii++) {
			for(var jj = 0; jj < this.width; jj++) {
				var x = r1[jj] * Math.cos(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
				var y = r1[jj] * Math.sin(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
				var z = r2[ii] * Math.sin(phis[ii]);
				tempVertices[ii * this.width + jj].set(x,y,z);
				lengthMaxSq = Math.max(lengthMaxSq, tempVertices[ii * this.width + jj].lengthSq() );
				// VERTICES.push(vertex);
			}
		}

		var scale = 0.5 / Math.sqrt(lengthMaxSq);

		for(var ii = 0; ii < tempVertices.length; ii++) {
			tempVertices[ii].multiplyScalar(scale);
			// VERTICES[ii].multiplyScalar(scale);
		}

		// Seal the top
		tempVertices[tempVertices.length - 1].copy(tempVertices[0]).multiplyScalar(-1);
		// VERTICES.push(finalVertex);
	}.bind(this);
}
