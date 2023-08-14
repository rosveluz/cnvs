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

function getZIndex(radius) {
    let t = (radius - innerRadius) / (outerRadius - innerRadius);
    let index = Math.floor(t * (numRings - 1));
    let nextIndex = index + 1;

    if (manualZIndexes.hasOwnProperty(index) && manualZIndexes.hasOwnProperty(nextIndex)) {
        let interFactor = (t * (numRings - 1) - index) / (nextIndex - index);
        return manualZIndexes[index] + interFactor * (manualZIndexes[nextIndex] - manualZIndexes[index]);
    }

    return 0;
}

for (let i = 0; i < numRings; i++) {
    let t = i / (numRings - 1);
    let radius = innerRadius + t * (outerRadius - innerRadius);
    let zIndex = getZIndex(radius);
    const ring = createRing(radius, zIndex);
    scene.add(ring);

    if (i < numRings - 1) {
        let nextT = (i + 1) / (numRings - 1);
        let nextRadius = innerRadius + nextT * (outerRadius - innerRadius);
        let nextZIndex = getZIndex(nextRadius);

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

const sceneYOffset = 8;
scene.traverse(function(object) {
    object.position.y += sceneYOffset;
});
scene.rotation.x = -45 * Math.PI / 180;

const particleGroup = new THREE.Group();
scene.add(particleGroup);

const ROTATION_SPEED = .04;
const RADIUS_DECREASE_RATE = 1.2;
const PARTICLE_CREATION_PROBABILITY = 0.05;

const glowMaterial = new THREE.ShaderMaterial({
    transparent: true,
    uniforms: {
        'c': { type: 'f', value: 1 },
        'p': { type: 'f', value: 1.4 },
        glowColor: { type: 'c', value: new THREE.Color(0x00ffaa) },
        viewVector: { type: 'v3', value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize(normalMatrix * normal);
            vec3 vNormel = normalize(normalMatrix * viewVector);
            intensity = pow(c - dot(vNormal, vNormel), p);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4(glow, 1.0);
        }`
});

const particles = [];

function createParticle() {
    const angle = Math.random() * Math.PI * 2;
    const radius = outerRadius;
    const size = Math.random() * 6 + 4;
    const h = Math.random();
    const s = Math.random();
    const l = Math.random();
    const material = new THREE.MeshBasicMaterial({ color: new THREE.Color().setHSL(h, s, l) });
    const geometry = new THREE.SphereGeometry(size, 32, 32);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(radius * Math.cos(angle), radius * Math.sin(angle), Math.random() * 12 + 6);
    const shrinkingSpeed = Math.random() * 0.1 + 0.01;

    const glowGeometry = geometry.clone();
    glowGeometry.scale(1.1, 1.1, 1.1);
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(mesh.position);
    particleGroup.add(glowMesh);

    particles.push({ mesh, glowMesh, size, h, s, l, shrinkingSpeed });
    particleGroup.add(mesh);
}

let frameCount = 0;

const SWIRL_INTENSITY = 0.00;

function getShrinkingRate(radius, zPosition, innerRadius, innerZIndex) {
    const radialFactor = (radius - innerRadius) / (outerRadius - innerRadius);
    const zIndexFactor = (zPosition - innerZIndex) / (outerRadius - innerRadius);
    return radialFactor * zIndexFactor * RADIUS_DECREASE_RATE;
  }
  
  function animateParticles() {
    if (Math.random() < PARTICLE_CREATION_PROBABILITY && particles.length < 100) {
      createParticle();
    }
  
    const innerZIndex = -36; // Z-index position of the innerRadius
  
    particles.forEach((particle, index) => {
      let radius = particle.mesh.position.length();
      let angle = Math.atan2(particle.mesh.position.y, particle.mesh.position.x);
      let zPosition = particle.mesh.position.z;
  
      let shrinkingRate = getShrinkingRate(radius, zPosition, innerRadius, innerZIndex);
  
      radius -= shrinkingRate; // Decreasing radius
      particle.size = Math.max(0.1, particle.size - shrinkingRate); // Decreasing size
  
      if (radius <= innerRadius || particle.size <= 0.1) {
        particleGroup.remove(particle.mesh, particle.glowMesh);
        particles.splice(index, 1);
      } else {
        const newPosition = new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), zPosition - 0.05);
        particle.mesh.position.copy(newPosition);
        particle.glowMesh.position.copy(newPosition);
  
        particle.mesh.geometry = new THREE.SphereGeometry(particle.size, 32, 32);
        particle.glowMesh.geometry = new THREE.SphereGeometry(particle.size * 1.1, 32, 32);
  
        particle.l = 0.5 + 0.2 * Math.sin(frameCount * 0.1);
        particle.mesh.material.color.setHSL(particle.h, particle.s, particle.l);
      }
    });
  }
  


function animate() {
    frameCount++;
    animateParticles();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
