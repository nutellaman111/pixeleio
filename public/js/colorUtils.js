function getRandomHslColor(maxLuminance) {
    // Ensure the luminance threshold is between 0 and 100
    maxLuminance = Math.max(0, Math.min(100, maxLuminance));

    // Generate random hue and saturation values
    const h = Math.floor(Math.random() * 360); // Hue: 0 to 360
    const s = Math.floor(Math.random() * 100); // Saturation: 0 to 100

    // Generate luminance ensuring it's below the threshold
    const l = Math.floor(Math.random() * maxLuminance); // Lightness: 0 to maxLuminance

    return {
        h: h,
        s: s,
        l: l
    };
}


function hexToHsl(hex) {
    let r = 0, g = 0, b = 0;
    // 3 digits
    if (hex.length === 4) {
        r = parseInt(hex[1] + hex[1], 16);
        g = parseInt(hex[2] + hex[2], 16);
        b = parseInt(hex[3] + hex[3], 16);
    }
    // 6 digits
    else if (hex.length === 7) {
        r = parseInt(hex[1] + hex[2], 16);
        g = parseInt(hex[3] + hex[4], 16);
        b = parseInt(hex[5] + hex[6], 16);
    }
    
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    
    let h, s;
    if (max === min) {
        h = s = 0; // achromatic
    } else {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    
    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
    };
}

function hslToHex({ h, s, l }) {
    s /= 100;
    l /= 100;
    
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));

    return `#${[0, 8, 4].map(f).map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')}`;
}


function adjustLuminance(hsl, min, max) {
    min = Math.max(0, Math.min(100, min));
    max = Math.max(0, Math.min(100, max));

    // Calculate the target luminance, which is within the min and max bounds
    const targetLuminance = Math.max(min, Math.min(max, hsl.l));

    return {
        h: hsl.h,
        s: hsl.s,
        l: targetLuminance
    };
}