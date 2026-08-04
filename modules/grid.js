import { CONFIG } from './config.js';
import { designCells, setDesignCells, setupCellEvents } from './interactions.js';

export function getCellPosition(col, row, cellSize, offsetX, offsetY) {
    return {
        x: offsetX + col * (cellSize + CONFIG.GAP),
        y: offsetY + row * (cellSize + CONFIG.GAP)
    };
}

export function createCell(className, x, y, size, dataset = {}) {
    const cell = document.createElement('div');
    cell.className = className;
    cell.style.width = `${size}px`;
    cell.style.height = `${size}px`;
    cell.style.left = `${x}px`;
    cell.style.top = `${y}px`;
    cell.style.borderRadius = `${CONFIG.BORDER_RADIUS}px`;
    cell.style.backgroundColor = CONFIG.COLORS.background;
    cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
    cell.style.borderColor = CONFIG.COLORS.primary;
    
    cell.dataset.originalX = x;
    cell.dataset.originalY = y;
    
    Object.entries(dataset).forEach(([key, value]) => {
        cell.dataset[key] = value;
    });
    return cell;
}

// ---------- INICIALIZACIÓN (SOLO UNA VEZ) ----------
export function createGrid() {
    const container = document.getElementById('grid-container');
    container.innerHTML = '';
    
    const rect = container.getBoundingClientRect();
    const cellSize = CONFIG.CELL_SIZE;
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH } = CONFIG;
    
    const totalWidth = cols * (cellSize + GAP) - GAP;
    const totalHeight = rows * (cellSize + GAP) - GAP;
    const offsetX = (rect.width - totalWidth) / 2;
    const offsetY = (rect.height - totalHeight) / 2;
    
    container.dataset.originalOffsetX = offsetX;
    container.dataset.originalOffsetY = offsetY;
    
    const sidebarCells = [];
    const allCells = [];
    const newDesignCells = [];
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const pos = getCellPosition(col, row, cellSize, offsetX, offsetY);
            const isSidebar = col < SIDEBAR_WIDTH;
            
            let className = 'grid-cell';
            const dataset = { row, col, cellSize };
            
            if (isSidebar) {
                className = 'sidebar-cell';
                dataset.isSidebar = 'true';
                dataset.sidebarRow = row;
                dataset.sidebarCol = col;
                const cell = createCell(className, pos.x, pos.y, cellSize, dataset);
                container.appendChild(cell);
                sidebarCells.push(cell);
                allCells.push(cell);
            } else {
                dataset.isDesign = 'true';
                dataset.designRow = row;
                dataset.designCol = col - SIDEBAR_WIDTH;
                const cell = createCell(className, pos.x, pos.y, cellSize, dataset);
                container.appendChild(cell);
                newDesignCells.push(cell);
                allCells.push(cell);
                setupCellEvents(cell);
            }
        }
    }
    
    setDesignCells(newDesignCells);
    
    return { sidebarCells, allCells, rows, cols, cellSize, offsetX, offsetY };
}

// ---------- REPOSICIONAMIENTO DE CELDAS COMBINADAS (CRUCIAL) ----------
export function repositionCombinedCells(offsetX, offsetY) {
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH, CELL_SIZE: cellSize } = CONFIG;
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    
    allCells.forEach(cell => {
        if (cell.dataset.combined !== 'true') return;
        if (cell.dataset.isSidebar === 'true') return;
        
        // Intentar usar designRow/designCol para recalcular desde cero
        const designRow = parseInt(cell.dataset.designRow);
        const designCol = parseInt(cell.dataset.designCol);
        
        if (!isNaN(designRow) && !isNaN(designCol)) {
            // Calcular posición base con el nuevo offset
            const basePos = getCellPosition(designCol + SIDEBAR_WIDTH, designRow, cellSize, offsetX, offsetY);
            
            // Obtener dimensiones actuales (guardadas o del estilo)
            let width = parseFloat(cell.dataset.combinedWidth);
            let height = parseFloat(cell.dataset.combinedHeight);
            if (isNaN(width) || isNaN(height)) {
                width = parseFloat(cell.style.width);
                height = parseFloat(cell.style.height);
            }
            
            // Calcular cuántas celdas ocupa (redondeo)
            const combinedCols = Math.round((width + GAP) / (cellSize + GAP));
            const combinedRows = Math.round((height + GAP) / (cellSize + GAP));
            const newWidth = combinedCols * (cellSize + GAP) - GAP;
            const newHeight = combinedRows * (cellSize + GAP) - GAP;
            
            cell.style.left = `${basePos.x}px`;
            cell.style.top = `${basePos.y}px`;
            cell.style.width = `${newWidth}px`;
            cell.style.height = `${newHeight}px`;
            
            // Actualizar datos guardados
            cell.dataset.combinedLeft = basePos.x;
            cell.dataset.combinedTop = basePos.y;
            cell.dataset.combinedWidth = newWidth;
            cell.dataset.combinedHeight = newHeight;
        } else {
            // Fallback para celdas importadas que no tienen designRow/Col (raro)
            // Usamos el offset original guardado en la celda
            const origOffX = parseFloat(cell.dataset.originalCombinedOffsetX) || 0;
            const origOffY = parseFloat(cell.dataset.originalCombinedOffsetY) || 0;
            const deltaX = offsetX - origOffX;
            const deltaY = offsetY - origOffY;
            
            let left = parseFloat(cell.dataset.combinedLeft) || parseFloat(cell.style.left);
            let top = parseFloat(cell.dataset.combinedTop) || parseFloat(cell.style.top);
            let width = parseFloat(cell.dataset.combinedWidth) || parseFloat(cell.style.width);
            let height = parseFloat(cell.dataset.combinedHeight) || parseFloat(cell.style.height);
            
            cell.style.left = `${left + deltaX}px`;
            cell.style.top = `${top + deltaY}px`;
            cell.style.width = `${width}px`;
            cell.style.height = `${height}px`;
            
            // Actualizar datos
            cell.dataset.combinedLeft = left + deltaX;
            cell.dataset.combinedTop = top + deltaY;
        }
    });
}

