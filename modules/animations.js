import { CONFIG } from './config.js';
import { isMobile } from './mobile.js';

let scaleTimeout = null;
let colorTimeout = null;
let glowTimeout = null;
let rotateTimeout = null;
let borderShiftTimeout = null;
let opacityWaveTimeout = null;

let isRunning = false;


const activeScaleAnimations = new Set();
const activeColorAnimations = new Set();
const activeGlowAnimations = new Set();
const activeRotateAnimations = new Set();
const activeBorderShiftAnimations = new Set();
const activeOpacityWaveAnimations = new Set();
const IS_MOBILE = isMobile();


function isCellEligible(cell) {
    if (cell.dataset.isSidebar === 'true') return false;
    
    if (cell.dataset.combined === 'true') return false;
    if (cell.dataset.state === 'hidden') return false;
    if (cell.dataset.state === 'off') return false;
    
    const opacity = parseFloat(cell.style.opacity);
    if (!isNaN(opacity) && opacity === 0) return false;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    const cellSize = CONFIG.CELL_SIZE;
    if (width !== cellSize || height !== cellSize) return false;
    
    const targetType = CONFIG.ANIMATIONS.TARGET_CELLS || 'normal';
    const state = cell.dataset.state || 'normal';
    
    switch(targetType) {
        case 'all':
            return state === 'normal' || state === 'red' || state === 'logo';
        case 'normal':
            return state === 'normal';
        case 'red':
            return state === 'red';
        case 'logo':
            return state === 'logo';
        default:
            return state === 'normal';
    }
}


function getCellsByType() {
    const container = document.getElementById('grid-container');
    if (!container) return [];
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    const eligibleCells = [];
    
    cells.forEach(cell => {
        if (isCellEligible(cell)) {
            eligibleCells.push(cell);
        }
    });
    
    return eligibleCells;
}


function countVisibleCells() {
    const container = document.getElementById('grid-container');
    if (!container) return 0;
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    let count = 0;
    
    cells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;
        if (cell.dataset.state === 'hidden') return;
        if (cell.dataset.state === 'off') return;
        
        const opacity = parseFloat(cell.style.opacity);
        if (!isNaN(opacity) && opacity === 0) return;
        
        if (cell.dataset.combined === 'true') {
            count++;
            return;
        }
        
        const width = parseFloat(cell.style.width);
        const height = parseFloat(cell.style.height);
        const cellSize = CONFIG.CELL_SIZE;
        if (width === cellSize && height === cellSize) {
            count++;
        }
    });
    
    return count;
}


function calculateAnimationCount(availableCells, maxSimultaneous) {
    const totalVisible = countVisibleCells();
    const totalAvailable = availableCells.length;
    
    if (totalAvailable === 0 || totalVisible === 0) return 0;
    

    const reductionFactor = 0.6;
    

    if (totalVisible >= 50) {
        const percentage = (Math.random() * 0.025 + 0.005) * reductionFactor;
        let count = Math.max(1, Math.floor(totalAvailable * percentage));
        count = Math.min(count, Math.floor(maxSimultaneous * 0.2 * reductionFactor));
        count = Math.min(count, Math.floor(totalAvailable / 5));
        return Math.max(1, count);
    }
    

    if (totalVisible >= 20) {
        const percentage = (Math.random() * 0.04 + 0.01) * reductionFactor;
        let count = Math.max(1, Math.floor(totalAvailable * percentage));
        count = Math.min(count, Math.floor(maxSimultaneous * 0.3 * reductionFactor));
        count = Math.min(count, Math.floor(totalAvailable / 4));
        return Math.max(1, count);
    }
    

    if (totalVisible >= 10) {
        let count = Math.min(1, Math.floor(totalAvailable / 4));
        return Math.max(1, count);
    }
    

    if (totalVisible >= 3) {
        return 1;
    }
    

    return Math.min(1, totalAvailable);
}


function getAvailableScaleCells() {
    const eligibleCells = getCellsByType();
    return eligibleCells.filter(cell => !activeScaleAnimations.has(cell));
}

function getAvailableColorCells() {
    const eligibleCells = getCellsByType();
    return eligibleCells.filter(cell => !activeColorAnimations.has(cell));
}

