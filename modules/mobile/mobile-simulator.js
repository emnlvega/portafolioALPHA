// modules/mobile/mobile-simulator.js
import { CONFIG, MOBILE_SIMULATOR_CONFIG } from '../config.js';
import { MOBILE_CONFIG } from './mobile-config.js';
import { createGrid, repositionGrid, repositionSidebarOverlay, repositionSidebarTexts, repositionCombinedCells } from '../grid.js';
import { resetGrid, exportDesignToJSON, designCells, setDesignCells, setupCellEvents } from '../interactions.js';
import { importDesignFromJSON } from '../logo.js';
import { stopRandomAnimations, restartRandomAnimations } from '../animations.js';

let isMobileSimulatorActive = false;
let originalConfig = null;
let overlayButtons = [];
let navButtonsVisible = true;
let architectActive = false;
let architectModule = null;

export function isSimulatorActive() {
    return isMobileSimulatorActive;
}

export function toggleMobileSimulator() {
    if (!MOBILE_SIMULATOR_CONFIG.ENABLED) return;
    if (isMobileSimulatorActive) {
        disableMobileSimulator();
    } else {
        enableMobileSimulator();
    }
}

function enableMobileSimulator() {
    if (isMobileSimulatorActive) return;
    
    const currentPage = document.body.dataset.mobilePage || 'inicio';
    if (currentPage !== 'inicio') return;
    
    originalConfig = {
        COLS: CONFIG.COLS,
        ROWS: CONFIG.ROWS,
        CELL_SIZE: CONFIG.CELL_SIZE,
        GAP: CONFIG.GAP,
        SIDEBAR_WIDTH: CONFIG.SIDEBAR_WIDTH,
        BORDER_RADIUS: CONFIG.BORDER_RADIUS
    };
    
    CONFIG.COLS = MOBILE_CONFIG.COLS;
    CONFIG.ROWS = MOBILE_CONFIG.ROWS;
    CONFIG.CELL_SIZE = MOBILE_CONFIG.CELL_SIZE;
    CONFIG.GAP = MOBILE_CONFIG.GAP;
    CONFIG.SIDEBAR_WIDTH = MOBILE_CONFIG.SIDEBAR_WIDTH;
    CONFIG.BORDER_RADIUS = MOBILE_CONFIG.BORDER_RADIUS;
    
    document.documentElement.style.setProperty('--cell-size', `${MOBILE_CONFIG.CELL_SIZE}px`);
    document.documentElement.style.setProperty('--cell-gap', `${MOBILE_CONFIG.GAP}px`);
    document.documentElement.style.setProperty('--cell-radius', `${MOBILE_CONFIG.BORDER_RADIUS}px`);
    
    isMobileSimulatorActive = true;
    document.body.classList.add('mobile-simulator');
    document.body.dataset.mobilePage = 'inicio';
    architectActive = false;
    navButtonsVisible = true;
    
    recreateGrid();
    setTimeout(createOverlayButtons, 200);
}

function disableMobileSimulator() {
    if (!isMobileSimulatorActive) return;
    
    // Desactivar modo arquitecto si está activo
    if (architectActive && architectModule) {
        architectModule.toggleArchitectMode();
        architectActive = false;
        architectModule = null;
    }
    
    isMobileSimulatorActive = false;
    document.body.classList.remove('mobile-simulator');
    delete document.body.dataset.mobilePage;
    
    removeOverlayButtons();
    
    // 🔥 RECARGAR LA PÁGINA PARA VOLVER AL ESTADO ORIGINAL
    window.location.reload();
}

function recreateGrid() {
    stopRandomAnimations();
    resetGrid(false);
    
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    
    const gridData = createGrid();
    
    designCells.forEach(cell => {
        setupCellEvents(cell);
    });
    
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
    
    setTimeout(() => {
        restartRandomAnimations();
    }, 300);
}

