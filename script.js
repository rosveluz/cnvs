const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 32;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createRing(radius, zIndex) {
  const geometry = new THREE.TorusGeometry(radius, 0.01, 12, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.z = zIndex;
  return torus;
}

const numRays = 64;
const innerRadius = 4;
const numRings = 128;
const outerRadius = 256;

const manualZIndexes = {
  0: -36, // Adjust z-index for ring 2
  1: -28, // Adjust z-index for ring 2
  2: -21, // Adjust z-index for ring 2
  3: -15, // Adjust z-index for ring 3
  4: -10, // Adjust z-index for ring 4
  5: -6, // Adjust z-index for ring 5
  6: -3, // Adjust z-index for ring 6
  7: -1 // Adjust z-index for ring 7
};

for (let i = 0; i < numRings; i++) {
  let t = i / (numRings - 1);
  let radius = innerRadius + t * (outerRadius - innerRadius);

  let zIndex = 0;
  if (manualZIndexes.hasOwnProperty(i)) {
    zIndex = manualZIndexes[i];
  }

  const ring = createRing(radius, zIndex);
  scene.add(ring);

  if (i < numRings - 1) {
    let nextT = (i + 1) / (numRings - 1);
    let nextRadius = innerRadius + nextT * (outerRadius - innerRadius);
    let nextZIndex = 0;
    if (manualZIndexes.hasOwnProperty(i + 1)) {
      nextZIndex = manualZIndexes[i + 1];
    }

    for (let j = 0; j < numRays; j++) {
      const angle = (j / numRays) * 2 * Math.PI;
      const startPoint = new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), zIndex);
      const endPoint = new THREE.Vector3(nextRadius * Math.cos(angle), nextRadius * Math.sin(angle), nextZIndex);

      const geometry = new THREE.BufferGeometry().setFromPoints([startPoint, endPoint]);
      const material = new THREE.LineBasicMaterial({ color: 0xFFFFFF });
      const ray = new THREE.Line(geometry, material);
      scene.add(ray);
    }
  }
}

// Define the y offset for the entire scene
const sceneYOffset = 8; // Change this value to adjust the y-position

// Apply the y offset to all objects within the scene
scene.traverse(function(object) {
  object.position.y += sceneYOffset;
});

scene.rotation.x = -45 * Math.PI / 180;
