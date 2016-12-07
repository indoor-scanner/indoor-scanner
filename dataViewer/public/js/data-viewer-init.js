var socket = io.connect('http://localhost:8000');

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
  size: 0.045,
  vertexColors: THREE.VertexColors,
  transparent: true,
  opacity: 0.7
});

init();
animate();

function init() {
  // offset used to alter color
  container = document.createElement( 'div' );
  document.body.appendChild( container );
  var offSet = 0;

  // create scene
  scene = new THREE.Scene();

  // create camera
  camera = new THREE.PerspectiveCamera(75, window.innerWidth/ (window.innerHeight), 0.1, 1000);
  camera.position.set(-15, 5,0);

  renderer = new THREE.WebGLRenderer();
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize( window.innerWidth, window.innerHeight);

  document.body.appendChild(renderer.domElement);
  
  // prepare controls
  points = new THREE.Points(geometry, material);
  scene.add(points);

  socket.on('addPoint', function (pointOb) {
    addPoint(pointOb);
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