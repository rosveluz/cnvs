let particles = [];

// Function to create a single particle
function createParticle() {
    particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 2,
        directionX: 0,
        directionY: 0,
        originalSize: Math.random() * 8 + 2
    });
}

// Create particles at random intervals between 100ms to 1000ms
function createParticles() {
    let interval = Math.random() * 900 + 100;
    setTimeout(() => {
        createParticle();
        if (particles.length < 100) createParticles();
    }, interval);
}

function updateParticles() {
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    particles = particles.filter((particle) => {
        let directionX = (centerX - particle.x) * 0.01;
        let directionY = (centerY - particle.y) * 0.01;

        particle.x += directionX;
        particle.y += directionY;
        particle.size -= 0.05;

        // Calculate distance to center
        let distance = Math.sqrt((particle.x - centerX) ** 2 + (particle.y - centerY) ** 2);

        // Remove particle if size is less than or equal to 0, or if it reaches the center
        return particle.size > 0 && distance > 5;
    });
}



function drawParticles() {
    particles.forEach((particle) => {
        let gradient = ctx.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            particle.size
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    });
}

createParticles();
