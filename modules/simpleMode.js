import { CONFIG, updateColors, createColors } from './config.js';
import { stopRandomAnimations, restartRandomAnimations } from './animations.js';
import { stopOverlays, initOverlays } from './overlay.js';
import { stopLogoAnimation } from './emnlvega.js';
import { updateAllSwitches } from './settings.js';

let isApplying = false;
let dicc = null;

const DEFAULT_COLOR = '#00FF9B';
const SIMPLE_PRIMARY = '#00FF9B';
const SIMPLE_SECONDARY = '#FFFFFF';

async function loadDicc() {
    if (dicc) return dicc;
    try {
        const response = await fetch('./modules/dicc.json');
        dicc = await response.json();
        return dicc;
    } catch (e) {
        console.error('Error loading dicc:', e);
        return null;
    }
}

function resetColorsToDefault() {
    updateColors(DEFAULT_COLOR);
    
    try {
        const saved = localStorage.getItem('edesign_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            parsed.primaryColor = DEFAULT_COLOR;
            localStorage.setItem('edesign_settings', JSON.stringify(parsed));
        }
    } catch (e) {}
    
    const sidebarPicker = document.getElementById('colorPicker');
    if (sidebarPicker) sidebarPicker.value = DEFAULT_COLOR;
    const sidebarHex = document.getElementById('colorHexLabel');
    if (sidebarHex) sidebarHex.textContent = '#00FF9B';
}

export function toggleSimpleMode() {
    const currentState = localStorage.getItem('simple_mode_state') === 'true';
    const newState = !currentState;
    
    localStorage.setItem('simple_mode_state', newState ? 'true' : 'false');
    
    if (newState) {
        applySimpleMode();
    } else {
        applyArtisticMode();
    }
    
    setTimeout(() => {
        window.location.reload();
    }, 200);
}

function applySimpleMode() {
    if (isApplying) return;
    isApplying = true;
    
    document.body.classList.add('simple-mode');
    

    
    updateAllSwitches(false);
    
    CONFIG.BORDER_RADIUS = 0;
    document.documentElement.style.setProperty('--cell-radius', '0px');
    
    CONFIG.ANIMATION_DURATION = 0;
    CONFIG.ANIMATION_DURATION_LOGO = 0;
    CONFIG.LOGO_DELAY = 0;
    CONFIG.LOGO_DELAY_COMBINED = 0;
    
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        gridContainer.style.background = 'transparent';
        gridContainer.style.boxShadow = 'none';
        gridContainer.style.animation = 'none';
        gridContainer.style.borderRadius = '0px';
        gridContainer.style.border = 'none';
    }
    
    document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell').forEach(cell => {
        cell.style.boxShadow = 'none';
        cell.style.textShadow = 'none';
        cell.style.transition = 'none';
        cell.style.borderRadius = '0px';
        cell.style.backgroundColor = '#000000';
    });
    
    document.querySelectorAll('.sidebar-overlay').forEach(el => {
        el.style.boxShadow = 'none';
        el.style.backgroundColor = '#000000';
        el.style.borderRadius = '0px';
    });
    
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    if (sidebarOverlay) {
        sidebarOverlay.style.boxShadow = 'none';
        sidebarOverlay.style.backgroundColor = '#000000';
        sidebarOverlay.style.borderRadius = '0px';
    }
    
    stopRandomAnimations();
    stopLogoAnimation();
    stopOverlays();
    
    isApplying = false;
}

function applyArtisticMode() {
    if (isApplying) return;
    isApplying = true;
    
    document.body.classList.remove('simple-mode');
    
    updateAllSwitches(true);
    
    resetColorsToDefault();
    
    CONFIG.BORDER_RADIUS = 4;
    document.documentElement.style.setProperty('--cell-radius', '4px');
    
    CONFIG.ANIMATION_DURATION = 10;
    CONFIG.ANIMATION_DURATION_LOGO = 700;
    CONFIG.LOGO_DELAY = 500;
    CONFIG.LOGO_DELAY_COMBINED = 300;
    
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        gridContainer.style.background = '';
        gridContainer.style.boxShadow = '';
        gridContainer.style.animation = '';
        gridContainer.style.borderRadius = '';
        gridContainer.style.border = '';
    }
    
    document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell').forEach(cell => {
        cell.style.border = '';
        cell.style.borderColor = '';
        cell.style.boxShadow = '';
        cell.style.textShadow = '';
        cell.style.backgroundColor = '';
        cell.style.transition = '';
        cell.style.borderRadius = '';
    });
    
    document.querySelectorAll('.sidebar-overlay').forEach(el => {
        el.style.border = '';
        el.style.boxShadow = '';
        el.style.backgroundColor = '';
        el.style.borderRadius = '';
    });
    
    restartRandomAnimations();
    initOverlays();
    
    isApplying = false;
}

