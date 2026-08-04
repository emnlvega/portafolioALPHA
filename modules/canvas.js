import { CONFIG } from './config.js';

const canvas = document.getElementById('mainCanvas');
const ctx = canvas.getContext('2d');
let offscreenCanvas = document.createElement('canvas');
let offscreenCtx = offscreenCanvas.getContext('2d');
let W, H;
let renderRequested = false;

export function resizeCanvas() {
    const dpr = 1;
    W = window.innerWidth;
    H = window.innerHeight;
    
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    
    offscreenCanvas.width = W * dpr;
    offscreenCanvas.height = H * dpr;
    
    ctx.scale(dpr, dpr);
    offscreenCtx.scale(dpr, dpr);
}

function applyCRTEffects(imageData) {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    
    const originalData = new Uint8ClampedArray(data);
    const shift = CONFIG.CRT_CHROMATIC_SHIFT || 2;
    const bloomIntensity = CONFIG.CRT_BLOOM_INTENSITY || 20;
    
    // Aberración cromática
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            
            const rx = Math.min(x + shift, width - 1);
            const ridx = (y * width + rx) * 4;
            data[idx] = originalData[ridx];
            
            data[idx + 1] = originalData[idx + 1];
            
            const lx = Math.max(x - shift, 0);
            const lidx = (y * width + lx) * 4;
            data[idx + 2] = originalData[lidx];
            
            data[idx + 3] = originalData[idx + 3];
        }
    }
    
    // Bloom
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r > 100 && r > g && r > b) {
            const glow = Math.min(255, r + bloomIntensity);
            data[i] = glow;
            data[i + 1] = Math.min(255, g + 5);
            data[i + 2] = Math.min(255, b + 5);
        }
    }
}

export function render(gridContainer) {
    if (renderRequested) return;
    renderRequested = true;
    
    offscreenCtx.clearRect(0, 0, W, H);
    
    offscreenCtx.fillStyle = '#000000';
    offscreenCtx.fillRect(0, 0, W, H);
    
    if (gridContainer) {
        const cells = document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
        cells.forEach(cell => {
            const left = parseFloat(cell.style.left);
            const top = parseFloat(cell.style.top);
            const width = parseFloat(cell.style.width);
            const height = parseFloat(cell.style.height);
            const bgColor = cell.style.backgroundColor || '#000000';
            const borderColor = cell.style.borderColor || '#000000';
            const borderWidth = parseFloat(cell.style.borderWidth) || 1;
            const borderRadius = parseFloat(cell.style.borderRadius) || 4;
            
            if (!isNaN(left) && !isNaN(top) && !isNaN(width) && !isNaN(height)) {
                offscreenCtx.save();
                offscreenCtx.beginPath();
                offscreenCtx.roundRect(left, top, width, height, borderRadius);
                offscreenCtx.fillStyle = bgColor;
                offscreenCtx.fill();
                offscreenCtx.strokeStyle = borderColor;
                offscreenCtx.lineWidth = borderWidth;
                offscreenCtx.stroke();
                offscreenCtx.restore();
            }
        });
    }
    
    const imageData = offscreenCtx.getImageData(0, 0, W, H);
    applyCRTEffects(imageData);
    ctx.putImageData(imageData, 0, 0);
    
    renderRequested = false;
    requestAnimationFrame(() => render(gridContainer));
}

// roundRect polyfill para navegadores que no lo soportan
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
        if (r > w/2) r = w/2;
        if (r > h/2) r = h/2;
        this.moveTo(x + r, y);
        this.lineTo(x + w - r, y);
        this.quadraticCurveTo(x + w, y, x + w, y + r);
        this.lineTo(x + w, y + h - r);
        this.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        this.lineTo(x + r, y + h);
        this.quadraticCurveTo(x, y + h, x, y + h - r);
        this.lineTo(x, y + r);
        this.quadraticCurveTo(x, y, x + r, y);
        return this;
    };
}