function getAvailableGlowCells() {
    const eligibleCells = getCellsByType();
    return eligibleCells.filter(cell => !activeGlowAnimations.has(cell));
}

function getAvailableRotateCells() {
    const eligibleCells = getCellsByType();
    return eligibleCells.filter(cell => !activeRotateAnimations.has(cell));
}

function getAvailableBorderShiftCells() {
    const eligibleCells = getCellsByType();
    return eligibleCells.filter(cell => !activeBorderShiftAnimations.has(cell));
}

function getAvailableOpacityWaveCells() {
    const container = document.getElementById('grid-container');
    if (!container) return [];
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    const eligibleCells = [];
    
    cells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;
        if (cell.dataset.combined === 'true') return;
        if (cell.dataset.state === 'hidden') return;
        if (cell.dataset.state === 'off') return;
        
        const opacity = parseFloat(cell.style.opacity);
        if (!isNaN(opacity) && opacity === 0) return;
        
        const width = parseFloat(cell.style.width);
        const height = parseFloat(cell.style.height);
        const cellSize = CONFIG.CELL_SIZE;
        if (width !== cellSize || height !== cellSize) return;
        
        const state = cell.dataset.state || 'normal';
        if (state === 'red' || state === 'logo' || state === 'normal') {
            eligibleCells.push(cell);
        }
    });
    
    return eligibleCells.filter(cell => !activeOpacityWaveAnimations.has(cell));
}


function animateScale(cell) {
    if (!cell) return;
    if (activeScaleAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.SCALE.ENABLED) return;
    if (!isCellEligible(cell)) return;
    
    activeScaleAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.SCALE.DURATION;
    const scaleFactor = CONFIG.ANIMATIONS.SCALE.SCALE_FACTOR;
    
    cell.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    cell.style.transform = `scale(${scaleFactor})`;
    cell.style.zIndex = '5';
    
    setTimeout(() => {
        cell.style.transform = 'scale(1)';
        setTimeout(() => {
            cell.style.zIndex = '';
            cell.style.transition = '';
            activeScaleAnimations.delete(cell);
        }, duration);
    }, duration);
}

function triggerScaleAnimation() {
    const availableCells = getAvailableScaleCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.SCALE.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateScale(cell));
}

function scheduleNextScale() {
    if (!isRunning || !CONFIG.ANIMATIONS.SCALE.ENABLED) return;
    const min = CONFIG.ANIMATIONS.SCALE.MIN_INTERVAL;
    const max = CONFIG.ANIMATIONS.SCALE.MAX_INTERVAL;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    scaleTimeout = setTimeout(() => {
        triggerScaleAnimation();
        scheduleNextScale();
    }, interval);
}


