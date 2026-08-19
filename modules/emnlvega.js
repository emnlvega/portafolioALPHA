import { CONFIG } from './config.js';
import { importDesignFromJSON } from './logo.js';
import { designCells } from './interactions.js';

const ANIMATION_CONFIG = {
    INITIAL_WAIT: 0,
    LETTER_INTERVAL: 300,
    IMAGE_FADE_DURATION: 300,
    IMAGE_PATH: 'assets/images/letters.png',
    IMAGE_Z_INDEX: 1000,
    IMAGE_OPACITY: 1,
    FLICKER_MIN_DELAY: 3000,
    FLICKER_MAX_DELAY: 15000,
    FLICKER_VISIBLE_MIN: 3000,
    FLICKER_VISIBLE_MAX: 3000,
    FLICKER_FADE_DURATION: 300,
    FLICKER_INITIAL_DELAY: 3000
};

const LOGO_START_DESIGN = {
    "0,0": {
        "type": "combined_normal",
        "left": 199,
        "top": 23,
        "width": 1681,
        "height": 144,
        "combined": true
    },
    "14,0": {
        "type": "combined_normal",
        "left": 199,
        "top": 765,
        "width": 303,
        "height": 144,
        "combined": true
    },
    "14,6": {
        "type": "combined_normal",
        "left": 517,
        "top": 765,
        "width": 303,
        "height": 144,
        "combined": true
    },
    "14,12": {
        "type": "combined_normal",
        "left": 835,
        "top": 765,
        "width": 303,
        "height": 144,
        "combined": true
    },
    "14,18": {
        "type": "combined_normal",
        "left": 1153,
        "top": 765,
        "width": 303,
        "height": 144,
        "combined": true
    },
    "14,24": {
        "type": "combined_normal",
        "left": 1471,
        "top": 765,
        "width": 303,
        "height": 144,
        "combined": true
    },
    "14,30": {
        "type": "combined_logo",
        "left": 1789,
        "top": 765,
        "width": 91,
        "height": 144,
        "combined": true
    }
};

