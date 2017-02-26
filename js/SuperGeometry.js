"use strict";
// TODO extract this somewhere
// --------------
var STATE_DATA = {
  // Initial values produce a sphere
  'm': {
    'displayName': 'lobes',
    'defaultValue': 1,
    'lerpSpeed': 0.05,
    'bounds': [0, 50]
  },
  'a': {
    'displayName': 'cosine multiplier',
    'defaultValue': 1,
    'lerpSpeed': 0.8,
    'bounds': [0.1, 2]
  },
  'b': {
    'displayName': 'sine multiplier',
    'defaultValue': 1,
    'lerpSpeed': 0.8,
    'bounds': [0.1, 2]
  },
  'n1': {
    'displayName': 'total power',
    'defaultValue': 2,
    'lerpSpeed': 0.8,
    'bounds': [1, 10]
  },
  'n2': {
    'displayName': 'cosine power',
    'defaultValue': 2,
    'lerpSpeed': 0.8,
    'bounds': [-10, 10]
  },
  'n3': {
    'displayName': 'sine power',
    'defaultValue': 2,
    'lerpSpeed': 0.8,
    'bounds': [-10, 10]
  },
};

var randomWithin = function (min, max) {
  return min + ((max - min) * Math.random());
};
// --------------

var FormulaState = function (values) {
  for (var control in values) {
    this[control] = values[control];
  }

  this.set = function (values) {
    for (var control in values) {
      this[control] = values[control];
    }
  }
};

var SuperState = function (stateData) {
  this.speed = 1;
  
  for (var key in stateData) {
    if (!this.keys)
      this.keys = [];
    this.keys.push(key);

    for (var feature in stateData[key]) {
      if (!this[feature])
        this[feature] = {};
      this[feature][key] = stateData[key][feature];
    }
  }

  this.current = {
    longitudinal: new FormulaState(this.defaultValue),
    latitudinal: new FormulaState(this.defaultValue)
  };
  this.goal = {
    longitudinal: new FormulaState(this.defaultValue),
    latitudinal: new FormulaState(this.defaultValue)
  };


  this.randomize = function () {
    this.keys.forEach(function (i) {
      this.goal.longitudinal[i] = randomWithin(this.bounds[i][0], this.bounds[i][1]);
      this.goal.latitudinal[i] = randomWithin(this.bounds[i][0], this.bounds[i][1]);
    }.bind(this));
  }.bind(this);

  this.update = function () {
    this.keys.forEach(function (i) {
      this.current.longitudinal[i] = THREE.Math.lerp(this.current.longitudinal[i], this.goal.longitudinal[i], this.lerpSpeed[i] * this.speed);
      this.current.latitudinal[i] = THREE.Math.lerp(this.current.latitudinal[i], this.goal.latitudinal[i], this.lerpSpeed[i] * this.speed);
    }.bind(this));
  }.bind(this);
}

