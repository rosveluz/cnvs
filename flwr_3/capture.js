// capture.js

import { auth } from './auth.js';
import { saveImageAndEmail } from './send.js';

const modal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const emailForm = document.getElementById('emailForm');
const printButton = document.getElementById('printButton');
const timerDiv = document.getElementById('timer');
const buttonText = document.getElementById('button-text');

// Function to reset UI elements for a new session
function resetSession() {
    // Reset the email form fields
    emailForm.reset();

    // Reset the button text
    printButton.textContent = 'Send Generated Flower';
    printButton.disabled = false; // Re-enable the button if it was disabled

    // Close the modal
    modal.style.display = 'none';
}

// Part 1: Capture the canvas and background
async function captureCanvasAndBackground() {
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
    
    // Set the captured image source to the modal and show the modal
    modalImage.src = finalImage;
    modal.style.display = "flex";
}

// Part 2: Set up the countdown timer and capture functionality
function setupCaptureTimer() {
    let counter = 5; // 5 seconds countdown

    // Temporarily clear the button text while the timer is running
    buttonText.textContent = '';

    const interval = setInterval(async () => {
        if (counter <= 0) {
            clearInterval(interval);
            buttonText.textContent = 'Capture Timer'; // Reset to original text
            timerDiv.textContent = ''; // Clear the timer display
            await captureCanvasAndBackground(); // Display the modal with the image
            return;
        }

        // Update the timer display
        timerDiv.textContent = `Capture in ${counter}...`;
        counter--;
    }, 1000);
}

// Event listeners
document.getElementById('counterButton').addEventListener('click', setupCaptureTimer);

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = "none";
    }
};

printButton.addEventListener('click', async () => {
    const emailAddress = emailForm.email.value;
    const finalImage = modalImage.src;

    // Check if a user is signed in
    if (!auth.currentUser) {
        console.error("No user is signed in.");
        return;
    }

    // Prevent double submission
    if (printButton.disabled) {
        return;
    }

    // Disable the button to prevent multiple sends
    printButton.disabled = true;
    printButton.textContent = 'Sending...';

    try {
        await saveImageAndEmail(finalImage, emailAddress);
        // Indicate to the user that the image was sent
        printButton.textContent = 'Image Sent';
        // Reset session after a short delay
        setTimeout(resetSession, 2000);
    } catch (error) {
        console.error("Error sending email: ", error);
        resetSession();
    }
});