const LETTER_E_1 = {
    "7,4": "logo",
    "7,5": {
        "type": "combined_red",
        "left": 464,
        "top": 394,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "8,4": {
        "type": "combined_red",
        "left": 411,
        "top": 447,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "9,4": "logo",
    "9,5": {
        "type": "combined_red",
        "left": 464,
        "top": 500,
        "width": 91,
        "height": 38,
        "combined": true
    }
};

const LETTER_M = {
    "7,7": "logo",
    "7,8": {
        "type": "combined_red",
        "left": 623,
        "top": 394,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "7,9": "logo",
    "8,7": {
        "type": "combined_red",
        "left": 570,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "8,9": {
        "type": "combined_red",
        "left": 676,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "9,9": "red"
};

const LETTER_N = {
    "7,10": "logo",
    "7,12": {
        "type": "combined_red",
        "left": 835,
        "top": 394,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "8,10": {
        "type": "combined_red",
        "left": 729,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "8,11": "logo",
    "9,12": "logo"
};

const LETTER_L = {
    "7,13": {
        "type": "combined_red",
        "left": 888,
        "top": 394,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "9,13": "logo",
    "9,14": {
        "type": "combined_red",
        "left": 941,
        "top": 500,
        "width": 91,
        "height": 38,
        "combined": true
    }
};

const LETTER_V = {
    "7,16": {
        "type": "combined_red",
        "left": 1047,
        "top": 394,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "7,18": "logo",
    "8,18": "logo",
    "9,16": {
        "type": "combined_red",
        "left": 1047,
        "top": 500,
        "width": 91,
        "height": 38,
        "combined": true
    }
};

const LETTER_E_2 = {
    "7,19": "logo",
    "7,20": {
        "type": "combined_red",
        "left": 1259,
        "top": 394,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "8,19": {
        "type": "combined_red",
        "left": 1206,
        "top": 447,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "9,19": "logo",
    "9,20": {
        "type": "combined_red",
        "left": 1259,
        "top": 500,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "9,21": "red"
};

const LETTER_G = {
    "7,22": "logo",
    "7,23": {
        "type": "combined_red",
        "left": 1418,
        "top": 394,
        "width": 91,
        "height": 38,
        "combined": true
    },
    "8,22": {
        "type": "combined_red",
        "left": 1365,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "8,24": "logo",
    "9,23": {
        "type": "combined_red",
        "left": 1418,
        "top": 500,
        "width": 91,
        "height": 38,
        "combined": true
    }
};

const LETTER_A = {
    "7,25": {
        "type": "combined_red",
        "left": 1524,
        "top": 394,
        "width": 144,
        "height": 38,
        "combined": true
    },
    "8,25": {
        "type": "combined_red",
        "left": 1524,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    },
    "8,26": "logo",
    "8,27": {
        "type": "combined_red",
        "left": 1630,
        "top": 447,
        "width": 38,
        "height": 91,
        "combined": true
    }
};

let lettersImage = null;
let allAnimationTimeouts = [];
let isEnabled = false;
let flickerTimeout = null;
let isOnInicio = false;
let alwaysVisibleOnInicio = true;

export function setAlwaysVisibleOnInicio(value) {
    alwaysVisibleOnInicio = value;
    
    if (value && isOnInicio) {
        if (flickerTimeout) {
            clearTimeout(flickerTimeout);
            flickerTimeout = null;
        }
        if (lettersImage) {
            lettersImage.style.opacity = ANIMATION_CONFIG.IMAGE_OPACITY;
        }
    }
}

export function setOnInicio(value) {
    isOnInicio = value;
    if (!value) {
        stopFlickerCycle();
        removeLettersImage();
    }
}

export function enableLogoAnimation() {
    isEnabled = true;
}

export function disableLogoAnimation() {
    isEnabled = false;
}

function createLettersImage() {
    const container = document.getElementById('grid-container');
    
    const img = document.createElement('img');
    img.src = ANIMATION_CONFIG.IMAGE_PATH;
    img.style.position = 'absolute';
    img.style.left = '54%';
    img.style.top = '50%';
    img.style.transform = 'translate(-50%, -50%)';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.zIndex = ANIMATION_CONFIG.IMAGE_Z_INDEX;
    img.style.opacity = '0';
    img.style.pointerEvents = 'none';
    img.style.transition = `opacity ${ANIMATION_CONFIG.FLICKER_FADE_DURATION}ms ease`;
    img.style.mixBlendMode = 'color-burn';
    img.id = 'letters-animation-image';
    
    container.appendChild(img);
    
    applyColorToImage(img, CONFIG.COLORS.primary);
    
    return img;
}

function applyColorToImage(img, color) {
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

document.addEventListener('colorsUpdated', function(e) {
    const { colors } = e.detail;
    const existingImage = document.getElementById('letters-animation-image');
    if (existingImage) {
        applyColorToImage(existingImage, colors.primary);
    }
});

function showLettersImage() {
    if (lettersImage) {
        lettersImage.style.opacity = ANIMATION_CONFIG.IMAGE_OPACITY;
    }
}

function hideLettersImage() {
    if (lettersImage) {
        lettersImage.style.opacity = '0';
    }
}

function removeLettersImage() {
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
    
    const existingImage = document.getElementById('letters-animation-image');
    if (existingImage) {
        existingImage.remove();
    }
    lettersImage = null;
}

function scheduleNextFlicker() {
    if (!isOnInicio || alwaysVisibleOnInicio) return;
    
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
    
    const delay = ANIMATION_CONFIG.FLICKER_MIN_DELAY + Math.random() * (ANIMATION_CONFIG.FLICKER_MAX_DELAY - ANIMATION_CONFIG.FLICKER_MIN_DELAY);
    
    flickerTimeout = setTimeout(() => {
        if (lettersImage && isOnInicio && !alwaysVisibleOnInicio) {
            showLettersImage();
            
            const visibleDuration = ANIMATION_CONFIG.FLICKER_VISIBLE_MIN + Math.random() * (ANIMATION_CONFIG.FLICKER_VISIBLE_MAX - ANIMATION_CONFIG.FLICKER_VISIBLE_MIN);
            
            flickerTimeout = setTimeout(() => {
                hideLettersImage();
                scheduleNextFlicker();
            }, visibleDuration);
        }
    }, delay);
}

function startFlickerCycle() {
    if (!isOnInicio || alwaysVisibleOnInicio) return;
    
    flickerTimeout = setTimeout(() => {
        scheduleNextFlicker();
    }, ANIMATION_CONFIG.FLICKER_INITIAL_DELAY);
}

function stopFlickerCycle() {
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
    if (lettersImage) {
        lettersImage.style.opacity = '0';
    }
}

function clearAllTimeouts() {
    allAnimationTimeouts.forEach(timeout => {
        clearTimeout(timeout);
    });
    allAnimationTimeouts = [];
    
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
}

export function startFlickerOnInicio() {

    removeLettersImage();
    

    if (alwaysVisibleOnInicio) {
        return;
    }
    
    lettersImage = createLettersImage();
    
    if (alwaysVisibleOnInicio) {
        setTimeout(() => {
            if (lettersImage) {
                lettersImage.style.opacity = ANIMATION_CONFIG.IMAGE_OPACITY;
            }
        }, 500);
    } else {
        flickerTimeout = setTimeout(() => {
            showLettersImage();
            
            const initialHideDelay = ANIMATION_CONFIG.FLICKER_INITIAL_DELAY;
            flickerTimeout = setTimeout(() => {
                hideLettersImage();
                startFlickerCycle();
            }, initialHideDelay);
        }, 500);
    }
}

export function stopLogoAnimation() {
    clearAllTimeouts();
    removeLettersImage();
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;
        
        const state = cell.dataset.state;
        if (state === 'combined_red' || state === 'combined_logo' || state === 'combined_normal') {
            const size = CONFIG.CELL_SIZE;
            const origX = parseFloat(cell.dataset.originalX);
            const origY = parseFloat(cell.dataset.originalY);
            
            if (!isNaN(origX) && !isNaN(origY)) {
                cell.style.transition = 'all 0.3s ease';
                cell.style.left = `${origX}px`;
                cell.style.top = `${origY}px`;
                cell.style.width = `${size}px`;
                cell.style.height = `${size}px`;
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
                cell.style.pointerEvents = 'auto';
                cell.style.zIndex = '';
                cell.style.boxShadow = 'none';
                cell.dataset.state = 'normal';
                cell.dataset.combined = 'false';
                delete cell.dataset.combinedId;
                delete cell.dataset.combinedLeft;
                delete cell.dataset.combinedTop;
                delete cell.dataset.combinedWidth;
                delete cell.dataset.combinedHeight;
            }
        } else if (state === 'hidden') {
            cell.style.transition = 'all 0.3s ease';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            cell.style.pointerEvents = 'auto';
            cell.dataset.state = 'normal';
            cell.dataset.combined = 'false';
            delete cell.dataset.combinedId;
        }
    });
}

export function startLogoAnimation(onComplete = null, instant = false) {
    if (!isEnabled) {
        if (onComplete) onComplete();
        return;
    }
    
    clearAllTimeouts();
    stopLogoAnimation();
    
    removeLettersImage();
    
    importDesignFromJSON(LOGO_START_DESIGN, () => {
        lettersImage = createLettersImage();
        showLettersImage();
        


        setTimeout(() => {
            const event = new CustomEvent('renderInicioContent');
            document.dispatchEvent(event);
        }, 50);
        
        const letterDesigns = [
            LETTER_E_1,
            LETTER_M,
            LETTER_N,
            LETTER_L,
            LETTER_V,
            LETTER_E_2,
            LETTER_G,
            LETTER_A
        ];
        
        if (instant) {

            letterDesigns.forEach((letterDesign) => {
                importDesignFromJSON(letterDesign, () => {}, false);
            });
            
            if (alwaysVisibleOnInicio) {
                lettersImage.style.opacity = ANIMATION_CONFIG.IMAGE_OPACITY;
            } else {
                hideLettersImage();
                setTimeout(() => {
                    startFlickerCycle();
                }, 300);
            }
            
            if (onComplete) {
                setTimeout(onComplete, ANIMATION_CONFIG.IMAGE_FADE_DURATION);
            }
        } else {

            letterDesigns.forEach((letterDesign, index) => {
                const timeout = setTimeout(() => {
                    if (!lettersImage && index > 0) return;
                    
                    importDesignFromJSON(letterDesign, () => {
                        if (index === letterDesigns.length - 1) {
                            const finalTimeout = setTimeout(() => {
                                if (alwaysVisibleOnInicio) {
                                    lettersImage.style.opacity = ANIMATION_CONFIG.IMAGE_OPACITY;
                                } else {
                                    hideLettersImage();
                                    setTimeout(() => {
                                        startFlickerCycle();
                                    }, 300);
                                }
                                
                                if (onComplete) {
                                    setTimeout(onComplete, ANIMATION_CONFIG.IMAGE_FADE_DURATION);
                                }
                            }, ANIMATION_CONFIG.LETTER_INTERVAL);
                            allAnimationTimeouts.push(finalTimeout);
                        }
                    }, false);
                }, ANIMATION_CONFIG.INITIAL_WAIT + (index * ANIMATION_CONFIG.LETTER_INTERVAL));
                
                allAnimationTimeouts.push(timeout);
            });
        }
    }, true);
}

export function getLogoAnimationConfig() {
    return ANIMATION_CONFIG;
}

export function setLogoAnimationConfig(config) {
    Object.assign(ANIMATION_CONFIG, config);
}

export function stopFlickerAndRemoveImage() {
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
    removeLettersImage();
}