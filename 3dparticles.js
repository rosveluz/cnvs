const particleGroup = new THREE.Group();
scene.add(particleGroup);

const particles = [];

let twirlIntensity = 0.02; // Intensity of the twirl, adjust as needed
let twirlSpeed = 0.02; // Speed of the twirl, adjust as needed

function setTwirlIntensity(intensity) {
  twirlIntensity = intensity;
}

function setTwirlSpeed(speed) {
  twirlSpeed = speed;
}

function createGlowTexture(color) {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  gradient.addColorStop(0, `rgba(${color.r * 255}, ${color.g * 255}, ${color.b * 255}, 1)`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(canvas);
}

function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const radius = outerRadius + 10;
  const position = new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), Math.random() * 12 + 6);

  const geometry = new THREE.SphereGeometry(1, 32, 32);
  const hue = Math.random();
  const saturation = Math.random();
  const lightness = 0.6 + Math.random() * 0.4;
  const color = new THREE.Color();
  color.setHSL(hue, saturation, lightness);

  const material = new THREE.MeshBasicMaterial({ color });
  const particleMesh = new THREE.Mesh(geometry, material);
  particleMesh.position.copy(position);
  particleGroup.add(particleMesh);

  const glowGeometry = new THREE.PlaneGeometry(12, 12);
  const glowTexture = createGlowTexture(color);
  const glowMaterial = new THREE.MeshBasicMaterial({
    map: glowTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
  particleMesh.add(glowMesh);

  const twirlDirection = Math.random() < 0.5 ? 1 : -1; // Random twirl direction

  particles.push({ mesh: particleMesh, scale: 1, twirlDirection }); // Include twirlDirection
}

// Function to animate particles
function animateParticles() {
  particles.forEach((particle, index) => {
    let directionX = (0 - particle.mesh.position.x) * 0.01;
    let directionY = (0 - particle.mesh.position.y) * 0.01;
    particle.mesh.position.x += directionX;
    particle.mesh.position.y += directionY;

    // Convert to polar coordinates (radius and angle)
    const radius = Math.sqrt(particle.mesh.position.x ** 2 + particle.mesh.position.y ** 2);
    let angle = Math.atan2(particle.mesh.position.y, particle.mesh.position.x);

    // Twirl motion using twirlDirection
    angle += twirlSpeed * particle.twirlDirection; // Adjust the sign based on twirlDirection

    // Convert back to Cartesian coordinates
    particle.mesh.position.x = radius * Math.cos(angle);
    particle.mesh.position.y = radius * Math.sin(angle);

    particle.mesh.position.z -= 0.05;

    // Check if particle's z-index is between -2 and -72
    if (particle.mesh.position.z <= -2 && particle.mesh.position.z >= -72) {
      // Compute the scale factor based on the z-index
      const t = (particle.mesh.position.z - (-72)) / (2 - (-72)); // Normalize z-index to range [0, 1]
      particle.scale = 0.05 + t * 0.95; // Interpolate between 5% and 100%
      particle.mesh.scale.set(particle.scale, particle.scale, particle.scale);
    }

    // Remove particles that have moved out of view
    if (particle.mesh.position.z < -72) {
      particleGroup.remove(particle.mesh);
      particles.splice(index, 1);
    }
  });
}

let frameCount = 0;

function animate() {
  if (frameCount % 64 === 0 && particles.length < 10000) {
    createParticle();
  }

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
