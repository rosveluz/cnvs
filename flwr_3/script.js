const video = document.getElementById("video");
const faceExpressionDisplay = document.getElementById('faceExpression');
const colorDisplay = document.getElementById('colorDetection');

faceExpressionDisplay.style.color = 'white';
colorDisplay.style.color = 'white';

let offscreenCanvas = document.createElement('canvas');

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
    faceapi.nets.faceExpressionNet.loadFromUri('./models')
]).then(startWebcam);

function startWebcam() {
    navigator.mediaDevices
    .getUserMedia({
        video: {
            width: { exact: 160 },
        },
        audio: false,
    })
    .then((stream) => {
        video.srcObject = stream;
    })
    .catch((error) => {
        console.error(error);
    });
}

function drawRegionOnCanvas(context, region) {
    context.strokeStyle = "yellow";
    context.lineWidth = 1;
    context.strokeRect(region.x, region.y, region.width, region.height);
}

function getColorName(r, g, b) {
    let colorNamer = window.namer || window.colorNamer;
    if (colorNamer) {
        let colors = colorNamer(`rgb(${r},${g},${b})`);
        return colors.roygbiv[0].name;
    }
    return 'Unknown';
}

// Register colors only once
tracking.ColorTracker.registerColor('red', function(r, g, b) {
    return r > (g + b) && r > 50;
});
tracking.ColorTracker.registerColor('green', function(r, g, b) {
    return g > (r + b) && g > 50;
});
tracking.ColorTracker.registerColor('blue', function(r, g, b) {
    return b > (r + g) && b > 50;
});
let tracker = new tracking.ColorTracker(['red', 'green', 'blue']);

video.addEventListener('play', () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;
    offscreenCanvas.width = video.videoWidth;
    offscreenCanvas.height = video.videoHeight;

    const videoContainer = document.getElementById('video-container');
    videoContainer.append(canvas);

    const landmarkDrawOptions = {
        lineWidth: .2,
        drawLines: true,
        color: 'white'
    };

    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

        const scaleFactor = video.offsetWidth / video.videoWidth;
        const resizedDetections = faceapi.resizeResults(detections, { width: video.offsetWidth, height: video.offsetHeight });
        
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections, landmarkDrawOptions);

        for (let detection of detections) {
            let maxExpressionValue = Math.max(...Object.values(detection.expressions));
            let dominantExpression = Object.keys(detection.expressions).find(expression => detection.expressions[expression] === maxExpressionValue);
            faceExpressionDisplay.textContent = dominantExpression;

            let box = detection.detection.box;
            let heightBelowFace = box.height * 0.5;
            let clothingRegion = {
                x: box.x,
                y: box.y + box.height * 1.75,
                width: box.width,
                height: heightBelowFace
            };
            
            drawRegionOnCanvas(canvas.getContext('2d'), clothingRegion);
            
            let dominantColorRGB = extractDominantColor(video, clothingRegion);
            let colorName = getColorName(dominantColorRGB.r, dominantColorRGB.g, dominantColorRGB.b);
            colorDisplay.textContent = colorName;
        }
    }, 500);
});

function extractDominantColor(video, region) {
    if (!video.videoWidth || !video.videoHeight || region.width <= 0 || region.height <= 0) {
        return { r: 0, g: 0, b: 0 };
    }
    
    let ctx = offscreenCanvas.getContext('2d', { willReadFrequently: true });
    
    // Only draw the region of interest to the offscreenCanvas
    ctx.drawImage(video, region.x, region.y, region.width, region.height, 0, 0, offscreenCanvas.width, offscreenCanvas.height);

    let dominantColorRGB = { r: 0, g: 0, b: 0 };
    
    tracker.on('track', function(event) {
        let dominantColor;
        let dominantSize = 0;
        event.data.forEach(function(rect) {
            let currentSize = rect.width * rect.height;
            if (currentSize > dominantSize) {
                dominantSize = currentSize;
                dominantColor = rect.color;
            }
        });
        if (dominantColor) {
            switch (dominantColor) {
                case 'red':
                    dominantColorRGB = { r: 255, g: 0, b: 0 };
                    break;
                case 'green':
                    dominantColorRGB = { r: 0, g: 255, b: 0 };
                    break;
                case 'blue':
                    dominantColorRGB = { r: 0, g: 0, b: 255 };
                    break;
            }
        }
    });

    tracking.track(offscreenCanvas, tracker, { region: [0, 0, offscreenCanvas.width, offscreenCanvas.height] });

    return dominantColorRGB;
}
