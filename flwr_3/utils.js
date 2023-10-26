export function getAverageColor(src, region) {
    const colorCanvas = document.getElementById('color-detection');
    const context = colorCanvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(src, 0, 0, src.width, src.height);

    // Ensuring the values are valid
    region.x = Math.max(0, Math.round(region.x));
    region.y = Math.max(0, Math.round(region.y));
    region.width = Math.round(region.width);
    region.height = Math.round(region.height);

    try {
        const data = context.getImageData(region.x, region.y, region.width, region.height).data;

        let red = 0, green = 0, blue = 0, count = 0;

        for (let i = 0; i < data.length; i += 4) {
            red += data[i];
            green += data[i + 1];
            blue += data[i + 2];
            count++;
        }

        red = Math.round(red / count);
        green = Math.round(green / count);
        blue = Math.round(blue / count);

        return `rgb(${red}, ${green}, ${blue})`;
    } catch (err) {
        console.error('Error getting image data:', err);
    }
}

export function rgbToColorName(r, g, b) {
    const colors = {
        "White": [255, 255, 255],
        "Black": [0, 0, 0],
        "Red": [255, 0, 0],
        "Green": [0, 255, 0],
        "Blue": [0, 0, 255],
        "Yellow": [255, 255, 0],
        "Magenta": [255, 0, 255],
        "Cyan": [0, 255, 255],
        "Purple": [128, 0, 128],
        "Pink": [255, 192, 203],
        "Orange": [255, 165, 0],
        "Brown": [165, 42, 42],
        "Gray": [128, 128, 128],
        "LightGreen": [144, 238, 144],
        "DarkBlue": [0, 0, 139],
        "Lavender": [230, 230, 250],
        "Olive": [128, 128, 0],
        "Beige": [245, 245, 220],
        "Maroon": [128, 0, 0],
        "Navy": [0, 0, 128],
        
        // "LightGray": [211, 211, 211],
        // "Silver": [192, 192, 192],
        // "DarkGray": [169, 169, 169],
        // "SlateGray": [112, 128, 144],
        // "DimGray": [105, 105, 105],
        // "Gainsboro": [220, 220, 220],
        // "AshGray": [178, 190, 181],

        // Off-White shades
        "Snow": [255, 250, 250],
        "Honeydew": [240, 255, 240],
        "MintCream": [245, 255, 250],
        "Azure": [240, 255, 255],
        "Ivory": [255, 255, 240],
        "FloralWhite": [255, 250, 240],
        "AntiqueWhite": [250, 235, 215],
        "Linen": [250, 240, 230],
        "LavenderBlush": [255, 240, 245],

        // Additional Reds
        "Crimson": [220, 20, 60],
        "DarkRed": [139, 0, 0],
        "FireBrick": [178, 34, 34],
        "LightCoral": [240, 128, 128],
        "IndianRed": [205, 92, 92],

        // Additional Blues
        "RoyalBlue": [65, 105, 225],
        "MediumBlue": [0, 0, 205],
        "SkyBlue": [135, 206, 235],
        "SteelBlue": [70, 130, 180],
        "PowderBlue": [176, 224, 230],

        // Additional Greens
        "ForestGreen": [34, 139, 34],
        "DarkGreen": [0, 100, 0],
        "SeaGreen": [46, 139, 87],
        "LightGreen": [144, 238, 144],
        "LimeGreen": [50, 205, 50],
        "PaleGreen": [152, 251, 152],
        "MediumSeaGreen": [60, 179, 113]
    };

    let closestColor = "Unknown";
    let minDistance = Infinity;

    for (const colorName in colors) {
        const color = colors[colorName];
        const distance = Math.sqrt((r - color[0]) ** 2 + (g - color[1]) ** 2 + (b - color[2]) ** 2);

        if (distance < minDistance) {
            minDistance = distance;
            closestColor = colorName;
        }
    }

    return closestColor;
}

export function rgbToLab(red, green, blue) {
    // Step 1: Convert RGB to range 0-1
    red /= 255;
    green /= 255;
    blue /= 255;

    // Step 2: Convert RGB to XYZ
    var r = (red > 0.04045) ? Math.pow((red + 0.055) / 1.055, 2.4) : red / 12.92;
    var g = (green > 0.04045) ? Math.pow((green + 0.055) / 1.055, 2.4) : green / 12.92;
    var b = (blue > 0.04045) ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92;

    var X = r * 0.4124564 + g * 0.3575761 + b * 0.1804375;
    var Y = r * 0.2126729 + g * 0.7151522 + b * 0.0721750;
    var Z = r * 0.0193339 + g * 0.1191920 + b * 0.9503041;

    X = X * 100;
    Y = Y * 100;
    Z = Z * 100;

    // Step 3: Convert XYZ to Lab
    X /= 95.047;
    Y /= 100.000;
    Z /= 108.883;

    var fx = (X > 0.008856) ? Math.pow(X, 1/3) : (903.3 * X + 16) / 116;
    var fy = (Y > 0.008856) ? Math.pow(Y, 1/3) : (903.3 * Y + 16) / 116;
    var fz = (Z > 0.008856) ? Math.pow(Z, 1/3) : (903.3 * Z + 16) / 116;

    var L = (116 * fy) - 16;
    var a = 500 * (fx - fy);
    var bLab = 200 * (fy - fz);

    return [L, a, bLab];
}