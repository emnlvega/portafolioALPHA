import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';
import { designCells } from '../interactions.js';

let mobileLettersImage = null;

function applyColorToMobileImage(img, color) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = function() {
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;
        
        ctx.drawImage(tempImg, 0, 0);
        
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        img.src = canvas.toDataURL();
    };
    tempImg.src = img.src;
}

function createMobileLettersImage() {
    const container = document.getElementById('grid-container');
    if (!container) return null;
    
    removeMobileLettersImage();
    
    const img = document.createElement('img');
    img.src = './assets/images/lettersM.png';
    img.style.position = 'absolute';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.zIndex = '99999';
    img.style.opacity = '1';
    img.style.pointerEvents = 'none';
    img.id = 'mobile-letters-image';
    

    const cell = designCells.find(c => 
        parseInt(c.dataset.designRow) === 13 && 
        parseInt(c.dataset.designCol) === 4
    );
    
    if (cell) {
        const x = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
        const y = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.transform = 'none';
    } else {
        img.style.left = '0';
        img.style.top = '0';
        img.style.transform = 'none';
    }
    
    img.onerror = function() {
        console.error('Error loading letters.png from:', img.src);
    };
    
    container.appendChild(img);
    

    applyColorToMobileImage(img, CONFIG.COLORS.primary);
    
    return img;
}

function removeMobileLettersImage() {
    const existingImage = document.getElementById('mobile-letters-image');
    if (existingImage) {
        existingImage.remove();
    }
    mobileLettersImage = null;
}

export function renderMobileHome() {
    const container = document.getElementById('grid-container');
    if (!container) {
        return;
    }
    
    document.querySelectorAll('.mobile-home-content, .mobile-nav-btn, .mobile-btn-overlay').forEach(el => el.remove());
    

    mobileLettersImage = createMobileLettersImage();
    
    fetch('./modules/mobile/logo-movil.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: No se pudo cargar logo-movil.json`);
            return response.json();
        })
        .then(design => {
            stopRandomAnimations();
            resetGrid(false);
            
            importDesignFromJSON(design, () => {
                createMobileNavButtons('inicio');
            }, true);
        })
        .catch(err => {
            stopRandomAnimations();
            resetGrid(false);
            importDesignFromJSON({}, () => {
                createMobileNavButtons('inicio');
            }, true);
        });
}

export function removeMobileHomeLetters() {
    removeMobileLettersImage();
}


document.addEventListener('colorsUpdated', function(e) {
    const { colors } = e.detail;
    const existingImage = document.getElementById('mobile-letters-image');
    if (existingImage) {
        applyColorToMobileImage(existingImage, colors.primary);
    }
});