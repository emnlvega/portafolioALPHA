import { CONFIG } from './config.js';
import { importDesignFromJSON , importDesignFromJSONlogo  } from './logo.js';
import { designCells } from './interactions.js';

const ANIMATION_CONFIG = {
    INITIAL_WAIT: 0,
    LETTER_INTERVAL: 300,
    IMAGE_FADE_DURATION: 300,
    IMAGE_PATH: 'assets/images/letters.png',
    IMAGE_Z_INDEX: 99999,
    IMAGE_OPACITY: 1,
    FLICKER_MIN_DELAY: 3000,
    FLICKER_MAX_DELAY: 15000,
    FLICKER_VISIBLE_MIN: 3000,
    FLICKER_VISIBLE_MAX: 3000,
    FLICKER_FADE_DURATION: 300,
    FLICKER_INITIAL_DELAY: 3000
};

export const LOGO_START_DESIGN = {
  "0,0": {
    "type": "combined_normal",
    "start": [0, 0],
    "end": [2, 31],
    "combined": true
  },
  "14,0": {
    "type": "combined_normal",
    "start": [14, 0],
    "end": [16, 5],
    "combined": true
  },
  "14,6": {
    "type": "combined_normal",
    "start": [14, 6],
    "end": [16, 11],
    "combined": true
  },
  "14,12": {
    "type": "combined_normal",
    "start": [14, 12],
    "end": [16, 17],
    "combined": true
  },
  "14,18": {
    "type": "combined_normal",
    "start": [14, 18],
    "end": [16, 23],
    "combined": true
  },
  "14,24": {
    "type": "combined_normal",
    "start": [14, 24],
    "end": [16, 29],
    "combined": true
  },
  "14,30": {
    "type": "combined_logo",
    "start": [14, 30],
    "end": [16, 31],
    "combined": true
  }
};

const LETTER_E_1 = {
  "7,4": "logo",
  "7,5": {
    "type": "combined_red",
    "start": [7, 5],
    "end": [7, 6],
    "combined": true
  },
  "8,4": {
    "type": "combined_red",
    "start": [8, 4],
    "end": [8, 5],
    "combined": true
  },
  "9,4": "logo",
  "9,5": {
    "type": "combined_red",
    "start": [9, 5],
    "end": [9, 6],
    "combined": true
  }
};

const LETTER_M = {
  "7,7": "logo",
  "7,8": {
    "type": "combined_red",
    "start": [7, 8],
    "end": [8, 8],
    "combined": true
  },
  "7,9": "logo",
  "8,7": {
    "type": "combined_red",
    "start": [8, 7],
    "end": [9, 7],
    "combined": true
  },
  "8,9": {
    "type": "combined_red",
    "start": [8, 9],
    "end": [9, 9],
    "combined": true
  },
  "9,9": "red"
};

const LETTER_N = {
  "7,10": "logo",
  "7,12": {
    "type": "combined_red",
    "start": [7, 12],
    "end": [8, 12],
    "combined": true
  },
  "8,10": {
    "type": "combined_red",
    "start": [8, 10],
    "end": [9, 10],
    "combined": true
  },
  "8,11": "logo",
  "9,12": "logo"
};

const LETTER_L = {
  "7,13": {
    "type": "combined_red",
    "start": [7, 13],
    "end": [8, 13],
    "combined": true
  },
  "9,13": "logo",
  "9,14": {
    "type": "combined_red",
    "start": [9, 14],
    "end": [9, 15],
    "combined": true
  }
};

const LETTER_V = {
  "7,16": {
    "type": "combined_red",
    "start": [7, 16],
    "end": [8, 16],
    "combined": true
  },
  "7,18": "logo",
  "8,18": "logo",
  "9,16": {
    "type": "combined_red",
    "start": [9, 16],
    "end": [9, 17],
    "combined": true
  }
};

const LETTER_E_2 = {
  "7,19": "logo",
  "7,20": {
    "type": "combined_red",
    "start": [7, 20],
    "end": [7, 21],
    "combined": true
  },
  "8,19": {
    "type": "combined_red",
    "start": [8, 19],
    "end": [8, 20],
    "combined": true
  },
  "9,19": "logo",
  "9,20": {
    "type": "combined_red",
    "start": [9, 20],
    "end": [9, 21],
    "combined": true
  },
  "9,21": "red"
};

