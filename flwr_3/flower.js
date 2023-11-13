// flower.js

// A function to call when you want to wait for the expression to stabilize
function debounce(func, wait, immediate) {
    var timeout;
    return function() {
        var context = this, args = arguments;
        var later = function() {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
};

// Use it to wrap your expression change handler
const debouncedStartFlowerAnimation = debounce((avgColorRgb, detectedExpression) => {
    startFlowerAnimation(avgColorRgb, detectedExpression);
}, 250); // Wait for 250ms of no expression change before triggering the animation

const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const GLOBAL_DELAY = 500;  // Delay in milliseconds (e.g., 500ms or 0.5 seconds)

import { getAverageColor } from './utils.js';

let previousExpression = null;
canvas.width = 400;
canvas.height = 400;

let avgColor;
let animationStarted = false;

let number = 0;
let angle = 0;

function getPetalCount(expression) {
    // Ensure that expression is a string and trim it
    if (typeof expression !== 'string') {
        throw new Error('Expression must be a string.');
    }
    expression = expression.trim().toLowerCase();

    console.log("Expression received:", expression);

    switch (expression) {
        case 'sad':
        case 'angry':
        case 'disgusted':
            return Math.floor(Math.random() * (9 - 4 + 1)) + 4; // Random between 4 and 9
        case 'neutral':
            return Math.floor(Math.random() * (16 - 10 + 1)) + 10; // Random between 10 and 16
        case 'happy':
        case 'surprised':
            return Math.floor(Math.random() * (32 - 17 + 1)) + 17; // Random between 17 and 32
        default:
            console.log("Expression not recognized, defaulting to 8.");
            return 12;
    }
}

function getLineWidth(expression) {
    if (typeof expression !== 'string') {
        throw new Error('Expression must be a string.');
    }
    expression = expression.trim().toLowerCase();

    switch (expression) {
        case 'sad':
        case 'angry':
        case 'disgusted':
            return Math.floor(Math.random() * (32 - 28 + 1)) + 28; // Random between 17 and 32
        case 'neutral':
            return Math.floor(Math.random() * (16 - 10 + 1)) + 10; // Random between 10 and 16
        case 'happy':
        case 'surprised':
            return Math.floor(Math.random() * (9 - 4 + 1)) + 4; // Random between 4 and 9
        default:
            console.log("Expression not recognized, defaulting to 8.");
            return 8; // Default line width remains the same
    }
}

function getInverseColor(color) {
    let rgb = color.match(/\d+/g);
    return `rgb(${255 - rgb[0]}, ${255 - rgb[1]}, ${255 - rgb[2]})`;
}

function drawPetal(ctx, canvas, avgColor, strokeColor, angle, maxPetals, expression) {
    ctx.globalCompositeOperation = 'screen';

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const controlDistance = canvas.width / 3;
    const endPointDistance = canvas.width / 2 * 0.9;

    const controlX1 = centerX + controlDistance * Math.sin(angle + Math.PI / 6);
    const controlY1 = centerY + controlDistance * Math.cos(angle + Math.PI / 6);
    const controlX2 = centerX + controlDistance * Math.sin(angle - Math.PI / 6);
    const controlY2 = centerY + controlDistance * Math.cos(angle - Math.PI / 6);
    const endX = centerX + endPointDistance * Math.sin(angle);
    const endY = centerY + endPointDistance * Math.cos(angle);

    ctx.fillStyle = avgColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = getLineWidth(expression);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.quadraticCurveTo(controlX1, controlY1, endX, endY);
    ctx.quadraticCurveTo(controlX2, controlY2, centerX, centerY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    return angle + (2 * Math.PI) / maxPetals;
}

let maxPetals = 8;
let animationDelay = 50;
let lastTime = 0;

function animate(currentTime) {
    // Check for the start condition of the animation
    if (!animationStarted) {
        return;
    }

    // Calculate the elapsed time to manage frame rate
    if (!lastTime) {
        lastTime = currentTime;
    }

    if (currentTime - lastTime >= animationDelay) {
        if (number < maxPetals) {
            // Calculate strokeColor based on avgColor
            const harmonyColors = computeQuadraticHarmony(avgColor);
            const strokeColor = harmonyColors.harmony2;
            angle = drawPetal(ctx, canvas, avgColor, strokeColor, angle, maxPetals, previousExpression);
            number++;
            lastTime = currentTime;
        } else {
            // Reset animation once all petals have been drawn
            animationStarted = false;
            previousExpression = null; // Reset the previousExpression to allow new animations
            return;
        }
    }

    requestAnimationFrame(animate);
}

export function startFlowerAnimation(avgColorRgb, expression) {
    // Only attempt to start a new animation if the expression has changed
    if (expression !== previousExpression) {
        setTimeout(() => {
            previousExpression = expression;
            avgColor = avgColorRgb;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            number = 0;
            maxPetals = getPetalCount(expression);
            let angularSpacing = (2 * Math.PI) / maxPetals;
            let offsetAngle = (maxPetals % 2 === 1) ? angularSpacing / 2 : 0;
            angle = offsetAngle;
            lastTime = 0;
            animationStarted = true;
            requestAnimationFrame(animate);
            updateContainerColor();
        }, GLOBAL_DELAY);
    } else {
        console.log("Expression has not changed, no need to redraw.");
    }
}

// Placeholder for rgbToLab function
function rgbToLab(r, g, b) {
    // TODO: Implement or integrate a proper function to convert RGB to Lab.
    return [r, g, b]; 
}

function computeQuadraticHarmony(rgbColor) {
    let [L, a, b] = rgbToLab(...rgbColor.match(/\d+/g).map(Number));

    // Slight shifts to derive the two harmonious colors
    let harmony1 = [L, a + 10, b];
    let harmony2 = [L, a, b + 10];

    // Convert harmonious Lab colors back to RGB. This is a simplistic placeholder.
    // TODO: Integrate a function or library to convert Lab back to RGB.
    harmony1 = `rgb(${harmony1[0]}, ${harmony1[1]}, ${harmony1[2]})`;
    harmony2 = `rgb(${harmony2[0]}, ${harmony2[1]}, ${harmony2[2]})`;

    return {
        main: rgbColor,
        harmony1,
        harmony2
    };
}

function updateContainerColor() {
    if (!avgColor) {
        console.error("avgColor is not defined or set!");
        return;
    }
    const harmony = computeQuadraticHarmony(avgColor);
    console.log(harmony);
    const mainContainer = document.querySelector(".main-container");
    mainContainer.style.backgroundColor = harmony.harmony1; // Using harmony1 as an example
}


// Make sure to replace any direct calls to startFlowerAnimation with debouncedStartFlowerAnimation in your code.
// debouncedStartFlowerAnimation(avgColor, expression);