function animateColor(cell) {
    if (!cell) return;
    if (activeColorAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.COLOR.ENABLED) return;
    if (!isCellEligible(cell)) return;
    
    activeColorAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.COLOR.DURATION;
    const primaryColor = CONFIG.COLORS.primary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const bgColor = CONFIG.COLORS.background;
    const opacity = 0.008;
    
    const originalState = cell.dataset.state || 'normal';
    const originalBgColor = cell.style.backgroundColor;
    const originalBorderColor = cell.style.borderColor;
    const originalBoxShadow = cell.style.boxShadow;
    
    cell.style.transition = `all ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    cell.style.backgroundColor = `rgba(${primaryRGB}, ${opacity})`;
    cell.style.borderColor = primaryColor;
    cell.dataset.state = 'red';
    cell.style.boxShadow = `0 0 10px rgba(${primaryRGB}, 0.3), 0 0 40px rgba(${primaryRGB}, 0.15), 0 0 80px rgba(${primaryRGB}, 0.05), inset 0 0 40px rgba(${primaryRGB}, 0.05)`;
    
    setTimeout(() => {
        cell.style.backgroundColor = originalBgColor || bgColor;
        cell.style.borderColor = originalBorderColor || CONFIG.COLORS.primary;
        cell.dataset.state = originalState;
        cell.style.boxShadow = originalBoxShadow || '';
        
        if (originalState === 'logo') {
            cell.style.border = 'none';
            cell.style.borderColor = 'transparent';
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
        } else if (originalState === 'red') {
            cell.style.backgroundColor = CONFIG.COLORS.primary;
            cell.style.borderColor = CONFIG.COLORS.primary;
            cell.style.boxShadow = 'none';
        } else if (originalState === 'combined_red') {
            cell.style.backgroundColor = CONFIG.COLORS.primary;
            cell.style.borderColor = CONFIG.COLORS.primary;
            cell.style.boxShadow = 'none';
        } else if (originalState === 'combined_logo') {
            cell.style.border = 'none';
            cell.style.borderColor = 'transparent';
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
        } else if (originalState === 'combined_normal') {
            cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
            cell.style.borderColor = CONFIG.COLORS.primary;
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.boxShadow = 'none';
        }
        
        setTimeout(() => {
            cell.style.transition = '';
            activeColorAnimations.delete(cell);
        }, duration);
    }, duration);
}

function scheduleNextColor() {
    if (!isRunning || !CONFIG.ANIMATIONS.COLOR.ENABLED) return;
    const min = CONFIG.ANIMATIONS.COLOR.MIN_INTERVAL || 5000;
    const max = CONFIG.ANIMATIONS.COLOR.MAX_INTERVAL || 5000;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    colorTimeout = setTimeout(() => {
        if (isRunning && CONFIG.ANIMATIONS.COLOR.ENABLED) {
            triggerColorAnimation();
        }
        if (isRunning && CONFIG.ANIMATIONS.COLOR.ENABLED) {
            scheduleNextColor();
        }
    }, interval);
}

function triggerColorAnimation() {
    if (activeColorAnimations.size > CONFIG.ANIMATIONS.COLOR.MAX_SIMULTANEOUS) return;
    
    const availableCells = getAvailableColorCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.COLOR.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateColor(cell));
}


function animateGlow(cell) {
    if (!cell) return;
    if (activeGlowAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.GLOW.ENABLED) return;
    if (!isCellEligible(cell)) return;
    
    activeGlowAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.GLOW.DURATION;
    const primaryColor = CONFIG.COLORS.primary;
    
    const originalBoxShadow = cell.style.boxShadow || '';
    const glowEffect = `0 0 20px ${primaryColor}`;
    
    cell.style.setProperty('transition', `box-shadow ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`, 'important');
    cell.style.setProperty('box-shadow', glowEffect, 'important');
    cell.style.setProperty('z-index', '5', 'important');
    
    setTimeout(() => {
        cell.style.setProperty('box-shadow', originalBoxShadow || '', 'important');
        cell.style.setProperty('z-index', '', 'important');
        setTimeout(() => {
            cell.style.setProperty('transition', '', 'important');
            activeGlowAnimations.delete(cell);
        }, duration);
    }, duration);
}

function triggerGlowAnimation() {
    const availableCells = getAvailableGlowCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.GLOW.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateGlow(cell));
}

function scheduleNextGlow() {
    if (!isRunning || !CONFIG.ANIMATIONS.GLOW.ENABLED) return;
    const min = CONFIG.ANIMATIONS.GLOW.MIN_INTERVAL;
    const max = CONFIG.ANIMATIONS.GLOW.MAX_INTERVAL;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    glowTimeout = setTimeout(() => {
        triggerGlowAnimation();
        scheduleNextGlow();
    }, interval);
}


function animateRotate(cell) {
    if (!cell) return;
    if (activeRotateAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.ROTATE.ENABLED) return;
    if (!isCellEligible(cell)) return;
    
    activeRotateAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.ROTATE.DURATION;
    const angle = CONFIG.ANIMATIONS.ROTATE.ROTATION_ANGLE;
    const direction = Math.random() < 0.5 ? 1 : -1;
    const finalAngle = angle * direction;
    
    cell.style.transition = `transform ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    cell.style.transform = `rotate(${finalAngle}deg)`;
    cell.style.zIndex = '5';
    
    setTimeout(() => {
        cell.style.transform = 'rotate(0deg)';
        setTimeout(() => {
            cell.style.zIndex = '';
            cell.style.transition = '';
            activeRotateAnimations.delete(cell);
        }, duration);
    }, duration);
}

function triggerRotateAnimation() {
    const availableCells = getAvailableRotateCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.ROTATE.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateRotate(cell));
}

