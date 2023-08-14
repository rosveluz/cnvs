const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 32;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

function createRing(radius, zIndex, opacity) {
  const geometry = new THREE.TorusGeometry(radius, 0.01, 12, 100);
  const material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: opacity });
  const torus = new THREE.Mesh(geometry, material);
  torus.position.z = zIndex;
  return torus;
}

const numRays = 62;
const innerRadius = 4;
const numRings = 128;
const outerRadius = 256;

const manualZIndexes = {
  0: -36,
  1: -28,
  2: -21,
  3: -15,
  4: -10,
  5: -6,
  6: -3,
  7: -1
};

// Custom shader material
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader: `
    attribute float gradientValue;
    varying float vGradient;
    void main() {
      vGradient = gradientValue;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying float vGradient;
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, vGradient);
    }
  `,
  transparent: true,
});

const fullyOpaqueRing = 32;
const totalRingsForGradient = fullyOpaqueRing - 1;
const positions = [];
const gradientValues = [];

for (let i = 0; i < numRings; i++) {
  let t = i / (numRings - 1);
  let radius = innerRadius + t * (outerRadius - innerRadius);
  let zIndex = 0;
  if (manualZIndexes.hasOwnProperty(i)) {
    zIndex = manualZIndexes[i];
  }

  const gradient = i <= fullyOpaqueRing ? i / totalRingsForGradient : 1;
  const ring = createRing(radius, zIndex, gradient);
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
      positions.push(...startPoint.toArray(), ...endPoint.toArray());

      const gradientStart = gradient;
      const gradientEnd = (i + 1) <= fullyOpaqueRing ? (i + 1) / totalRingsForGradient : 1;
      gradientValues.push(gradientStart, gradientEnd);
    }
  }
}

const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.setAttribute('gradientValue', new THREE.Float32BufferAttribute(gradientValues, 1));
const lines = new THREE.LineSegments(geometry, shaderMaterial);
scene.add(lines);

// Define the y offset for the entire scene
const sceneYOffset = 8; // Change this value to adjust the y-position

// Apply the y offset to all objects within the scene
scene.traverse(function(object) {
  object.position.y += sceneYOffset;
});

scene.rotation.x = -45 * Math.PI / 180;

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
