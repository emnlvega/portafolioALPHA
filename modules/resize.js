import { CONFIG } from './config.js';

let isResizing = false;
let resizeTarget = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeStartWidth = 0;
let resizeStartHeight = 0;
let resizeStartLeft = 0;
let resizeStartTop = 0;
let resizeDirection = null;


export function createResizeHandles(cell) {
    if (!CONFIG.RESIZE.ENABLED) return;
    if (cell.dataset.combined !== 'true') return;
    

    removeResizeHandles(cell);
    
    const handleSize = CONFIG.RESIZE.HANDLE_SIZE || 8;
    const handles = [];
    

    const positions = [
        { dir: 'n', x: '50%', y: '0', cursor: 'n-resize' },
        { dir: 's', x: '50%', y: '100%', cursor: 's-resize' },
        { dir: 'e', x: '100%', y: '50%', cursor: 'e-resize' },
        { dir: 'w', x: '0', y: '50%', cursor: 'w-resize' },
        { dir: 'ne', x: '100%', y: '0', cursor: 'ne-resize' },
        { dir: 'nw', x: '0', y: '0', cursor: 'nw-resize' },
        { dir: 'se', x: '100%', y: '100%', cursor: 'se-resize' },
        { dir: 'sw', x: '0', y: '100%', cursor: 'sw-resize' }
    ];
    
    positions.forEach(pos => {
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        handle.dataset.direction = pos.dir;
        handle.style.cssText = `
            position: absolute;
            width: ${handleSize}px;
            height: ${handleSize}px;
            background: ${CONFIG.COLORS.secondary};
            border: 2px solid ${CONFIG.COLORS.primary};
            border-radius: 50%;
            cursor: ${pos.cursor};
            left: ${pos.x};
            top: ${pos.y};
            transform: translate(-50%, -50%);
            z-index: 15;
            pointer-events: all;
            box-shadow: 0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            transition: all 0.2s ease;
        `;
        
        handle.addEventListener('mouseenter', () => {
            handle.style.transform = 'translate(-50%, -50%) scale(1.3)';
            handle.style.boxShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.6)`;
        });
        
        handle.addEventListener('mouseleave', () => {
            handle.style.transform = 'translate(-50%, -50%) scale(1)';
            handle.style.boxShadow = `0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
        });
        
        handle.addEventListener('mousedown', (e) => {
            e.preventDefault();
            e.stopPropagation();
            startResize(e, cell, pos.dir);
        });
        
        cell.appendChild(handle);
        handles.push(handle);
    });
    
    cell.dataset.hasHandles = 'true';
    return handles;
}

export function removeResizeHandles(cell) {
    if (!cell) return;
    const handles = cell.querySelectorAll('.resize-handle');
    handles.forEach(handle => handle.remove());
    if (cell.dataset) {
        cell.dataset.hasHandles = 'false';
    }
}