function scheduleNextRotate() {
    if (!isRunning || !CONFIG.ANIMATIONS.ROTATE.ENABLED) return;
    const min = CONFIG.ANIMATIONS.ROTATE.MIN_INTERVAL;
    const max = CONFIG.ANIMATIONS.ROTATE.MAX_INTERVAL;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    rotateTimeout = setTimeout(() => {
        triggerRotateAnimation();
        scheduleNextRotate();
    }, interval);
}


function animateBorderShift(cell) {
    if (!cell) return;
    if (activeBorderShiftAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED) return;
    if (!isCellEligible(cell)) return;
    
    activeBorderShiftAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.BORDER_SHIFT.DURATION;
    const shift = CONFIG.ANIMATIONS.BORDER_SHIFT.SHIFT_AMOUNT;
    
    const origX = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
    const origY = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);
    const angle = Math.random() * Math.PI * 2;
    const dx = Math.cos(angle) * shift;
    const dy = Math.sin(angle) * shift;
    const originalBoxShadow = cell.style.boxShadow || '';
    
    cell.style.transition = `left ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), top ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    cell.style.left = `${origX + dx}px`;
    cell.style.top = `${origY + dy}px`;
    
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    cell.style.boxShadow = `0 4px 20px rgba(${primaryRGB}, 0.1), 0 2px 10px rgba(0,0,0,0.1)`;
    cell.style.zIndex = '5';
    
    setTimeout(() => {
        cell.style.left = `${origX}px`;
        cell.style.top = `${origY}px`;
        cell.style.boxShadow = originalBoxShadow || '';
        setTimeout(() => {
            cell.style.zIndex = '';
            cell.style.transition = '';
            activeBorderShiftAnimations.delete(cell);
        }, duration);
    }, duration);
}

function triggerBorderShiftAnimation() {
    const availableCells = getAvailableBorderShiftCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.BORDER_SHIFT.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateBorderShift(cell));
}

function scheduleNextBorderShift() {
    if (!isRunning || !CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED) return;
    const min = CONFIG.ANIMATIONS.BORDER_SHIFT.MIN_INTERVAL;
    const max = CONFIG.ANIMATIONS.BORDER_SHIFT.MAX_INTERVAL;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    borderShiftTimeout = setTimeout(() => {
        triggerBorderShiftAnimation();
        scheduleNextBorderShift();
    }, interval);
}


function animateOpacityWave(cell) {
    if (!cell) return;
    if (activeOpacityWaveAnimations.has(cell)) return;
    if (!CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED) return;
    
    if (cell.dataset.isSidebar === 'true') return;
    if (cell.dataset.combined === 'true') return;
    if (cell.dataset.state === 'hidden') return;
    if (cell.dataset.state === 'off') return;
    
    const opacity = parseFloat(cell.style.opacity);
    if (!isNaN(opacity) && opacity === 0) return;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    const cellSize = CONFIG.CELL_SIZE;
    if (width !== cellSize || height !== cellSize) return;
    
    const state = cell.dataset.state || 'normal';
    if (state !== 'red' && state !== 'logo' && state !== 'normal') return;
    
    activeOpacityWaveAnimations.add(cell);
    const duration = CONFIG.ANIMATIONS.OPACITY_WAVE.DURATION;
    const minOpacity = CONFIG.ANIMATIONS.OPACITY_WAVE.MIN_OPACITY;
    const maxOpacity = CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_OPACITY;
    const targetOpacity = minOpacity + Math.random() * (maxOpacity - minOpacity);
    const originalOpacity = cell.style.opacity || '1';
    
    cell.style.transition = `opacity ${duration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    cell.style.opacity = targetOpacity;
    
    setTimeout(() => {
        cell.style.opacity = originalOpacity;
        setTimeout(() => {
            cell.style.transition = '';
            activeOpacityWaveAnimations.delete(cell);
        }, duration);
    }, duration);
}

function triggerOpacityWaveAnimation() {
    const availableCells = getAvailableOpacityWaveCells();
    if (availableCells.length === 0) return;
    
    const maxSimultaneous = CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_SIMULTANEOUS;
    const count = calculateAnimationCount(availableCells, maxSimultaneous);
    if (count <= 0) return;
    
    const shuffled = availableCells.sort(() => Math.random() - 0.5);
    const selectedCells = shuffled.slice(0, Math.min(count, availableCells.length));
    selectedCells.forEach(cell => animateOpacityWave(cell));
}

