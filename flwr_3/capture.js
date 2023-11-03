/* capture.js */

const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");

// Part 1: Capture the canvas and background
export async function captureCanvasAndBackground() {
    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = 1080;
    finalCanvas.height = 1080;
    const ctx = finalCanvas.getContext('2d');

    // Draw the background color
    const backgroundColor = window.getComputedStyle(document.querySelector('.main-container')).backgroundColor;
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, 1080, 1080);

    // Draw the current generated image in the center
    const flowerCanvas = document.getElementById('myCanvas');
    ctx.drawImage(flowerCanvas, (1080 - 400) / 2, (1080 - 400) / 2, 400, 400);

    // Save the result canvas as an image
    const finalImage = finalCanvas.toDataURL("image/png");

    const imageData = await captureCanvasAndBackground();
    
    // Set the captured image source to the modal and show the modal
    modalImage.src = finalImage;
    modal.style.display = "flex";  // This line will trigger the modal to show up

    return finalImage;
}

// Part 2: Set up the countdown timer and capture functionality
function setupCaptureTimer() {
    const timerDiv = document.getElementById('timer');
    const buttonText = document.getElementById('button-text');
    let counter = 5;  // 5 seconds

    const interval = setInterval(() => {
        if (counter <= 0) {
            clearInterval(interval);
            captureCanvasAndBackground();
            timerDiv.textContent = '';
            buttonText.textContent = 'Capture Timer';
            return;
        }

        timerDiv.textContent = counter;
        counter--;
    }, 1000);
}

document.getElementById('counterButton').addEventListener('click', () => {
    setupCaptureTimer();
});

// Close the modal if clicked outside the content
window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};