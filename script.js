import { CONFIG, LOGO_DESIGN, updateColors, getCurrentColors } from './modules/config.js';
import { createGrid, repositionGrid, repositionSidebarOverlay, repositionSidebarTexts, repositionCombinedCells } from './modules/grid.js';
import { resetGrid, exportDesignToJSON, designCells, setupCellEvents, toggleCellOff } from './modules/interactions.js';
import { importDesignFromJSON } from './modules/logo.js';
import { animateSidebar, returnToMainLogo, isSpecialPageActiveCheck, handleSidebarAction } from './modules/sidebar/index.js';
import { startRandomAnimations, stopRandomAnimations, restartRandomAnimations } from './modules/animations.js';
import { toggleArchitectMode, updateArchitectOverlay, isArchitectModeActive } from './modules/architect.js';
import { initOverlays, pauseOverlays, resumeOverlays, setOverlayOpacity, setOverlayBlendMode, destroyOverlays, setOverlayRandomOrder } from './modules/overlay.js';
import { initSettings, toggleSettings, closeSettings } from './modules/settings.js';
import { showDialog, showImportDialog } from './modules/dialogs.js';

let gridData = null;

function injectCSSVariables() {
    const { COLORS } = CONFIG;
    const root = document.documentElement;
    
    root.style.setProperty('--color-primary', COLORS.primary);
    root.style.setProperty('--color-primary-rgb', COLORS.primaryRGB);
    root.style.setProperty('--color-secondary', COLORS.secondary);
    root.style.setProperty('--color-secondary-rgb', COLORS.secondaryRGB);
    root.style.setProperty('--color-bg', COLORS.background);
    
    root.style.setProperty('--color-primary-dim', COLORS.primaryDim);
    root.style.setProperty('--color-primary-very-dim', COLORS.primaryVeryDim);
    root.style.setProperty('--color-secondary-dim', COLORS.secondaryDim);
    root.style.setProperty('--scanline-color', COLORS.scanlineColor);
    root.style.setProperty('--vignette-color', COLORS.vignetteColor);
    root.style.setProperty('--bloom-color', COLORS.bloomColor);
    
    root.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
    root.style.setProperty('--cell-gap', `${CONFIG.GAP}px`);
    root.style.setProperty('--cell-radius', `${CONFIG.BORDER_RADIUS}px`);
    
    root.style.setProperty('--glow-primary-intense', `0 0 5px rgba(${COLORS.primaryRGB}, 1)`);
    root.style.setProperty('--glow-primary-medium', `0 0 40px rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--glow-primary-soft', `0 0 80px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--glow-primary-inset', `inset 0 0 40px rgba(${COLORS.primaryRGB}, 0.12)`);
    
    root.style.setProperty('--glow-secondary-intense', `0 0 5px rgba(${COLORS.secondaryRGB}, 1)`);
    root.style.setProperty('--glow-secondary-medium', `0 0 30px rgba(${COLORS.secondaryRGB}, 0.1)`);
    root.style.setProperty('--glow-secondary-soft', `0 0 60px rgba(${COLORS.secondaryRGB}, 0.05)`);
    root.style.setProperty('--glow-secondary-inset', `inset 0 0 30px rgba(${COLORS.secondaryRGB}, 0.05)`);
    
    root.style.setProperty('--glow-hover-intense', `0 0 5px rgba(${COLORS.secondaryRGB}, 1)`);
    root.style.setProperty('--glow-hover-medium', `0 0 60px rgba(${COLORS.secondaryRGB}, 0.2)`);
    root.style.setProperty('--glow-hover-soft', `0 0 120px rgba(${COLORS.secondaryRGB}, 0.08)`);
    root.style.setProperty('--glow-hover-inset', `inset 0 0 40px rgba(${COLORS.secondaryRGB}, 0.08)`);
    
    root.style.setProperty('--text-shadow-normal', `
        0 0 10px rgba(${COLORS.primaryRGB}, 1),
        0 0 20px rgba(${COLORS.primaryRGB}, 1),
        0 0 60px rgba(${COLORS.primaryRGB}, 0.50),
        0 0 100px rgba(${COLORS.primaryRGB}, 0.25),
        0 0 150px rgba(${COLORS.primaryRGB}, 0.1)
    `);
    
    root.style.setProperty('--text-shadow-hover', `
        0 0 5px rgba(${COLORS.primaryRGB}, 1),
        0 0 20px rgba(${COLORS.primaryRGB}, 0.8),
        0 0 40px rgba(${COLORS.primaryRGB}, 0.4),
        0 0 80px rgba(${COLORS.primaryRGB}, 0.2),
        0 0 120px rgba(${COLORS.primaryRGB}, 0.1)
    `);
    
    root.style.setProperty('--text-shadow-active', `
        0 0 20px rgba(${COLORS.primaryRGB}, 0.8),
        0 0 40px rgba(${COLORS.primaryRGB}, 0.4),
        0 0 80px rgba(${COLORS.primaryRGB}, 0.2)
    `);
    
    root.style.setProperty('--scanline-red', `rgba(${COLORS.primaryRGB}, 0.10)`);
    root.style.setProperty('--scanline-white', `rgba(${COLORS.secondaryRGB}, 0.06)`);
    root.style.setProperty('--scanline-normal', `rgba(${COLORS.primaryRGB}, 0.03)`);
    
    root.style.setProperty('--border-primary', `1px solid ${COLORS.primary}`);
    root.style.setProperty('--border-primary-light', `2px solid rgba(${COLORS.primaryRGB}, 0.08)`);
    root.style.setProperty('--border-primary-dim', `1px solid rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--border-off', `1px solid rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--border-off-hover', `rgba(${COLORS.secondaryRGB}, 0.25)`);
    
    root.style.setProperty('--sidebar-shadow', `0 0 40px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--sidebar-inset', `inset 0 0 40px rgba(${COLORS.primaryRGB}, 0.05)`);
    
    root.style.setProperty('--dialog-border', `2px solid rgba(${COLORS.primaryRGB}, 0.6)`);
    root.style.setProperty('--dialog-shadow', `0 0 50px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--dialog-inset', `inset 0 0 50px rgba(${COLORS.primaryRGB}, 0.05)`);
    
    root.style.setProperty('--bloom-center', '0%');
    root.style.setProperty('--bloom-edge', 'transparent 70%');
    
    root.style.setProperty('--crt-curvature-center', 'transparent 40%');
    root.style.setProperty('--crt-curvature-mid', 'rgba(0, 0, 0, 0.05) 55%');
    root.style.setProperty('--crt-curvature-mid2', 'rgba(0, 0, 0, 0.2) 70%');
    root.style.setProperty('--crt-curvature-mid3', 'rgba(0, 0, 0, 0.5) 85%');
    root.style.setProperty('--crt-curvature-mid4', 'rgba(0, 0, 0, 0.85) 95%');
    root.style.setProperty('--crt-curvature-edge', 'rgba(0, 0, 0, 1) 100%');
    
    root.style.setProperty('--crt-reflection-center', 'rgba(255, 255, 255, 0.04) 0%');
    root.style.setProperty('--crt-reflection-mid', 'rgba(255, 255, 255, 0.01) 25%');
    root.style.setProperty('--crt-reflection-edge', 'transparent 60%');
}

function regenerateEverything() {
    // Eliminar overlays y textos del sidebar (pero NO el grid)
    const oldOverlay = document.querySelector('.sidebar-overlay');
    const oldSidebarTexts = document.querySelectorAll('.sidebar-text');
    if (oldOverlay) oldOverlay.remove();
    oldSidebarTexts.forEach(el => el.remove());
    
    stopRandomAnimations();
    
    // En lugar de createGrid(), simplemente actualizamos colores y reposicionamos
    // Las celdas ya existen, solo hay que refrescar sus estilos
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
    allCells.forEach(cell => {
        // Actualizar colores de borde y fondo según el nuevo CONFIG
        if (cell.dataset.isSidebar !== 'true') {
            const state = cell.dataset.state || 'normal';
            if (state === 'off') {
                cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
                cell.style.backgroundColor = CONFIG.COLORS.background;
            } else if (state === 'logo' || state === 'combined_logo') {
                cell.style.border = 'none';
                cell.style.borderColor = 'transparent';
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
            } else if (state === 'red' || state === 'combined_red') {
                cell.style.backgroundColor = CONFIG.COLORS.primary;
                cell.style.borderColor = CONFIG.COLORS.primary;
            } else {
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.backgroundColor = CONFIG.COLORS.background;
            }
        }
    });
    
    // Reposicionar todo (usando el offset actual)
    const container = document.getElementById('grid-container');
    const rect = container.getBoundingClientRect();
    const cellSize = CONFIG.CELL_SIZE;
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH } = CONFIG;
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
    
    // Reimportar el diseño del logo (esto modificará las celdas combinadas)
    setTimeout(() => {
        importDesignFromJSON(LOGO_DESIGN);
    }, 100);
    
    // Animar sidebar y reiniciar animaciones
    setTimeout(() => {
        animateSidebar(
            gridData.sidebarCells,
            gridData.rows,
            gridData.cellSize,
            gridData.offsetX,
            gridData.offsetY
        );
        setTimeout(() => {
            restartRandomAnimations();
        }, 500);
    }, CONFIG.LOGO_DELAY + 500);
}

document.addEventListener('colorsUpdated', function(e) {
    const { colors } = e.detail;
    CONFIG.COLORS = colors;
    injectCSSVariables();
    
    // Actualizar sidebar cells
    document.querySelectorAll('.sidebar-cell').forEach(cell => {
        cell.style.borderColor = colors.primary;
        cell.style.backgroundColor = colors.background;
    });
    // Actualizar overlay
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
        overlay.style.borderColor = colors.primary;
        overlay.style.backgroundColor = colors.background;
    }
    
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.value = colors.primary;
    }
    
    const container = document.getElementById('color-picker-container');
    if (container) {
        container.style.color = colors.primary;
        const input = container.querySelector('#colorPicker');
        if (input) input.style.borderColor = colors.primary;
        const icon = container.querySelector('span:first-child');
        if (icon) {
            icon.style.color = colors.primary;
            icon.style.textShadow = `0 0 20px rgba(${colors.primaryRGB}, 0.3)`;
        }
        const hexLabel = container.querySelector('#colorHexLabel');
        if (hexLabel) {
            hexLabel.textContent = colors.primary.toUpperCase();
        }
    }
    
    regenerateEverything();
});

