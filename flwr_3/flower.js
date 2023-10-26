const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const GLOBAL_DELAY = 500;  // Delay in milliseconds (e.g., 500ms or 0.5 seconds)

import { getAverageColor } from './utils.js';


let previousExpression = null;

canvas.width = canvas.width;
canvas.height = canvas.height;

let avgColor;
let animationStarted = false;

let number = 0;
let angle = 0;

function getPetalCount(expression) {
    console.log("Expression received:", expression);
    switch (expression) {
        case 'sad':
        case 'angry':
        case 'disgusted':
            return 4;
        case 'neutral':
            return 7;
        case 'happy':
        case 'surprised':
            return Math.floor(Math.random() * 17) + 8;
        default:
            return 8;
    }
}

function getLineWidth(expression) {
    switch (expression) {
        case 'sad':
        case 'angry':
        case 'disgusted':
            return 32;
        case 'neutral':
            return 16;
        case 'happy':
        case 'surprised':
            return 4;
        default:
            return 8; // Default line width (or whatever value you think is best)
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
    if (!animationStarted) {
        return;
    }

    if (!lastTime) {
        lastTime = currentTime;
    }

    if (currentTime - lastTime >= animationDelay) {
        if (number < maxPetals) {
            const harmonyColors = computeQuadraticHarmony(avgColor);
            const strokeColor = harmonyColors.harmony2; // Using harmony2 as an example for the stroke
            angle = drawPetal(ctx, canvas, avgColor, strokeColor, angle, maxPetals, previousExpression);
            number++;
            lastTime = currentTime;
        } else {
            animationStarted = false;
            return;
        }
    }

    requestAnimationFrame(animate);
}


export function startFlowerAnimation(avgColorRgb, expression) {
    console.log("About to start flower animation with expression:", expression);
    
    setTimeout(() => {
        avgColor = avgColorRgb;

        if (expression === previousExpression) {
            return;
        }

        if (!animationStarted) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            number = 0;
            maxPetals = getPetalCount(expression);

            console.log("Number of petals to draw:", maxPetals);

            let angularSpacing = (2 * Math.PI) / maxPetals;
            let offsetAngle = (maxPetals % 2 === 1) ? angularSpacing / 2 : 0;

            angle = offsetAngle;
            lastTime = 0;
            animationStarted = false;
            number = 0;
            angle = 0;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            animationStarted = true;
            requestAnimationFrame(animate);
        }

        previousExpression = expression;

        // Call updateContainerColor right after avgColor has been updated.
        updateContainerColor();
    }, GLOBAL_DELAY);
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

// Whenever avgColor changes, you can call the updateContainerColor function
// updateContainerColor();
