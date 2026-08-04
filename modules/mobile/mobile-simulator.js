// modules/mobile-simulator.js
import { CONFIG } from '../config.js';
import { MOBILE_CONFIG } from './mobile-config.js';
import { createGrid, repositionGrid, repositionSidebarOverlay, repositionSidebarTexts, repositionCombinedCells } from '../grid.js';
import { resetGrid, exportDesignToJSON, designCells, setDesignCells, setupCellEvents } from '../interactions.js';
import { importDesignFromJSON } from '../logo.js';
import { stopRandomAnimations, restartRandomAnimations } from '../animations.js';

let isMobileSimulatorActive = false;
let originalConfig = null;
let simulatorButton = null;

export function isSimulatorActive() {
    return isMobileSimulatorActive;
}

export function initMobileSimulator() {
    // Crear botón en la esquina superior derecha
    if (document.getElementById('mobile-simulator-btn')) return;
    
    const btn = document.createElement('button');
    btn.id = 'mobile-simulator-btn';
    btn.textContent = '📱 MÓVIL [X]';
    btn.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 99999;
        background: rgba(0, 0, 0, 0.8);
        border: 1px solid ${CONFIG.COLORS.primary};
        color: ${CONFIG.COLORS.primary};
        padding: 8px 16px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        letter-spacing: 2px;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.3s ease;
        text-transform: uppercase;
        backdrop-filter: blur(10px);
        box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    `;
    
    btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = CONFIG.COLORS.secondary;
        btn.style.color = CONFIG.COLORS.secondary;
        btn.style.boxShadow = `0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = CONFIG.COLORS.primary;
        btn.style.color = CONFIG.COLORS.primary;
        btn.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.5)';
    });
    
    btn.addEventListener('click', toggleMobileSimulator);
    
    document.body.appendChild(btn);
    simulatorButton = btn;
}

export function toggleMobileSimulator() {
    if (isMobileSimulatorActive) {
        disableMobileSimulator();
    } else {
        enableMobileSimulator();
    }
}

function enableMobileSimulator() {
    if (isMobileSimulatorActive) return;
    
    // Guardar configuración original
    originalConfig = {
        COLS: CONFIG.COLS,
        ROWS: CONFIG.ROWS,
        CELL_SIZE: CONFIG.CELL_SIZE,
        GAP: CONFIG.GAP,
        SIDEBAR_WIDTH: CONFIG.SIDEBAR_WIDTH,
        BORDER_RADIUS: CONFIG.BORDER_RADIUS
    };
    
    // Aplicar configuración móvil
    CONFIG.COLS = MOBILE_CONFIG.COLS;
    CONFIG.ROWS = MOBILE_CONFIG.ROWS;
    CONFIG.CELL_SIZE = MOBILE_CONFIG.CELL_SIZE;
    CONFIG.GAP = MOBILE_CONFIG.GAP;
    CONFIG.SIDEBAR_WIDTH = MOBILE_CONFIG.SIDEBAR_WIDTH;
    CONFIG.BORDER_RADIUS = MOBILE_CONFIG.BORDER_RADIUS;
    
    // Aplicar variables CSS
    document.documentElement.style.setProperty('--cell-size', `${MOBILE_CONFIG.CELL_SIZE}px`);
    document.documentElement.style.setProperty('--cell-gap', `${MOBILE_CONFIG.GAP}px`);
    document.documentElement.style.setProperty('--cell-radius', `${MOBILE_CONFIG.BORDER_RADIUS}px`);
    
    // Marcar como activo
    isMobileSimulatorActive = true;
    document.body.classList.add('mobile-simulator');
    if (simulatorButton) {
        simulatorButton.textContent = '📱 SALIR [X]';
        simulatorButton.style.borderColor = '#ff4444';
        simulatorButton.style.color = '#ff4444';
    }
    
    // Recrear el grid
    recreateGrid();
}

function disableMobileSimulator() {
    if (!isMobileSimulatorActive) return;
    
    // Restaurar configuración original
    if (originalConfig) {
        CONFIG.COLS = originalConfig.COLS;
        CONFIG.ROWS = originalConfig.ROWS;
        CONFIG.CELL_SIZE = originalConfig.CELL_SIZE;
        CONFIG.GAP = originalConfig.GAP;
        CONFIG.SIDEBAR_WIDTH = originalConfig.SIDEBAR_WIDTH;
        CONFIG.BORDER_RADIUS = originalConfig.BORDER_RADIUS;
        
        document.documentElement.style.setProperty('--cell-size', `${originalConfig.CELL_SIZE}px`);
        document.documentElement.style.setProperty('--cell-gap', `${originalConfig.GAP}px`);
        document.documentElement.style.setProperty('--cell-radius', `${originalConfig.BORDER_RADIUS}px`);
    }
    
    isMobileSimulatorActive = false;
    document.body.classList.remove('mobile-simulator');
    if (simulatorButton) {
        simulatorButton.textContent = '📱 MÓVIL [X]';
        simulatorButton.style.borderColor = CONFIG.COLORS.primary;
        simulatorButton.style.color = CONFIG.COLORS.primary;
    }
    
    // Recrear el grid
    recreateGrid();
}

function recreateGrid() {
    // Detener animaciones
    stopRandomAnimations();
    
    // Resetear grid
    resetGrid(false);
    
    // Remover celdas existentes
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    
    // Crear nuevo grid
    const gridData = createGrid();
    
    // Configurar eventos
    designCells.forEach(cell => {
        setupCellEvents(cell);
    });
    
    // Reposicionar
    const rect = container.getBoundingClientRect();
    const cellSize = CONFIG.CELL_SIZE;
    const { COLS: cols, ROWS: rows, GAP } = CONFIG;
    const totalWidth = cols * (cellSize + GAP) - GAP;
    const totalHeight = rows * (cellSize + GAP) - GAP;
    const offsetX = (rect.width - totalWidth) / 2;
    const offsetY = (rect.height - totalHeight) / 2;
    
    container.dataset.originalOffsetX = offsetX;
    container.dataset.originalOffsetY = offsetY;
    
    repositionGrid(offsetX, offsetY);
    repositionSidebarOverlay(offsetX, offsetY);
    repositionSidebarTexts(offsetX, offsetY);
    repositionCombinedCells(offsetX, offsetY);
    
    // Reiniciar animaciones
    setTimeout(() => {
        restartRandomAnimations();
    }, 300);
}

export function exportMobileDesign() {
    if (!isMobileSimulatorActive) {
        // Si no está en modo móvil, activarlo primero
        enableMobileSimulator();
        setTimeout(() => {
            exportDesignToJSON();
        }, 500);
        return;
    }
    
    exportDesignToJSON();
}