export function createColorPickerForSidebar() {
    const container = document.createElement('div');
    container.id = 'color-picker-container';
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid ${CONFIG.COLORS.primary};
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        color: ${CONFIG.COLORS.primary};
        letter-spacing: 1px;
        opacity: 0;
        transition: opacity 0.5s ease, border-color 0.3s ease, color 0.3s ease;
        margin-top: 10px;
        justify-content: center;
    `;
    
    const colorDot = document.createElement('span');
    colorDot.style.cssText = `
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${CONFIG.COLORS.primary};
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
        transition: all 0.3s ease;
    `;
    
    const input = document.createElement('input');
    input.id = 'colorPicker';
    input.type = 'color';
    input.value = CONFIG.COLORS.primary;
    input.style.cssText = `
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
    `;
    
    const hexLabel = document.createElement('span');
    hexLabel.id = 'colorHexLabel';
    hexLabel.textContent = CONFIG.COLORS.primary.toUpperCase();
    hexLabel.style.cssText = `
        font-size: 8px;
        letter-spacing: 1px;
        opacity: 0.8;
        font-weight: bold;
        font-family: 'Courier New', monospace;
    `;
    
    container.addEventListener('click', function(e) {
        if (e.target !== input) {
            input.click();
        }
    });
    
    input.addEventListener('input', function(e) {
        const newColor = e.target.value;
        hexLabel.textContent = newColor.toUpperCase();
        colorDot.style.background = newColor;
        container.style.borderColor = newColor;
        container.style.color = newColor;
        updateColors(newColor);
    });
    
    container.appendChild(colorDot);
    container.appendChild(input);
    container.appendChild(hexLabel);
    
    container.addEventListener('mouseenter', () => {
        container.style.borderColor = CONFIG.COLORS.secondary;
        container.style.color = CONFIG.COLORS.secondary;
    });
    container.addEventListener('mouseleave', () => {
        container.style.borderColor = CONFIG.COLORS.primary;
        container.style.color = CONFIG.COLORS.primary;
    });
    
    return container;
}

document.addEventListener('contextmenu', function(e) {
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer && gridContainer.contains(e.target)) {
        e.preventDefault();
        return false;
    }
    if (e.target.closest('#color-picker-container')) {
        return true;
    }
    const sidebarText = e.target.closest('.sidebar-text');
    if (sidebarText) {
        return true;
    }
    const dialog = e.target.closest('#custom-dialog, #projects-dialog');
    if (dialog) {
        return true;
    }
});

// ===== KEYBOARD SHORTCUTS =====
document.addEventListener('keydown', (e) => {
    // Si el foco está en un input/textarea, ignorar atajos
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
    }

    // === ESC: Cerrar diálogo si está abierto, o volver al inicio ===
    if (e.key === 'Escape') {
        const dialogsOpen = document.querySelectorAll(
            '#custom-dialog.active, #projects-dialog.active, #import-dialog.active, #settings-dialog[style*="display: flex"]'
        );
        
        if (dialogsOpen.length > 0) {
            // Cerrar el diálogo que esté abierto
            dialogsOpen.forEach(d => {
                if (d.id === 'settings-dialog') {
                    closeSettings();
                } else {
                    d.classList.remove('active');
                }
            });
            e.preventDefault();
            return;
        }
        
        // Si no hay diálogos abiertos, volver al inicio
        if (isSpecialPageActiveCheck()) {
            e.preventDefault();
            returnToMainLogo();
            document.querySelectorAll('.sidebar-text').forEach(el => {
                el.classList.remove('active');
                el.style.color = CONFIG.COLORS.primary;
                el.style.textShadow = 'var(--text-shadow-normal)';
            });
            const inicioText = document.querySelector('.sidebar-text[data-action="inicio"]');
            if (inicioText) {
                inicioText.classList.add('active');
                inicioText.style.color = CONFIG.COLORS.secondary;
                inicioText.style.textShadow = 'var(--text-shadow-active)';
            }
            window.proyectosCurrentPage = 0;
            window.proyectosCurrentCategory = 'TODOS';
        }
        return;
    }

    // === E: Exportar diseño ===
    if (e.key === 'e' || e.key === 'E') {
        if (CONFIG.ENABLE_EXPORT) {
            e.preventDefault();
            exportDesignToJSON();
        }
        return;
    }

    // === I: Importar diseño ===
    if (e.key === 'i' || e.key === 'I') {
        if (CONFIG.ENABLE_IMPORT) {
            e.preventDefault();
            console.log('🔽 Abriendo diálogo de importación...');
            showImportDialog();
        }
        return;
    }

    // === P: Proyectos ===
    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        handleSidebarAction('proyectos');
        return;
    }

    // === S: Sobre Mi ===
    if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSidebarAction('sobre-mi');
        return;
    }

    // === C: Contacto ===
    if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleSidebarAction('contacto');
        return;
    }

    // === M: Menú (Configuración) ===
    if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSettings();
        return;
    }

    // === Espacio: Reset grid ===
    if (e.key === ' ') {
        e.preventDefault();
        resetGrid();
        return;
    }

    // === A: Modo Arquitecto ===
    if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const active = toggleArchitectMode();
        if (active) {
            updateArchitectOverlay();
        }
        console.log(`Modo Arquitecto: ${active ? 'ACTIVADO' : 'DESACTIVADO'}`);
        return;
    }
});

function init() {
    injectCSSVariables();
    
    gridData = createGrid();
    
    designCells.forEach(cell => {
        setupCellEvents(cell);
    });
    
    const container = document.getElementById('grid-container');
    container.addEventListener('contextmenu', function(e) {
        const cell = e.target.closest('.grid-cell, .logo-cell');
        if (cell && !cell.dataset.isSidebar) {
            e.preventDefault();
            toggleCellOff(cell);
        }
    });
    
    setTimeout(() => {
        importDesignFromJSON(LOGO_DESIGN);
    }, CONFIG.LOGO_DELAY || 500);
    
    setTimeout(() => {
        animateSidebar(
            gridData.sidebarCells,
            gridData.rows,
            gridData.cellSize,
            gridData.offsetX,
            gridData.offsetY
        );
        setTimeout(() => {
            startRandomAnimations();
        }, 500);
    }, CONFIG.LOGO_DELAY + 500);
    
    initOverlays();
    initSettings();
}

window.addEventListener('beforeunload', () => {
    stopRandomAnimations();
});

let resizeTimeout;
let isResizing = false;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (isResizing) return;
        isResizing = true;
        
        const container = document.getElementById('grid-container');
        const rect = container.getBoundingClientRect();
        const cellSize = CONFIG.CELL_SIZE;
        const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH } = CONFIG;
        
        const totalWidth = cols * (cellSize + GAP) - GAP;
        const totalHeight = rows * (cellSize + GAP) - GAP;
        const newOffsetX = (rect.width - totalWidth) / 2;
        const newOffsetY = (rect.height - totalHeight) / 2;
        
        container.dataset.originalOffsetX = newOffsetX;
        container.dataset.originalOffsetY = newOffsetY;
        
        repositionGrid(newOffsetX, newOffsetY);
        repositionSidebarOverlay(newOffsetX, newOffsetY);
        repositionSidebarTexts(newOffsetX, newOffsetY);
        repositionCombinedCells(newOffsetX, newOffsetY);
        
        if (isArchitectModeActive()) {
            setTimeout(updateArchitectOverlay, 100);
        }
        
        isResizing = false;
    }, 50);
});

document.addEventListener('DOMContentLoaded', init);