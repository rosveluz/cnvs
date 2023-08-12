// The particle group
const particleGroup = new THREE.Group();
scene.add(particleGroup);

const particles = [];

// Function to create particles
function createParticle() {
  const angle = Math.random() * Math.PI * 2;
  const radius = outerRadius + 10; // Adjust as needed
  particles.push(new THREE.Vector3(radius * Math.cos(angle), radius * Math.sin(angle), Math.random() * 12 + 6));
}

// Function to draw particles
function drawParticles() {
  const material = new THREE.PointsMaterial({ size: 2, color: 0xFFFFFF });
  const geometry = new THREE.BufferGeometry().setFromPoints(particles);
  particleGroup.clear(); // Clear previous particles
  const pointCloud = new THREE.Points(geometry, material);
  particleGroup.add(pointCloud); // Add new particles
}

let frameCount = 0;

function animateParticles() {
  let centerX = 0;
  let centerY = 0;

  if (frameCount % 60 === 0 && particles.length < 10000) { // Create new particle every 10 frames
    createParticle();
  }

  particles.forEach((particle) => {
    let directionX = (centerX - particle.x) * 0.01;
    let directionY = (centerY - particle.y) * 0.01;
    particle.x += directionX;
    particle.y += directionY;
    particle.z -= 0.05;
  });

  drawParticles();
}

function animate() {
  frameCount++; // Increment frameCount
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