function createOverlayButtons() {
    removeOverlayButtons();
    
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    
    const btnWidth = 100;
    const btnHeight = 32;
    const spacing = 6;
    
    const btnConfigs = [];
    if (MOBILE_SIMULATOR_CONFIG.SHOW_COORDINATES) {
        btnConfigs.push({ id: 'btn-coords', text: '◈ COORD', action: 'coords' });
    }
    if (MOBILE_SIMULATOR_CONFIG.SHOW_EXPORT) {
        btnConfigs.push({ id: 'btn-export', text: '◆ EXPORT', action: 'export' });
    }
    if (MOBILE_SIMULATOR_CONFIG.SHOW_IMPORT) {
        btnConfigs.push({ id: 'btn-import', text: '◊ IMPORT', action: 'import' });
    }
    if (MOBILE_SIMULATOR_CONFIG.SHOW_NAV_TOGGLE) {
        btnConfigs.push({ id: 'btn-nav', text: '▣ NAV', action: 'nav' });
    }
    if (MOBILE_SIMULATOR_CONFIG.SHOW_EXIT) {
        btnConfigs.push({ id: 'btn-exit', text: '✕ SALIR', action: 'exit' });
    }
    
    const totalBtns = btnConfigs.length;
    if (totalBtns === 0) return;
    
    const totalWidth = totalBtns * (btnWidth + spacing) - spacing;
    const startX = (rect.width - totalWidth) / 2;
    const y = rect.height - btnHeight - 15;
    
    btnConfigs.forEach((cfg, index) => {
        const btn = document.createElement('div');
        btn.id = cfg.id;
        btn.textContent = cfg.text;
        btn.style.cssText = `
            position: absolute;
            left: ${startX + index * (btnWidth + spacing)}px;
            top: ${y}px;
            z-index: 99998;
            background: rgba(0, 0, 0, 0.85);
            border: 1px solid ${CONFIG.COLORS.primary};
            color: ${CONFIG.COLORS.primary};
            padding: 0;
            width: ${btnWidth}px;
            height: ${btnHeight}px;
            font-family: 'Courier New', monospace;
            font-size: 9px;
            letter-spacing: 1px;
            cursor: pointer;
            border-radius: 4px;
            transition: all 0.3s ease;
            text-transform: uppercase;
            backdrop-filter: blur(8px);
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.6);
            pointer-events: auto;
            user-select: none;
            text-align: center;
            line-height: ${btnHeight}px;
            font-weight: bold;
        `;
        
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = CONFIG.COLORS.secondary;
            btn.style.color = CONFIG.COLORS.secondary;
            btn.style.boxShadow = `0 2px 25px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
            btn.style.transform = 'scale(1.05)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = CONFIG.COLORS.primary;
            btn.style.color = CONFIG.COLORS.primary;
            btn.style.boxShadow = '0 2px 15px rgba(0, 0, 0, 0.6)';
            btn.style.transform = 'scale(1)';
        });
        
        btn.addEventListener('click', () => {
            handleButtonAction(cfg.action, btn);
        });
        
        container.appendChild(btn);
        overlayButtons.push(btn);
    });
}

function removeOverlayButtons() {
    overlayButtons.forEach(btn => btn.remove());
    overlayButtons = [];
}

async function handleButtonAction(action, btn) {
    switch (action) {
        case 'coords':
            if (!architectModule) {
                architectModule = await import('../architect.js');
            }
            architectActive = !architectActive;
            if (architectActive) {
                architectModule.toggleArchitectMode();
                setTimeout(architectModule.updateArchitectOverlay, 100);
                if (btn) {
                    btn.textContent = '◈ COORD ON';
                    btn.style.borderColor = '#ffaa00';
                    btn.style.color = '#ffaa00';
                }
            } else {
                architectModule.toggleArchitectMode();
                if (btn) {
                    btn.textContent = '◈ COORD';
                    btn.style.borderColor = CONFIG.COLORS.primary;
                    btn.style.color = CONFIG.COLORS.primary;
                }
            }
            break;
        case 'export':
            exportDesignToJSON();
            break;
        case 'import':
            const { showImportDialog } = await import('../dialogs.js');
            showImportDialog();
            break;
        case 'nav':
            toggleNav();
            break;
        case 'exit':
            disableMobileSimulator();
            break;
    }
}

function toggleNav() {
    const container = document.getElementById('grid-container');
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let navCells = [];
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            if (row === 30) {
                navCells.push(cell);
            }
        }
    });
    
    if (navButtonsVisible) {
        // Quitar NAV - Exportar diseño actual sin las celdas de navegación
        const currentDesign = {};
        const allDesignCells = document.querySelectorAll('.grid-cell, .logo-cell');
        allDesignCells.forEach(cell => {
            if (cell.dataset.combined === 'true') {
                const row = parseInt(cell.dataset.designRow);
                const col = parseInt(cell.dataset.designCol);
                if (row !== 30) {
                    const key = `${row},${col}`;
                    const state = cell.dataset.state || 'normal';
                    const left = parseFloat(cell.style.left);
                    const top = parseFloat(cell.style.top);
                    const width = parseFloat(cell.style.width);
                    const height = parseFloat(cell.style.height);
                    currentDesign[key] = {
                        type: state === 'normal' ? 'combined_normal' : 
                              state === 'red' ? 'combined_red' : 
                              state === 'logo' ? 'combined_logo' : 'combined_normal',
                        left: left,
                        top: top,
                        width: width,
                        height: height,
                        combined: true
                    };
                }
            }
        });
        
        stopRandomAnimations();
        resetGrid(false);
        importDesignFromJSON(currentDesign, () => {
            createOverlayButtons();
            restartRandomAnimations();
        }, true);
        
        navButtonsVisible = false;
        const navBtn = document.getElementById('btn-nav');
        if (navBtn) {
            navBtn.textContent = '▣ NAV OFF';
            navBtn.style.borderColor = '#ff4444';
            navBtn.style.color = '#ff4444';
        }
    } else {
        // Restaurar NAV
        fetch('./modules/mobile/sidebar-movil.json')
            .then(response => response.json())
            .then(sidebarDesign => {
                const currentDesign = {};
                const allDesignCells = document.querySelectorAll('.grid-cell, .logo-cell');
                allDesignCells.forEach(cell => {
                    if (cell.dataset.combined === 'true') {
                        const row = parseInt(cell.dataset.designRow);
                        const col = parseInt(cell.dataset.designCol);
                        if (row !== 30) {
                            const key = `${row},${col}`;
                            const state = cell.dataset.state || 'normal';
                            const left = parseFloat(cell.style.left);
                            const top = parseFloat(cell.style.top);
                            const width = parseFloat(cell.style.width);
                            const height = parseFloat(cell.style.height);
                            currentDesign[key] = {
                                type: state === 'normal' ? 'combined_normal' : 
                                      state === 'red' ? 'combined_red' : 
                                      state === 'logo' ? 'combined_logo' : 'combined_normal',
                                left: left,
                                top: top,
                                width: width,
                                height: height,
                                combined: true
                            };
                        }
                    }
                });
                
                const finalDesign = { ...currentDesign, ...sidebarDesign };
                
                stopRandomAnimations();
                resetGrid(false);
                importDesignFromJSON(finalDesign, () => {
                    createOverlayButtons();
                    import('./mobile-nav.js').then(module => {
                        module.createMobileNavButtons('inicio');
                    });
                    restartRandomAnimations();
                }, true);
                
                navButtonsVisible = true;
                const navBtn = document.getElementById('btn-nav');
                if (navBtn) {
                    navBtn.textContent = '▣ NAV';
                    navBtn.style.borderColor = CONFIG.COLORS.primary;
                    navBtn.style.color = CONFIG.COLORS.primary;
                }
            })
            .catch(() => {
                recreateGrid();
                setTimeout(createOverlayButtons, 200);
                navButtonsVisible = true;
            });
    }
}