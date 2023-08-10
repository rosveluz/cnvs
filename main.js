const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
let blackholeActive = true;
let cursors = [];

window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        blackholeActive = !blackholeActive;
    }
});

setInterval(() => {
    if (blackholeActive) {
        cursors.push({ x: mouse.x, y: mouse.y, size: 10 });
    }
}, 1000 / 32);

function drawCursor(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y + size * 1.5);
    ctx.lineTo(x + size * 0.7, y + size * 1.5);
    ctx.lineTo(x + size * 0.3, y + size * 1.1);
    ctx.lineTo(x + size * 0.3, y + size * 0.3);
    ctx.fillStyle = 'white';
    ctx.fill();
    ctx.stroke();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let centerX = canvas.width / 2;
    let centerY = canvas.height / 2;

    if (blackholeActive) {
        updateParticles();
        drawParticles();
        cursors = cursors.filter((cursor, index) => {
            let directionX = (centerX - cursor.x) * 0.05;
            let directionY = (centerY - cursor.y) * 0.05;
            cursor.x += directionX;
            cursor.y += directionY;
            let distance = Math.sqrt((cursor.x - centerX) ** 2 + (cursor.y - centerY) ** 2);
            cursor.size -= distance * 0.001;
            drawCursor(cursor.x, cursor.y, cursor.size);
            return cursor.size > 0;
        });
    } else {
        drawCursor(mouse.x, mouse.y, 10);
    }

    let blackHoleSize = 120;

    ctx.beginPath();
    ctx.arc(centerX, centerY, blackHoleSize, 0, 2 * Math.PI);
    ctx.fillStyle = 'black';
    ctx.shadowColor = 'white';
    ctx.shadowBlur = 15; // Adjust the blur to your liking
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow blur for other drawings

    requestAnimationFrame(draw);
}

draw();
