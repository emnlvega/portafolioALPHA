// modules/overlay.js

let overlayInterval = null;
let currentIndex = 0;
let imageCount = 0;
let isRunning = false;
let overlayElement = null;
let shuffleOrder = [];

// 🔥 CONFIGURACIÓN ÚNICA
const OVERLAY_CONFIG = {
    INTERVAL: 30000,       // 10 segundos entre cambios
    FADE_DURATION: 0,      // 0 = cambio instantáneo
    FOLDER: 'assets/overlays/',
    EXTENSION: 'jpg',
    BLEND_MODE: 'color-dodge',
    OPACITY: 0.7,          // Opacidad base (para imágenes normales)
    OPACITY_FIRST: 0.5,    // 🔥 Opacidad para la primera imagen (50%)
    RANDOM_ORDER: true,    // true = aleatorio después del primero, false = secuencial
    IMAGE_COUNT: 17        // Número de imágenes (1.jpg a 17.jpg)
};

/**
 * Inicializa el sistema de overlays
 */
// modules/overlay.js - Modificar initOverlays

export function initOverlays() {
    stopOverlays();
    
    const config = OVERLAY_CONFIG;
    imageCount = config.IMAGE_COUNT;
    
    if (imageCount === 0) {
        return;
    }
    
    // 🔥 LEER CONFIGURACIÓN DE TEXTURA DESDE SETTINGS
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
    
    // 🔥 APLICAR ESTADO DE TEXTURA SEGÚN CONFIGURACIÓN
    if (overlayElement) {
        overlayElement.style.display = textureEnabled ? 'block' : 'none';
    }
    
    startOverlays(config.INTERVAL);
}

/**
 * Mezcla un array (Fisher-Yates)
 */
function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/**
 * Carga una imagen de overlay específica (cambio instantáneo)
 */
function loadOverlayImage(index) {
    if (!overlayElement || imageCount === 0) return;
    
    // Obtener el índice real usando el orden
    const realIndex = shuffleOrder[index % shuffleOrder.length];
    const imageNumber = realIndex + 1; // +1 porque las imágenes empiezan en 1
    
    const imagePath = `${OVERLAY_CONFIG.FOLDER}${imageNumber}.${OVERLAY_CONFIG.EXTENSION}`;
    
    overlayElement.style.transition = 'none';
    overlayElement.style.backgroundImage = `url(${imagePath})`;
    
    // 🔥 Si es la primera imagen (índice 0), usar opacidad 50%, sino 100%
    if (index === 0) {
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY_FIRST;
    } else {
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
    }
    
    void overlayElement.offsetHeight;
}

/**
 * Inicia el ciclo de overlays
 */
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

/**
 * Detiene el ciclo de overlays
 */
export function stopOverlays() {
    isRunning = false;
    if (overlayInterval) {
        clearInterval(overlayInterval);
        overlayInterval = null;
    }
}

/**
 * Pausa los overlays (mantiene la imagen actual)
 */
export function pauseOverlays() {
    isRunning = false;
    if (overlayInterval) {
        clearInterval(overlayInterval);
        overlayInterval = null;
    }
}

/**
 * Reanuda los overlays
 */
export function resumeOverlays() {
    if (isRunning) return;
    if (imageCount === 0) return;
    startOverlays(OVERLAY_CONFIG.INTERVAL);
}

/**
 * Cambia a una imagen específica (0-indexed en el orden)
 */
export function setOverlayImage(index) {
    if (!overlayElement || imageCount === 0) return;
    currentIndex = index % shuffleOrder.length;
    loadOverlayImage(currentIndex);
}

/**
 * Cambia la opacidad del overlay (instantáneo)
 */
export function setOverlayOpacity(opacity) {
    if (!overlayElement) return;
    OVERLAY_CONFIG.OPACITY = Math.max(0, Math.min(1, opacity));
    // Solo aplicar si no es la primera imagen
    if (currentIndex !== 0) {
        overlayElement.style.transition = 'none';
        overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
    }
}

/**
 * Cambia el modo de blending (instantáneo)
 */
export function setOverlayBlendMode(mode) {
    if (!overlayElement) return;
    OVERLAY_CONFIG.BLEND_MODE = mode;
    overlayElement.style.mixBlendMode = mode;
}

/**
 * Cambia el orden a aleatorio o secuencial
 */
export function setOverlayRandomOrder(random) {
    OVERLAY_CONFIG.RANDOM_ORDER = random;
    
    shuffleOrder = [];
    
    if (random && imageCount > 1) {
        // 🔥 SIEMPRE 1 primero
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

/**
 * Elimina completamente el overlay
 */
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

/**
 * Recarga la imagen actual (instantáneo)
 */
export function refreshOverlay() {
    if (!overlayElement || imageCount === 0) return;
    loadOverlayImage(currentIndex);
}