function scheduleNextOpacityWave() {
    if (!isRunning || !CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED) return;
    const min = CONFIG.ANIMATIONS.OPACITY_WAVE.MIN_INTERVAL;
    const max = CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_INTERVAL;
    const interval = Math.floor(Math.random() * (max - min + 1)) + min;
    
    opacityWaveTimeout = setTimeout(() => {
        triggerOpacityWaveAnimation();
        scheduleNextOpacityWave();
    }, interval);
}


function clearAllTimeouts() {
    if (scaleTimeout) { clearTimeout(scaleTimeout); scaleTimeout = null; }
    if (colorTimeout) { clearTimeout(colorTimeout); colorTimeout = null; }
    if (glowTimeout) { clearTimeout(glowTimeout); glowTimeout = null; }
    if (rotateTimeout) { clearTimeout(rotateTimeout); rotateTimeout = null; }
    if (borderShiftTimeout) { clearTimeout(borderShiftTimeout); borderShiftTimeout = null; }
    if (opacityWaveTimeout) { clearTimeout(opacityWaveTimeout); opacityWaveTimeout = null; }
}



export function startRandomAnimations() {
    if (IS_MOBILE) {
        if (CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED) {
            if (isRunning) return;
            isRunning = true;
            
            clearAllTimeouts();
            
            activeScaleAnimations.clear();
            activeColorAnimations.clear();
            activeGlowAnimations.clear();
            activeRotateAnimations.clear();
            activeBorderShiftAnimations.clear();
            activeOpacityWaveAnimations.clear();
            
            setTimeout(() => {
                if (isRunning) {
                    scheduleNextOpacityWave();
                }
            }, 500);
        }
        return;
    }
    
    if (isRunning) return;
    isRunning = true;
    
    clearAllTimeouts();
    
    activeScaleAnimations.clear();
    activeColorAnimations.clear();
    activeGlowAnimations.clear();
    activeRotateAnimations.clear();
    activeBorderShiftAnimations.clear();
    activeOpacityWaveAnimations.clear();
    
    setTimeout(() => {
        if (isRunning) {
            if (CONFIG.ANIMATIONS.SCALE.ENABLED) scheduleNextScale();
            if (CONFIG.ANIMATIONS.COLOR.ENABLED) scheduleNextColor();
            if (CONFIG.ANIMATIONS.GLOW.ENABLED) scheduleNextGlow();
            if (CONFIG.ANIMATIONS.ROTATE.ENABLED) scheduleNextRotate();
            if (CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED) scheduleNextBorderShift();
            if (CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED) scheduleNextOpacityWave();
        }
    }, 500);
}

export function stopRandomAnimations() {
    if (IS_MOBILE) {
        clearAllTimeouts();
        isRunning = false;
        activeOpacityWaveAnimations.clear();
        return;
    }
    isRunning = false;
    activeScaleAnimations.clear();
    activeColorAnimations.clear();
    activeGlowAnimations.clear();
    activeRotateAnimations.clear();
    activeBorderShiftAnimations.clear();
    activeOpacityWaveAnimations.clear();
}

export function restartRandomAnimations() {
    if (IS_MOBILE) {

        stopRandomAnimations();
        activeOpacityWaveAnimations.clear();
        setTimeout(() => startRandomAnimations(), 200);
        return;
    }
    stopRandomAnimations();
    activeScaleAnimations.clear();
    activeColorAnimations.clear();
    activeGlowAnimations.clear();
    activeRotateAnimations.clear();
    activeBorderShiftAnimations.clear();
    activeOpacityWaveAnimations.clear();
    setTimeout(() => startRandomAnimations(), 200);
}

export function refreshAnimationCount() {

    const wasRunning = isRunning;
    if (wasRunning) {
        stopRandomAnimations();

        activeScaleAnimations.clear();
        activeColorAnimations.clear();
        activeGlowAnimations.clear();
        activeRotateAnimations.clear();
        activeBorderShiftAnimations.clear();
        activeOpacityWaveAnimations.clear();
        setTimeout(() => startRandomAnimations(), 300);
    }
}