const LETTER_G = {
  "7,22": "logo",
  "7,23": {
    "type": "combined_red",
    "start": [7, 23],
    "end": [7, 24],
    "combined": true
  },
  "8,22": {
    "type": "combined_red",
    "start": [8, 22],
    "end": [9, 22],
    "combined": true
  },
  "8,24": "logo",
  "9,23": {
    "type": "combined_red",
    "start": [9, 23],
    "end": [9, 24],
    "combined": true
  }
};

const LETTER_A = {
  "7,25": {
    "type": "combined_red",
    "start": [7, 25],
    "end": [7, 27],
    "combined": true
  },
  "8,25": {
    "type": "combined_red",
    "start": [8, 25],
    "end": [9, 25],
    "combined": true
  },
  "8,26": "logo",
  "8,27": {
    "type": "combined_red",
    "start": [8, 27],
    "end": [9, 27],
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
    
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const offsetX = parseFloat(container.dataset.originalOffsetX) || 0;
    const offsetY = parseFloat(container.dataset.originalOffsetY) || 0;
    const sidebarWidth = CONFIG.SIDEBAR_WIDTH;
    
    const startCol = sidebarWidth + 4;
    const startRow = 7;
    const endCol = sidebarWidth + 27;
    const endRow = 9;
    
    const startX = offsetX + startCol * (cellSize + gap);
    const startY = offsetY + startRow * (cellSize + gap);
    const endX = offsetX + (endCol + 1) * (cellSize + gap) - gap;
    const endY = offsetY + (endRow + 1) * (cellSize + gap) - gap;
    
    const areaWidth = endX - startX;
    const areaHeight = endY - startY;
    
    const offsetLeft = -1;
    const offsetTop = 0;
    
    const centerX = startX + areaWidth / 2 + offsetLeft;
    const centerY = startY + areaHeight / 2 + offsetTop;
    
    const img = document.createElement('img');
    img.src = ANIMATION_CONFIG.IMAGE_PATH;
    img.style.position = 'fixed';
    img.style.left = `${centerX}px`;
    img.style.top = `${centerY}px`;
    img.style.transform = 'translate(-49.6%, -50%)';
    img.style.width = `${areaWidth}px`;
    img.style.height = `${areaHeight}px`;
    img.style.objectFit = 'contain';
    img.style.zIndex = 9999;
    img.style.opacity = '1';
    img.style.pointerEvents = 'none';
    img.style.transition = `opacity ${ANIMATION_CONFIG.FLICKER_FADE_DURATION}ms ease`;
    img.style.mixBlendMode = 'color-burn';
    img.id = 'letters-animation-image';
    
    container.appendChild(img);
    
    applyColorToImage(img, CONFIG.COLORS.secondary);
    
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

export function stopFlickerOnInicio() {
    if (flickerTimeout) {
        clearTimeout(flickerTimeout);
        flickerTimeout = null;
    }
    if (lettersImage) {
        lettersImage.style.opacity = '0';
        setTimeout(() => {
            removeLettersImage();
        }, 300);
    }
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
    
    if (window.cleanInicioContent) {
        window.cleanInicioContent();
    }
    
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
    
    if (window.unblockSidebarInteraction) {
        window.unblockSidebarInteraction();
    }
}

export function startLogoAnimation(onComplete = null, instant = false) {
    if (!isEnabled) {
        if (onComplete) onComplete();
        if (window.unblockSidebarInteraction) {
            window.unblockSidebarInteraction();
        }
        return;
    }
    
    clearAllTimeouts();
    stopLogoAnimation();
    
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
            
            if (window.unblockSidebarInteraction) {
                setTimeout(() => {
                    window.unblockSidebarInteraction();
                }, ANIMATION_CONFIG.IMAGE_FADE_DURATION + 100);
            }
        } else {
            letterDesigns.forEach((letterDesign, index) => {
                const timeout = setTimeout(() => {
                    if (!lettersImage && index > 0) return;
                    
                    importDesignFromJSONlogo(letterDesign, () => {
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
                                
                                if (window.unblockSidebarInteraction) {
                                    setTimeout(() => {
                                        window.unblockSidebarInteraction();
                                    }, ANIMATION_CONFIG.IMAGE_FADE_DURATION + 100);
                                }
                            }, ANIMATION_CONFIG.LETTER_INTERVAL);
                            allAnimationTimeouts.push(finalTimeout);
                        }
                    }, false);
                }, ANIMATION_CONFIG.INITIAL_WAIT + (index * ANIMATION_CONFIG.LETTER_INTERVAL));
                
                allAnimationTimeouts.push(timeout);
            });
        }
    }, false);
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