// ---------- REPOSICIONAMIENTO DE CELDAS NORMALES ----------
export function repositionGrid(offsetX, offsetY) {
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH, CELL_SIZE: cellSize } = CONFIG;
    const allCells = document.querySelectorAll('.grid-cell, .sidebar-cell, .logo-cell');
    
    allCells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        const isSidebar = col < SIDEBAR_WIDTH;
        
        if (isSidebar) return;
        if (cell.dataset.combined === 'true') return; // saltamos combinadas
        
        const pos = getCellPosition(col, row, cellSize, offsetX, offsetY);
        cell.style.left = `${pos.x}px`;
        cell.style.top = `${pos.y}px`;
        
        cell.dataset.originalX = pos.x;
        cell.dataset.originalY = pos.y;
    });
}

// ---------- SIDEBAR ----------
export function repositionSidebarOverlay(offsetX, offsetY) {
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH, CELL_SIZE: cellSize } = CONFIG;
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (overlay) {
        const sidebarWidth = SIDEBAR_WIDTH * (cellSize + GAP) - GAP;
        const sidebarHeight = rows * (cellSize + GAP) - GAP;
        overlay.style.left = `${offsetX}px`;
        overlay.style.top = `${offsetY}px`;
        overlay.style.width = `${sidebarWidth}px`;
        overlay.style.height = `${sidebarHeight}px`;
    }
}

export function repositionSidebarTexts(offsetX, offsetY) {
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH, CELL_SIZE: cellSize } = CONFIG;
    const container = document.getElementById('grid-container');
    
    const sidebarWidth = SIDEBAR_WIDTH * (cellSize + GAP) - GAP;
    const sidebarHeight = rows * (cellSize + GAP) - GAP;
    const x = offsetX + sidebarWidth / 2;
    
    // Obtener todos los sidebar-text
    const items = document.querySelectorAll('.sidebar-text');
    const totalItems = items.length + 1; // +1 por el logo SVG
    const padding = 30;
    const availableHeight = sidebarHeight - (padding * 2);
    const spacing = availableHeight / (totalItems + 1);
    
    let currentY = offsetY + padding + 15; // +15 por el logo (igual que en setup)
    
    items.forEach((el, index) => {
        // El primer elemento (EMNLVEGA) va después del logo
        // Los demás van después de EMNLVEGA
        if (index === 0) {
            // EMNLVEGA
            currentY += spacing;
        } else {
            currentY += spacing;
        }
        el.style.left = `${x}px`;
        el.style.top = `${currentY - 6}px`;
    });
    
    // Reposicionar el logo SVG
    const logoSVG = document.querySelector('.sidebar-logo-svg');
    if (logoSVG) {
        const logoY = offsetY + padding + 15;
        logoSVG.style.left = `${x}px`;
        logoSVG.style.top = `${logoY}px`;
    }
    
    // Reposicionar color picker (si existe en el sidebar, pero ahora está en settings)
    const picker = document.getElementById('color-picker-container');
    if (picker) {
        // Ya no se usa, está dentro de settings
    }
}