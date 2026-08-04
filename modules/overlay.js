// modules/overlay.js

let overlayInterval = null;
let currentIndex = 0;
let imageCount = 0;
let isRunning = false;
let overlayElement = null;
let shuffleOrder = [];

// 🔥 CONFIGURACIÓN ÚNICA
const OVERLAY_CONFIG = {
    INTERVAL: 10000,       // 10 segundos entre cambios
    FADE_DURATION: 0,      // 0 = cambio instantáneo
    FOLDER: 'assets/overlays/',
    EXTENSION: 'jpg',
    BLEND_MODE: 'color-dodge',
    OPACITY: 1,          // 50% de opacidad
    RANDOM_ORDER: true,    // true = aleatorio después del primero, false = secuencial
    IMAGE_COUNT: 17        // Número de imágenes (1.jpg a 15.jpg)
};

/**
 * Inicializa el sistema de overlays
 */
export function initOverlays() {
    stopOverlays();
    
    const config = OVERLAY_CONFIG;
    imageCount = config.IMAGE_COUNT;
    
    if (imageCount === 0) {
        console.warn('⚠️ No se especificó cantidad de imágenes para overlays en OVERLAY_CONFIG.IMAGE_COUNT');
        return;
    }
    
    // 🔥 CREAR ORDEN: El 1 (índice 0) SIEMPRE primero
    shuffleOrder = [];
    
    if (config.RANDOM_ORDER && imageCount > 1) {
        // Primero el índice 0 (imagen 1.jpg)
        shuffleOrder.push(0);
        
        // Luego el resto (1, 2, 3, ... imageCount-1) mezclados aleatoriamente
        const rest = [];
        for (let i = 1; i < imageCount; i++) {
            rest.push(i);
        }
        const shuffledRest = shuffleArray(rest);
        shuffleOrder = shuffleOrder.concat(shuffledRest);
        
        console.log('📷 Orden de overlays (1 siempre primero, luego aleatorio):', shuffleOrder.map(i => i + 1));
    } else {
        // Orden secuencial: 0, 1, 2, 3, ... (1.jpg, 2.jpg, 3.jpg, ...)
        for (let i = 0; i < imageCount; i++) {
            shuffleOrder.push(i);
        }
        console.log('📷 Orden de overlays (secuencial):', shuffleOrder.map(i => i + 1));
    }
    
    // Crear el elemento overlay
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
    
    // 🔥 Cargar la primera imagen (SIEMPRE 1.jpg)
    loadOverlayImage(0);
    
    // Iniciar el ciclo
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
    overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
    
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
    overlayElement.style.transition = 'none';
    overlayElement.style.opacity = OVERLAY_CONFIG.OPACITY;
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
        console.log('📷 Nuevo orden (1 primero, luego aleatorio):', shuffleOrder.map(i => i + 1));
    } else {
        for (let i = 0; i < imageCount; i++) {
            shuffleOrder.push(i);
        }
        console.log('📷 Nuevo orden (secuencial):', shuffleOrder.map(i => i + 1));
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