function startResize(e, cell, direction) {
    if (!CONFIG.RESIZE.ENABLED) return;
    
    isResizing = true;
    resizeTarget = cell;
    resizeDirection = direction;
    

    resizeStartX = e.clientX;
    resizeStartY = e.clientY;
    resizeStartLeft = parseFloat(cell.style.left);
    resizeStartTop = parseFloat(cell.style.top);
    resizeStartWidth = parseFloat(cell.style.width);
    resizeStartHeight = parseFloat(cell.style.height);
    

    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1000;
        cursor: ${e.target.style.cursor};
        pointer-events: all;
    `;
    document.body.appendChild(overlay);
    
    overlay.addEventListener('mousemove', onResize);
    overlay.addEventListener('mouseup', endResize);
    overlay.addEventListener('mouseleave', endResize);
}

function onResize(e) {
    if (!isResizing || !resizeTarget) return;
    
    const cell = resizeTarget;
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    

    let dx = e.clientX - resizeStartX;
    let dy = e.clientY - resizeStartY;
    
    let newLeft = resizeStartLeft;
    let newTop = resizeStartTop;
    let newWidth = resizeStartWidth;
    let newHeight = resizeStartHeight;
    
    const cellStep = cellSize + gap;
    
    if (resizeDirection.includes('e')) {
        const cellsDelta = Math.round(dx / cellStep);
        newWidth = Math.max(CONFIG.RESIZE.MIN_SIZE * cellStep - gap, resizeStartWidth + cellsDelta * cellStep);
        newWidth = Math.min(CONFIG.RESIZE.MAX_SIZE * cellStep - gap, newWidth);
    }
    if (resizeDirection.includes('w')) {
        const cellsDelta = Math.round(dx / cellStep);
        const newWidthTemp = Math.max(CONFIG.RESIZE.MIN_SIZE * cellStep - gap, resizeStartWidth - cellsDelta * cellStep);
        newWidth = Math.min(CONFIG.RESIZE.MAX_SIZE * cellStep - gap, newWidthTemp);
        if (newWidth !== resizeStartWidth) {
            const widthDelta = newWidth - resizeStartWidth;
            newLeft = resizeStartLeft - widthDelta;
        }
    }
    if (resizeDirection.includes('s')) {
        const cellsDelta = Math.round(dy / cellStep);
        newHeight = Math.max(CONFIG.RESIZE.MIN_SIZE * cellStep - gap, resizeStartHeight + cellsDelta * cellStep);
        newHeight = Math.min(CONFIG.RESIZE.MAX_SIZE * cellStep - gap, newHeight);
    }
    if (resizeDirection.includes('n')) {
        const cellsDelta = Math.round(dy / cellStep);
        const newHeightTemp = Math.max(CONFIG.RESIZE.MIN_SIZE * cellStep - gap, resizeStartHeight - cellsDelta * cellStep);
        newHeight = Math.min(CONFIG.RESIZE.MAX_SIZE * cellStep - gap, newHeightTemp);
        if (newHeight !== resizeStartHeight) {
            const heightDelta = newHeight - resizeStartHeight;
            newTop = resizeStartTop - heightDelta;
        }
    }
    

    if (CONFIG.RESIZE.SNAP_TO_GRID) {
        const snapX = Math.round(newLeft / cellStep) * cellStep;
        const snapY = Math.round(newTop / cellStep) * cellStep;
        newLeft = snapX;
        newTop = snapY;
    }
    

    cell.style.left = `${newLeft}px`;
    cell.style.top = `${newTop}px`;
    cell.style.width = `${newWidth}px`;
    cell.style.height = `${newHeight}px`;
    
    cell.dataset.originalX = newLeft;
    cell.dataset.originalY = newTop;
}

function endResize(e) {
    if (!isResizing) return;
    
    isResizing = false;
    
    const overlay = document.getElementById('resize-overlay');
    if (overlay) overlay.remove();
    
    resizeTarget = null;
    resizeDirection = null;
}

export function setupResizeEvents() {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    let hoverTimeout = null;
    
    container.addEventListener('mouseover', (e) => {
        const cell = e.target.closest('.grid-cell, .logo-cell');
        if (!cell) return;
        if (cell.dataset.combined !== 'true') return;
        if (cell.dataset.isSidebar === 'true') return;
        if (isResizing) return;
        
        clearTimeout(hoverTimeout);
        if (!cell.dataset.hasHandles || cell.dataset.hasHandles === 'false') {
            createResizeHandles(cell);
        }
    });
    
    container.addEventListener('mouseout', (e) => {
        const cell = e.target.closest('.grid-cell, .logo-cell');
        if (!cell) return;
        if (isResizing) return;
        
        clearTimeout(hoverTimeout);
        hoverTimeout = setTimeout(() => {
            if (cell && cell.dataset.combined === 'true') {
                const rect = cell.getBoundingClientRect();
                const mouseX = e.clientX || 0;
                const mouseY = e.clientY || 0;
                if (mouseX < rect.left || mouseX > rect.right || mouseY < rect.top || mouseY > rect.bottom) {
                    removeResizeHandles(cell);
                }
            }
        }, 300);
    });
}

export function refreshResizeHandles() {
    const cells = document.querySelectorAll('.grid-cell, .logo-cell');
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            removeResizeHandles(cell);
            createResizeHandles(cell);
        }
    });
}

export function getResizeData(cell) {
    if (cell.dataset.combined !== 'true') return null;
    
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const step = cellSize + gap;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    
    const cols = Math.round((width + gap) / step);
    const rows = Math.round((height + gap) / step);
    
    return { cols, rows, width, height };
}

export function applyResizeData(cell, data) {
    if (!data || !data.cols || !data.rows) return;
    if (cell.dataset.combined !== 'true') return;
    
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const step = cellSize + gap;
    
    const width = data.cols * step - gap;
    const height = data.rows * step - gap;
    
    cell.style.width = `${width}px`;
    cell.style.height = `${height}px`;
    
    const left = parseFloat(cell.style.left);
    const top = parseFloat(cell.style.top);
    cell.dataset.originalX = left;
    cell.dataset.originalY = top;
}