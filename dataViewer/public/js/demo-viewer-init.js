var socket = io.connect('http://localhost:5000');

var scene, renderer, camera, container, controls;

var keyboardLock = false;

var clock = new THREE.Clock();

var i = 0;

var particles = 100000;

var geometry = new THREE.BufferGeometry();
geometry.dynamic = true;

geometry.addAttribute('position', new THREE.BufferAttribute(new Float32Array(particles * 3), 3));
geometry.addAttribute('color', new THREE.BufferAttribute(new Float32Array(particles * 3), 3));

var positions = geometry.attributes.position.array;
var colors = geometry.attributes.color.array;

var material = new THREE.PointsMaterial({
  size: 0.01,
  vertexColors: THREE.VertexColors,
  transparent: true,
  opacity: 0.9
});

init();
animate();

function init() {
  console.log('hi');
  // socket.emit('start-demo');
  // offset used to alter color
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  var offSet = 0;

  // create scene
  scene = new THREE.Scene();

  // create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.z = 10;

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight );

  document.body.appendChild(renderer.domElement);
  
  // prepare controls
  points = new THREE.Points(geometry, material);
  scene.add(points);

  socket.on('addPoint', function (pointOb) {
    console.log('adding point');
    addPoint(pointOb);
  });

  socket.on('addGrid', function (max) {
    addGrid(max);
  });

  socket.on('end', function() {
    geometry.attributes.position.needsUpdate = false;
    geometry.attributes.color.needsUpdate = false;
  });

  controls = new THREE.FirstPersonControls( camera );
  controls.movementSpeed = 5;
  controls.lookSpeed = 0.125;
  controls.lookVertical = true;
  controls.constrainVertical = true;
  controls.verticalMin = 1.1;
  controls.verticalMax = 2.2;
  container.appendChild( renderer.domElement );
  window.addEventListener('resize', onWindowResize, false);
};

// TODO: Add init method to initialize the number of particles
function addGrid(max) {
  for (var i = -50; i <= 50; i++) {
    var gridxy = new THREE.GridHelper(max, 2);
    gridxy.material.transparent = true;
    gridxy.material.opacity = 0.1;
    gridxy.rotation.x = Math.PI/2;
    gridxy.position.set(0, 0, i);
    scene.add(gridxy);
  }

  for (var i = -50; i <= 50; i++) {
    var gridxz = new THREE.GridHelper(max, 2);
    gridxz.material.transparent = true;
    gridxz.material.opacity = 0.1;
    gridxz.position.set(0, i, 0);
    scene.add(gridxz);
  }
};

function addPoint(pointOb) {
  positions[i]     = pointOb.x;
  positions[i + 1] = pointOb.y;
  positions[i + 2] = pointOb.z;
  
  var color = new THREE.Color(pointOb.color);
  colors[i]     = color.r;
  colors[i + 1] = color.g;
  colors[i + 2] = color.b;
  i += 3;

  geometry.attributes.position.needsUpdate = true;
  geometry.attributes.color.needsUpdate = true;
};

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  controls.handleResize();
};


function animate() {
  requestAnimationFrame(animate);
  geometry.computeBoundingSphere();
  render();
};

function render() {
  var delta = clock.getDelta();
  controls.update( delta );
  renderer.render(scene, camera);
};

function genSpherePts(numPoints) {
  var inc = Math.PI * (3 - Math.sqrt(5));
  var off = 2.0 / numPoints;
  var scale = 8;
  var x, y, z, r, phi;

  var sphere = {
    x: [],
    y: [],
    z: []
  };

  for(var k = 0; k < numPoints; k++) {
    y = k * off - 1 + (off / 2);
    r = Math.sqrt(1 - y * y);
    phi = k * inc;
    x = Math.cos(phi) * r;
    z = Math.sin(phi) * r;
    
    sphere.x.push(x * scale);
    sphere.y.push(y * scale);
    sphere.z.push(z * scale);
  }
  return sphere;
};