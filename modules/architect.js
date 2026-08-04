// modules/architect.js

import { CONFIG } from './config.js';

let isArchitectMode = false;
let architectOverlay = null;
let coordinateLabels = [];
let resizeTimeout = null;

// ===== DETECTAR INTERACCIÓN DEL USUARIO PARA CERRAR =====
function setupAutoCloseListeners() {
    const closeArchitect = () => {
        if (isArchitectMode) {
            hideArchitectOverlay();
            isArchitectMode = false;
            removeAutoCloseListeners();
        }
    };

    // Click en cualquier parte
    document.addEventListener('click', closeArchitect, { once: false });
    
    // Teclas (cualquier tecla)
    document.addEventListener('keydown', closeArchitect, { once: false });
    
    // Cambio de página (observar el estado de página especial)
    const observer = new MutationObserver(() => {
        // Si se activa una página especial, cerrar
        if (document.querySelector('.proyectos-content, .sobre-mi-content, .contacto-content')) {
            if (isArchitectMode) {
                hideArchitectOverlay();
                isArchitectMode = false;
                removeAutoCloseListeners();
                observer.disconnect();
            }
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    
    // Guardar referencias para limpiar
    window._architectCloseListeners = {
        click: closeArchitect,
        keydown: closeArchitect,
        observer: observer
    };
}

function removeAutoCloseListeners() {
    if (window._architectCloseListeners) {
        document.removeEventListener('click', window._architectCloseListeners.click);
        document.removeEventListener('keydown', window._architectCloseListeners.keydown);
        if (window._architectCloseListeners.observer) {
            window._architectCloseListeners.observer.disconnect();
        }
        delete window._architectCloseListeners;
    }
}

export function toggleArchitectMode() {
    // Verificar si está habilitado en la configuración
    if (!CONFIG.ARCHITECT_MODE.ENABLED) {
        return false;
    }
    
    if (isArchitectMode) {
        hideArchitectOverlay();
        isArchitectMode = false;
        removeAutoCloseListeners();
    } else {
        showArchitectOverlay();
        isArchitectMode = true;
        setupAutoCloseListeners();
    }
    return isArchitectMode;
}

export function isArchitectModeActive() {
    return isArchitectMode;
}

export function updateArchitectOverlay() {
    if (isArchitectMode && CONFIG.ARCHITECT_MODE.ENABLED) {
        hideArchitectOverlay();
        showArchitectOverlay();
    }
}

export function getArchitectModeStatus() {
    return {
        active: isArchitectMode,
        enabled: CONFIG.ARCHITECT_MODE.ENABLED
    };
}

// ===== FUNCIÓN PARA CALCULAR TAMAÑO DE CELDA COMBINADA =====
function getCombinedSize(cell) {
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const step = cellSize + gap;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    
    if (isNaN(width) || isNaN(height)) return null;
    
    // Calcular cuántas celdas ocupa (redondeo)
    const cols = Math.round((width + gap) / step);
    const rows = Math.round((height + gap) / step);
    
    return { cols, rows };
}

function showArchitectOverlay() {
    if (!CONFIG.ARCHITECT_MODE.ENABLED) return;
    
    const container = document.getElementById('grid-container');
    if (!container) return;

    // Crear overlay principal
    architectOverlay = document.createElement('div');
    architectOverlay.id = 'architect-overlay';
    architectOverlay.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 100;
    `;
    container.appendChild(architectOverlay);

    const archConfig = CONFIG.ARCHITECT_MODE;
    const containerRect = container.getBoundingClientRect();

    // Obtener todas las celdas de diseño
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    cells.forEach(cell => {
        // Ignorar celdas de sidebar
        if (cell.dataset.isSidebar === 'true') return;
        
        // Si es una celda combinada, mostrar la coordenada de la celda base
        const isCombined = cell.dataset.combined === 'true';
        let row, col;
        
        if (isCombined) {
            row = parseInt(cell.dataset.designRow);
            col = parseInt(cell.dataset.designCol);
        } else {
            row = parseInt(cell.dataset.designRow);
            col = parseInt(cell.dataset.designCol);
        }
        
        if (isNaN(row) || isNaN(col)) return;

        const rect = cell.getBoundingClientRect();
        
        // Verificar que la celda sea visible
        if (rect.width === 0 || rect.height === 0) return;

        // Crear etiqueta de coordenada
        const label = document.createElement('div');
        label.className = 'architect-label';
        
        // ===== CONSTRUIR TEXTO =====
        let labelText = `(${row}, ${col})`;
        
        if (isCombined) {
            const size = getCombinedSize(cell);
            if (size) {
                labelText += `  ${size.cols}×${size.rows}`;
            }
        }
        label.textContent = labelText;
        
        const fontSize = archConfig.FONT_SIZE || 11;
        const opacity = archConfig.OPACITY || 0.7;
        const color = archConfig.COLOR || '#00ff91';
        const showGrid = archConfig.SHOW_GRID !== undefined ? archConfig.SHOW_GRID : true;
        
        // Ajustar tamaño de fuente según el tamaño de la celda
        let finalFontSize = fontSize;
        if (rect.width < 50) {
            finalFontSize = Math.max(8, fontSize * 0.7);
        } else if (rect.width < 80) {
            finalFontSize = Math.max(9, fontSize * 0.85);
        }
        
        label.style.cssText = `
            position: absolute;
            left: ${rect.left - containerRect.left}px;
            top: ${rect.top - containerRect.top}px;
            width: ${rect.width}px;
            height: ${rect.height}px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${color};
            font-family: 'Courier New', monospace;
            font-size: ${finalFontSize}px;
            font-weight: bold;
            letter-spacing: 0.5px;
            text-shadow: 
                0 0 10px ${color},
                0 0 20px ${color},
                0 0 40px rgba(0, 255, 145, 0.3);
            background: rgba(0, 0, 0, ${opacity});
            border: ${showGrid ? `1px solid rgba(0, 255, 145, 0.2)` : 'none'};
            border-radius: 2px;
            pointer-events: none;
            z-index: 101;
            user-select: none;
            -webkit-user-select: none;
            transition: all 0.3s ease;
        `;
        
        // Si la celda está combinada, dar un estilo especial
        if (isCombined) {
            label.style.borderColor = 'rgba(255, 255, 255, 0.4)';
            label.style.background = 'rgba(0, 0, 0, 0.8)';
            label.style.fontWeight = 'bold';
            label.style.fontSize = `${Math.min(finalFontSize * 1.3, 16)}px`;
            label.style.color = '#ffffff';
            label.style.textShadow = `
                0 0 15px ${color},
                0 0 30px ${color},
                0 0 60px rgba(0, 255, 145, 0.3)
            `;
            
            // Mostrar el tamaño en una segunda línea para mejor legibilidad
            const size = getCombinedSize(cell);
            if (size) {
                // Ya lo incluimos en el texto principal
            }
        }

        // Efecto sutil al pasar el mouse (aunque no sea interactivo)
        label.addEventListener('mouseenter', () => {
            label.style.transform = 'scale(1.1)';
            label.style.borderColor = 'rgba(0, 255, 145, 0.8)';
            label.style.boxShadow = '0 0 20px rgba(0, 255, 145, 0.3)';
            label.style.zIndex = '102';
        });
        label.addEventListener('mouseleave', () => {
            label.style.transform = 'scale(1)';
            label.style.borderColor = isCombined ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 255, 145, 0.2)';
            label.style.boxShadow = 'none';
            label.style.zIndex = '101';
        });

        architectOverlay.appendChild(label);
        coordinateLabels.push(label);
    });
}

function hideArchitectOverlay() {
    if (architectOverlay) {
        architectOverlay.remove();
        architectOverlay = null;
    }
    coordinateLabels = [];
}

// Función para limpiar recursos (llamar en beforeunload)
export function cleanupArchitectMode() {
    hideArchitectOverlay();
    isArchitectMode = false;
    removeAutoCloseListeners();
    if (resizeTimeout) {
        clearTimeout(resizeTimeout);
        resizeTimeout = null;
    }
}