function updateSidebarText() {
    const simpleText = document.querySelector('.sidebar-text[data-action="simple-mode"] .text-content');
    if (!simpleText) {
        setTimeout(updateSidebarText, 150);
        return;
    }
    
    const parentDiv = simpleText.closest('.sidebar-text');
    const isSimple = localStorage.getItem('simple_mode_state') === 'true';
    const d = dicc || { sidebar: {} };
    const sidebarTexts = d.sidebar || {};
    const modeTexts = sidebarTexts.mode || {};
    const modeText = isSimple ? modeTexts.artistic : modeTexts.simple;
    
    let baseFontSize = 13;
    let letterSpacingVal = 2;
    if (parentDiv) {
        const computedStyle = window.getComputedStyle(parentDiv);
        const fontSize = parseFloat(computedStyle.fontSize);
        if (!isNaN(fontSize)) {
            baseFontSize = fontSize;
        }
        const ls = computedStyle.letterSpacing;
        if (ls && ls !== 'normal') {
            const lsVal = parseFloat(ls);
            if (!isNaN(lsVal)) {
                letterSpacingVal = lsVal;
            }
        }
    }
    
    simpleText.innerHTML = '';
    
    const line1 = document.createElement('span');
    line1.textContent = 'MODO';
    line1.style.display = 'block';
    line1.style.fontSize = `${baseFontSize}px`;
    line1.style.letterSpacing = `${letterSpacingVal}px`;
    line1.style.lineHeight = '1.2';
    line1.style.color = 'var(--color-primary)';
    simpleText.appendChild(line1);
    
    const line2 = document.createElement('span');
    line2.textContent = modeText;
    line2.style.display = 'block';
    line2.style.fontSize = `${baseFontSize}px`;
    line2.style.letterSpacing = `${letterSpacingVal}px`;
    line2.style.fontWeight = 'bold';
    line2.style.lineHeight = '1.2';
    line2.style.color = 'var(--color-primary)';
    simpleText.appendChild(line2);
    
    simpleText.style.display = 'flex';
    simpleText.style.flexDirection = 'column';
    simpleText.style.alignItems = 'center';
    simpleText.style.justifyContent = 'center';
    simpleText.style.lineHeight = '1.2';
    simpleText.style.whiteSpace = 'normal';
    simpleText.style.textAlign = 'center';
    simpleText.style.gap = '0px';
    simpleText.style.padding = '0';
    simpleText.style.color = 'var(--color-primary)';
    
    if (parentDiv) {
        const currentTop = parseFloat(parentDiv.style.top) || 0;
        parentDiv.style.top = `${currentTop + 2}px`;
        parentDiv.style.color = 'var(--color-primary)';
        parentDiv.style.textShadow = 'var(--text-shadow-normal)';
        parentDiv.style.fontWeight = 'bold';
        parentDiv.style.letterSpacing = `${letterSpacingVal}px`;
    }
}

export function getSimpleModeState() {
    return localStorage.getItem('simple_mode_state') === 'true';
}

export function applySimpleModeMobile() {
    document.body.classList.add('simple-mode');
    
    updateColors(SIMPLE_PRIMARY, SIMPLE_SECONDARY, '#000000');
    
    updateAllSwitches(false);
    
    stopRandomAnimations();
    stopLogoAnimation();
    stopOverlays();
}

export function applyArtisticModeMobile() {
    document.body.classList.remove('simple-mode');
    
    updateAllSwitches(true);
    
    resetColorsToDefault();
    
    restartRandomAnimations();
    initOverlays();
}

export function applySimpleModeEarly() {
    document.body.classList.add('simple-mode');
    
    updateColors(SIMPLE_PRIMARY, SIMPLE_SECONDARY, '#000000');
    
    updateAllSwitches(false);
    
    CONFIG.BORDER_RADIUS = 0;
    document.documentElement.style.setProperty('--cell-radius', '0px');
    
    CONFIG.ANIMATION_DURATION = 0;
    CONFIG.ANIMATION_DURATION_LOGO = 0;
    CONFIG.LOGO_DELAY = 0;
    CONFIG.LOGO_DELAY_COMBINED = 0;
    
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        gridContainer.style.background = 'transparent';
        gridContainer.style.boxShadow = 'none';
        gridContainer.style.animation = 'none';
        gridContainer.style.borderRadius = '0px';
    }
    
    const overlay = document.getElementById('overlay-container');
    if (overlay) overlay.style.display = 'none';
    
    const bloom = document.getElementById('bloom-overlay');
    if (bloom) bloom.style.display = 'none';
    
    const grain = document.getElementById('grain-overlay');
    if (grain) grain.style.display = 'none';
    
    const gaussian = document.getElementById('gaussian-blur');
    if (gaussian) gaussian.style.display = 'none';
    
    const burnBlur = document.getElementById('burn-blur');
    if (burnBlur) burnBlur.style.display = 'none';
    
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    if (sidebarOverlay) {
        sidebarOverlay.style.border = '1px solid #FFFFFF';
        sidebarOverlay.style.boxShadow = 'none';
        sidebarOverlay.style.backgroundColor = '#000000';
        sidebarOverlay.style.borderRadius = '0px';
    }
    
    document.querySelectorAll('.sidebar-overlay').forEach(el => {
        el.style.border = '1px solid #FFFFFF';
        el.style.boxShadow = 'none';
        el.style.backgroundColor = '#000000';
        el.style.borderRadius = '0px';
    });
    
    stopRandomAnimations();
    stopLogoAnimation();
    stopOverlays();
}

export function initSimpleMode() {
    loadDicc().then(() => {
        const saved = localStorage.getItem('simple_mode_state');
        if (saved === 'true') {
            setTimeout(() => {
                applySimpleMode();
            }, 50);
        }
    });
}

window.toggleSimpleMode = toggleSimpleMode;

document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        initSimpleMode();
    }, 300);
});