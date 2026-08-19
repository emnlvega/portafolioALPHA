

let overlayInterval = null;
let currentIndex = 0;
let imageCount = 0;
let isRunning = false;
let overlayElement = null;
let shuffleOrder = [];


const OVERLAY_CONFIG = {
    INTERVAL: 30000,
    FADE_DURATION: 0,
    FOLDER: 'assets/overlays/',
    EXTENSION: 'jpg',
    BLEND_MODE: 'color-dodge',
    OPACITY: 0.7,
    OPACITY_FIRST: 0.5,
    RANDOM_ORDER: true,
    IMAGE_COUNT: 17
};


export function initOverlays() {
    stopOverlays();
    
    const config = OVERLAY_CONFIG;
    imageCount = config.IMAGE_COUNT;
    
    if (imageCount === 0) {
        return;
    }
    

    let textureEnabled = true;
    try {
        const saved = localStorage.getItem('edesign_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed.textura !== undefined) {
                textureEnabled = parsed.textura;
            }
        }
    } catch (e) {}
    
    shuffleOrder = [];
    if (config.RANDOM_ORDER && imageCount > 1) {
        shuffleOrder.push(0);
        const rest = [];
        for (let i = 1; i < imageCount; i++) {
            rest.push(i);
        }
        const shuffledRest = shuffleArray(rest);
        shuffleOrder = shuffleOrder.concat(shuffledRest);
    } else {
        for (let i = 0; i < imageCount; i++) {
            shuffleOrder.push(i);
        }
    }
    
    if (!overlayElement) {
        overlayElement = document.createElement('div');
        overlayElement.id = 'overlay-container';
        overlayElement.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 9998;
            opacity: ${config.OPACITY};
            mix-blend-mode: ${config.BLEND_MODE};
            background-size: cover;
            background-position: center;
            background-repeat: no-repeat;
            transition: none;
        `;
        document.body.appendChild(overlayElement);
    }
    
    currentIndex = 0;
    loadOverlayImage(0);
    

    if (overlayElement) {
        overlayElement.style.display = textureEnabled ? 'block' : 'none';
    }
    
    startOverlays(config.INTERVAL);
}


function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}


function loadOverlayImage(index) {
    if (!overlayElement || imageCount === 0) return;
    

    const realIndex = shuffleOrder[index % shuffleOrder.length];
    const imageNumber = realIndex + 1;
    
    const imagePath = `${OVERLAY_CONFIG.FOLDER}${imageNumber}.${OVERLAY_CONFIG.EXTENSION}`;
    
    overlayElement.style.transition = 'none';
    overlayElement.style.backgroundImage = `url(${imagePath})`;
    

    if (index === 0) {
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY_FIRST;
    } else {
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
    }
    
    void overlayElement.offsetHeight;
}


function startOverlays(interval) {
    if (isRunning) return;
    isRunning = true;
    
    if (overlayInterval) {
        clearInterval(overlayInterval);
        overlayInterval = null;
    }
    
    overlayInterval = setInterval(() => {
        if (imageCount === 0) return;
        currentIndex = (currentIndex + 1) % shuffleOrder.length;
        loadOverlayImage(currentIndex);
    }, interval);
}


export function stopOverlays() {
    isRunning = false;
    if (overlayInterval) {
        clearInterval(overlayInterval);
        overlayInterval = null;
    }
}


export function pauseOverlays() {
    isRunning = false;
    if (overlayInterval) {
        clearInterval(overlayInterval);
        overlayInterval = null;
    }
}


export function resumeOverlays() {
    if (isRunning) return;
    if (imageCount === 0) return;
    startOverlays(OVERLAY_CONFIG.INTERVAL);
}


export function setOverlayImage(index) {
    if (!overlayElement || imageCount === 0) return;
    currentIndex = index % shuffleOrder.length;
    loadOverlayImage(currentIndex);
}


export function setOverlayOpacity(opacity) {
    if (!overlayElement) return;
    OVERLAY_CONFIG.OPACITY = Math.max(0, Math.min(1, opacity));

    if (currentIndex !== 0) {
        overlayElement.style.transition = 'none';
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
    }
}


export function setOverlayBlendMode(mode) {
    if (!overlayElement) return;
    OVERLAY_CONFIG.BLEND_MODE = mode;
    overlayElement.style.mixBlendMode = mode;
}


export function setOverlayRandomOrder(random) {
    OVERLAY_CONFIG.RANDOM_ORDER = random;
    
    shuffleOrder = [];
    
    if (random && imageCount > 1) {

        shuffleOrder.push(0);
        const rest = [];
        for (let i = 1; i < imageCount; i++) {
            rest.push(i);
        }
        const shuffledRest = shuffleArray(rest);
        shuffleOrder = shuffleOrder.concat(shuffledRest);
    } else {
        for (let i = 0; i < imageCount; i++) {
            shuffleOrder.push(i);
        }

    }
    
    currentIndex = 0;
    loadOverlayImage(0);
}


export function destroyOverlays() {
    stopOverlays();
    if (overlayElement) {
        overlayElement.remove();
        overlayElement = null;
    }
    imageCount = 0;
    currentIndex = 0;
    shuffleOrder = [];
}

export function refreshOverlay() {
    if (!overlayElement || imageCount === 0) return;
    loadOverlayImage(currentIndex);
}