// The mesh representing a superformula object
var SuperGeometry = function (size) {
  // The vertices, we interpolate towards
  var tempVertices = [],
    r1 = [],
    r2 = [],
    thetas = [],
    phis = [];

  this.width = size;
  this.height = size;
  this.geometry = new THREE.Geometry();
  this.state = new SuperState(STATE_DATA);

  this.init = function () {
    for (var ii = 0; ii < this.width * this.height + 1; ii++) {
      this.geometry.vertices.push(new THREE.Vector3(0, 0, 0));
      tempVertices.push(new THREE.Vector3(0, 0, 0));
    }
    for (var ii = 0; ii < this.width; ii++) {
      r1.push(0);
      thetas.push(0);
    }
    for (var ii = 0; ii < this.height; ii++) {
      r2.push(0);
      phis.push(0);
    }
    calculateVertexPositions();
    for (var ii = 0; ii < tempVertices.length; ii++) {
      this.geometry.vertices[ii].copy(tempVertices[ii]);
    }
    generateMeshFaces();
    this.geometry.computeBoundingSphere();
    this.geometry.computeFaceNormals();
    this.geometry.computeVertexNormals();
    this.geometry.verticesNeedUpdate = true;
  }.bind(this);

  this.update = function () {
    this.state.update();
    calculateVertexPositions();
    for (var ii = 0; ii < tempVertices.length; ii++) {
      this.geometry.vertices[ii].lerp(tempVertices[ii], 0.1);
    }
    this.geometry.computeBoundingSphere();
    this.geometry.verticesNeedUpdate = true;
  }.bind(this);

  var generateMeshFaces = function () {
    // This function runs once at initialization
    for (var ii = 0; ii < this.height; ii++) {
      // Downward rows
      if (ii != 0) {
        for (var jj = ii * this.width; jj < (ii + 1) * this.width; jj++) {
          var a = jj;
          var b = jj + 1 - this.width;
          var c = jj + 1;
          if (jj == (ii + 1) * this.width - 1) {
            b = ii * this.width - this.width;
            c = ii * this.width;
          }
          this.geometry.faces.push(new THREE.Face3(a, b, c));
        }
      }
      // Upward rows
      if (ii != this.height - 1) {
        for (var jj = ii * this.width; jj < (ii + 1) * this.width; jj++) {
          var a = jj;
          var b = jj + 1;
          var c = jj + this.width;
          if (jj == (ii + 1) * this.width - 1) {
            b = ii * this.width;
          }
          this.geometry.faces.push(new THREE.Face3(a, b, c));
        }
      }
    }
    // Seal the top!
    var numVertices = this.geometry.vertices.length;
    for (var ii = numVertices - this.width - 2; ii < numVertices - 1; ii++) {
      var a = ii;
      var b = ii + 1;
      var c = numVertices - 1;
      // var c = ii + 2;
      if (ii == numVertices - 2) {
        b = numVertices - this.width - 1;
      }
      this.geometry.faces.push(new THREE.Face3(a, b, c));
    }
  }.bind(this);

  var calculateVertexPositions = function () {
    // This function runs every frame to calculate vertex position
    // Generate longitudinal points [-pi to pi] (full circle)
    var p1 = this.state.current.longitudinal;
    for (var ii = 0; ii < this.width; ii++) {
      var t = (2 * Math.PI * ii / this.width) - Math.PI;
      var r = Math.pow(Math.abs(Math.cos(p1.m * t / 4) / p1.a), p1.n2);
      r += Math.pow(Math.abs(Math.sin(p1.m * t / 4) / p1.b), p1.n3);
      r = Math.pow(r, -1 / p1.n1);
      thetas[ii] = t;
      r1[ii] = r;
    };

    // Generate latitudinal points [-pi/2 to pi/2] (semi-circle)
    var p2 = this.state.current.latitudinal;
    for (var ii = 0; ii < this.height; ii++) {
      var p = (Math.PI * ii / this.height) - Math.PI / 2;
      var r = Math.pow(Math.abs(Math.cos(p2.m * p / 4) / p2.a), p2.n2);
      r += Math.pow(Math.abs(Math.sin(p2.m * p / 4) / p2.b), p2.n3);
      r = Math.pow(r, -1 / p2.n1);
      phis[ii] = p;
      r2[ii] = r;
    }

    var lengthMaxSq = 0;

    // Add circles, from bottom to top
    for (var ii = 0; ii < this.height; ii++) {
      for (var jj = 0; jj < this.width; jj++) {
        var x = r1[jj] * Math.cos(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
        var y = r1[jj] * Math.sin(thetas[jj]) * r2[ii] * Math.cos(phis[ii]);
        var z = r2[ii] * Math.sin(phis[ii]);
        tempVertices[ii * this.width + jj].set(x, y, z);
        lengthMaxSq = Math.max(lengthMaxSq, tempVertices[ii * this.width + jj].lengthSq());
      }
    }

    var scale = 0.5 / Math.sqrt(lengthMaxSq);

    for (var ii = 0; ii < tempVertices.length; ii++) {
      tempVertices[ii].multiplyScalar(scale);
    }

    // Seal the top
    tempVertices[tempVertices.length - 1].copy(tempVertices[0]).multiplyScalar(-1);
  }.bind(this);
};
