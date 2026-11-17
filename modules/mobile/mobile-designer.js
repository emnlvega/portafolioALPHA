import { MOBILE_CONFIG } from './mobile-config.js';

const CONFIG = {
    CELL_SIZE: MOBILE_CONFIG.GRID.CELL_SIZE,
    GAP: MOBILE_CONFIG.GRID.GAP,
    BORDER_RADIUS: 2,
    COLORS: {
        primary: '#00FF9B',
        secondary: '#FFFFFF',
        background: '#080808',
        primaryRGB: '0, 255, 155'
    }
};

let isDesignerActive = false;
let designerContainer = null;
let designCells = [];
let selectedCells = [];
let isDragging = false;
let dragStartCell = null;
let isResizingCombined = false;
let resizeStartCell = null;
let resizeStartX = 0;
let resizeStartY = 0;
let resizeOriginalWidth = 0;
let resizeOriginalHeight = 0;
let resizeOriginalLeft = 0;
let resizeOriginalTop = 0;
let resizeDirection = null;
let resizeCombinedId = null;
let isClickOnCombined = false;

export function toggleMobileDesigner() {
    if (isDesignerActive) {
        closeMobileDesigner();
    } else {
        openMobileDesigner();
    }
}

export function openMobileDesigner() {
    if (isDesignerActive) return;
    isDesignerActive = true;

    const gridCfg = MOBILE_CONFIG.GRID;
    designCells = [];
    selectedCells = [];

    designerContainer = document.createElement('div');
    designerContainer.id = 'mobile-designer-overlay';
    designerContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: #080808;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: 'Courier New', monospace;
        color: #00FF9B;
        user-select: none;
        overflow: auto;
        padding-top: 60px;
    `;

    const toolbar = document.createElement('div');
    toolbar.style.cssText = `
        position: absolute;
        top: 15px;
        display: flex;
        gap: 15px;
        z-index: 10;
        align-items: center;
    `;
    toolbar.innerHTML = `
        <span style="font-size: 12px; font-weight: bold; letter-spacing: 2px;">MOBILE LAYOUT DESIGNER (${gridCfg.COLS}x${gridCfg.ROWS})</span>
        <button id="mob-clear-btn" style="background: transparent; border: 1px solid #ff4444; color: #ff4444; padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 10px; border-radius: 4px;">CLEAR GRID</button>
        <button id="mob-export-btn" style="background: transparent; border: 1px solid #00FF9B; color: #00FF9B; padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 10px; border-radius: 4px;">EXPORT JSON</button>
        <button id="mob-import-btn" style="background: transparent; border: 1px solid #00FF9B; color: #00FF9B; padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 10px; border-radius: 4px;">IMPORT JSON</button>
        <button id="mob-close-btn" style="background: #00FF9B; border: none; color: #000; padding: 6px 12px; cursor: pointer; font-family: inherit; font-size: 10px; font-weight: bold; border-radius: 4px;">EXIT (Z)</button>
    `;
    designerContainer.appendChild(toolbar);

    const viewport = document.createElement('div');
    viewport.id = 'mob-grid-viewport';
    
    const totalWidth = gridCfg.COLS * (gridCfg.CELL_SIZE + gridCfg.GAP) - gridCfg.GAP;
    const totalHeight = gridCfg.ROWS * (gridCfg.CELL_SIZE + gridCfg.GAP) - gridCfg.GAP;

    viewport.style.cssText = `
        position: relative;
        width: ${totalWidth}px;
        height: ${totalHeight}px;
        background: transparent;
        margin: auto;
    `;

    for (let r = 0; r < gridCfg.ROWS; r++) {
        for (let c = 0; c < gridCfg.COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell mob-grid-cell';
            cell.dataset.designRow = r;
            cell.dataset.designCol = c;
            cell.dataset.state = 'normal';
            cell.dataset.combined = 'false';
            
            const posX = c * (gridCfg.CELL_SIZE + gridCfg.GAP);
            const posY = r * (gridCfg.CELL_SIZE + gridCfg.GAP);

            cell.dataset.originalX = posX;
            cell.dataset.originalY = posY;

            cell.style.cssText = `
                position: absolute;
                left: ${posX}px;
                top: ${posY}px;
                width: ${gridCfg.CELL_SIZE}px;
                height: ${gridCfg.CELL_SIZE}px;
                background: #080808;
                border: 1px solid #00FF9B;
                border-radius: ${CONFIG.BORDER_RADIUS}px;
                cursor: pointer;
                box-sizing: border-box;
                transition: background 0.1s ease, border-color 0.1s ease;
            `;

            setupCellInteractions(cell, gridCfg);
            viewport.appendChild(cell);
            designCells.push(cell);
        }
    }

    designerContainer.appendChild(viewport);
    document.body.appendChild(designerContainer);

    document.getElementById('mob-close-btn').addEventListener('click', closeMobileDesigner);
    document.getElementById('mob-export-btn').addEventListener('click', exportMobileDesignJSON);
    document.getElementById('mob-import-btn').addEventListener('click', importMobileDesignJSON);
    document.getElementById('mob-clear-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to clear the entire grid?')) {
            designCells.forEach(c => restoreCell(c, gridCfg));
        }
    });
}

function closeMobileDesigner() {
    if (!isDesignerActive) return;
    isDesignerActive = false;
    if (designerContainer) {
        designerContainer.remove();
        designerContainer = null;
    }
    selectedCells = [];
}

function setupCellInteractions(cell, gridCfg) {
    cell.addEventListener('mousedown', (e) => {
        if (e.button === 0) {
            e.preventDefault();
            handleMouseDown(e, cell, gridCfg);
        }
    });

    cell.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        toggleCellOff(cell, gridCfg);
        return false;
    });

    cell.addEventListener('mouseenter', (e) => {
        handleMouseEnter(e, cell, gridCfg);
    });

    cell.addEventListener('mouseup', (e) => {
        handleMouseUp(e, cell, gridCfg);
    });

    cell.addEventListener('dragstart', (e) => e.preventDefault());
}

function handleMouseDown(e, cell, gridCfg) {
    if (cell.dataset.state === 'off') {
        restoreCell(cell, gridCfg);
        return;
    }

    if (cell.dataset.combined === 'true') {
        startResizeCombined(e, cell, gridCfg);
        return;
    }

    isDragging = false;
    dragStartCell = cell;
    selectedCells = [cell];

    toggleCellStyle(cell);
}

function handleMouseEnter(e, cell, gridCfg) {
    if (cell.dataset.combined === 'true') return;
    if (cell.dataset.state === 'off') return;
    if (e.buttons !== 1) return;
    if (!dragStartCell) return;

    isDragging = true;

    const lastCell = selectedCells[selectedCells.length - 1];
    if (!lastCell) return;

    const row = parseInt(cell.dataset.designRow);
    const col = parseInt(cell.dataset.designCol);
    const lastRow = parseInt(lastCell.dataset.designRow);
    const lastCol = parseInt(lastCell.dataset.designCol);

    const sameRow = row === lastRow;
    const sameCol = col === lastCol;
    if (!sameRow && !sameCol) return;

    const rowDiff = Math.abs(row - lastRow);
    const colDiff = Math.abs(col - lastCol);
    if ((sameRow && colDiff > 1) || (sameCol && rowDiff > 1)) return;

    if (selectedCells.includes(cell)) return;

    selectedCells.push(cell);

    selectedCells.forEach(c => {
        c.style.backgroundColor = CONFIG.COLORS.primary;
        c.style.borderColor = CONFIG.COLORS.primary;
        c.style.boxShadow = 'none';
        c.dataset.state = 'red';
    });
}

function handleMouseUp(e, cell, gridCfg) {
    if (isResizingCombined) {
        handleResizeEnd(gridCfg);
        return;
    }

    if (isClickOnCombined && cell && cell.dataset.combined === 'true') {
        toggleCombinedStyle(cell);
        isClickOnCombined = false;
        return;
    }

    if (isDragging && selectedCells.length > 1) {
        combineCells(selectedCells, gridCfg);
    }
    isDragging = false;
    dragStartCell = null;
    isClickOnCombined = false;
}

function toggleCellStyle(cell) {
    const currentState = cell.dataset.state || 'normal';

    if (currentState === 'normal') {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.primary;
        cell.dataset.state = 'red';
    } else if (currentState === 'red') {
        cell.style.border = 'none';
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
        cell.dataset.state = 'logo';
    } else if (currentState === 'logo') {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = 'none';
        cell.dataset.state = 'normal';
    }
}

function toggleCellOff(cell, gridCfg) {
    if (cell.dataset.isSidebar) return;
    const currentState = cell.dataset.state || 'normal';

    if (currentState === 'off') {
        restoreCell(cell, gridCfg);
        return;
    }

    if (cell.dataset.combined === 'true') {
        const combinedId = cell.dataset.combinedId;
        designCells.forEach(c => {
            if (c.dataset.combinedId === combinedId) {
                restoreCell(c, gridCfg);
            }
        });
        return;
    }

    applyOffState(cell, gridCfg);
}

function applyOffState(cell, gridCfg) {
    const origX = parseFloat(cell.dataset.originalX);
    const origY = parseFloat(cell.dataset.originalY);

    cell.style.left = `${origX}px`;
    cell.style.top = `${origY}px`;
    cell.style.width = `${gridCfg.CELL_SIZE}px`;
    cell.style.height = `${gridCfg.CELL_SIZE}px`;
    cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
    cell.style.backgroundColor = CONFIG.COLORS.background;
    cell.style.boxShadow = 'none';
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
    cell.dataset.state = 'off';
    cell.classList.add('off');
}

function restoreCell(cell, gridCfg) {
    const origX = parseFloat(cell.dataset.originalX);
    const origY = parseFloat(cell.dataset.originalY);

    cell.style.left = `${origX}px`;
    cell.style.top = `${origY}px`;
    cell.style.width = `${gridCfg.CELL_SIZE}px`;
    cell.style.height = `${gridCfg.CELL_SIZE}px`;
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
    cell.style.zIndex = '';
    cell.classList.remove('off');
    cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
    cell.style.backgroundColor = CONFIG.COLORS.background;
    cell.style.boxShadow = 'none';
    cell.dataset.state = 'normal';
    cell.dataset.combined = 'false';
    delete cell.dataset.combinedId;
    delete cell.dataset.startRow;
    delete cell.dataset.startCol;
    delete cell.dataset.endRow;
    delete cell.dataset.endCol;
    delete cell.dataset.combinedLeft;
    delete cell.dataset.combinedTop;
    delete cell.dataset.combinedWidth;
    delete cell.dataset.combinedHeight;
}

function combineCells(cells, gridCfg) {
    if (cells.length < 2) return;

    let minRow = Infinity, minCol = Infinity;
    let maxRow = -Infinity, maxCol = -Infinity;
    let baseCell = null;

    cells.forEach(c => {
        const row = parseInt(c.dataset.designRow);
        const col = parseInt(c.dataset.designCol);
        if (row < minRow || (row === minRow && col < minCol)) {
            minRow = row;
            minCol = col;
            baseCell = c;
        }
        maxRow = Math.max(maxRow, row);
        maxCol = Math.max(maxCol, col);
    });

    if (!baseCell) return;

    const cellSize = gridCfg.CELL_SIZE;
    const gap = gridCfg.GAP;
    const width = (maxCol - minCol + 1) * (cellSize + gap) - gap;
    const height = (maxRow - minRow + 1) * (cellSize + gap) - gap;

    const origX = parseFloat(baseCell.dataset.originalX);
    const origY = parseFloat(baseCell.dataset.originalY);
    const baseCol = parseInt(baseCell.dataset.designCol);
    const baseRow = parseInt(baseCell.dataset.designRow);
    const targetX = origX - (minCol - baseCol) * (cellSize + gap);
    const targetY = origY - (minRow - baseRow) * (cellSize + gap);

    const combinedId = 'mob_combo_' + Date.now() + '_' + Math.random();
    
    cells.forEach(c => {
        c.dataset.combinedId = combinedId;
        c.dataset.combined = 'true';
    });

    const secondaryCells = cells.filter(c => c !== baseCell);

    baseCell.style.left = `${targetX}px`;
    baseCell.style.top = `${targetY}px`;
    baseCell.style.width = `${width}px`;
    baseCell.style.height = `${height}px`;
    baseCell.style.backgroundColor = CONFIG.COLORS.primary;
    baseCell.style.borderColor = CONFIG.COLORS.primary;
    baseCell.style.zIndex = '10';
    baseCell.dataset.state = 'combined_red';
    baseCell.dataset.combined = 'true';
    baseCell.dataset.combinedId = combinedId;
    baseCell.dataset.startRow = minRow;
    baseCell.dataset.startCol = minCol;
    baseCell.dataset.endRow = maxRow;
    baseCell.dataset.endCol = maxCol;
    baseCell.dataset.combinedLeft = targetX;
    baseCell.dataset.combinedTop = targetY;
    baseCell.dataset.combinedWidth = width;
    baseCell.dataset.combinedHeight = height;

    secondaryCells.forEach(c => {
        c.style.opacity = '0';
        c.style.transform = 'scale(0)';
        c.style.pointerEvents = 'none';
        c.dataset.state = 'hidden';
    });
}

function startResizeCombined(e, cell, gridCfg) {
    if (cell.dataset.combined !== 'true') return;
    if (e.button !== 0) return;

    const rect = cell.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const threshold = 10;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    
    let direction = null;
    if (mouseX > width - threshold && mouseY > threshold && mouseY < height - threshold) direction = 'e';
    else if (mouseX < threshold && mouseY > threshold && mouseY < height - threshold) direction = 'w';
    else if (mouseY > height - threshold && mouseX > threshold && mouseX < width - threshold) direction = 's';
    else if (mouseY < threshold && mouseX > threshold && mouseX < width - threshold) direction = 'n';
    else if (mouseX > width - threshold && mouseY > height - threshold) direction = 'se';
    else if (mouseX < threshold && mouseY > height - threshold) direction = 'sw';
    else if (mouseX > width - threshold && mouseY < threshold) direction = 'ne';
    else if (mouseX < threshold && mouseY < threshold) direction = 'nw';
    
    if (direction) {
        e.preventDefault();
        isResizingCombined = true;
        isClickOnCombined = false;
        resizeStartCell = cell;
        resizeDirection = direction;
        resizeStartX = e.clientX;
        resizeStartY = e.clientY;
        resizeOriginalWidth = parseFloat(cell.style.width);
        resizeOriginalHeight = parseFloat(cell.style.height);
        resizeOriginalLeft = parseFloat(cell.style.left);
        resizeOriginalTop = parseFloat(cell.style.top);
        resizeCombinedId = cell.dataset.combinedId;
        
        document.addEventListener('mousemove', handleResizeMove);
        document.addEventListener('mouseup', () => handleResizeEnd(gridCfg), { once: true });
    } else {
        isClickOnCombined = true;
    }
}

function handleResizeMove(e) {
    if (!isResizingCombined || !resizeStartCell) return;
    
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    const cellSize = MOBILE_CONFIG.GRID.CELL_SIZE;
    const gap = MOBILE_CONFIG.GRID.GAP;
    const step = cellSize + gap;
    
    let newWidth = resizeOriginalWidth;
    let newHeight = resizeOriginalHeight;
    let newLeft = resizeOriginalLeft;
    let newTop = resizeOriginalTop;
    
    if (resizeDirection.includes('e')) {
        const deltaCols = Math.round(dx / step);
        newWidth = Math.max(cellSize, resizeOriginalWidth + deltaCols * step);
    }
    if (resizeDirection.includes('w')) {
        const deltaCols = Math.round(-dx / step);
        const calculatedWidth = Math.max(cellSize, resizeOriginalWidth + deltaCols * step);
        newLeft = resizeOriginalLeft + resizeOriginalWidth - calculatedWidth;
        newWidth = calculatedWidth;
    }
    if (resizeDirection.includes('s')) {
        const deltaRows = Math.round(dy / step);
        newHeight = Math.max(cellSize, resizeOriginalHeight + deltaRows * step);
    }
    if (resizeDirection.includes('n')) {
        const deltaRows = Math.round(-dy / step);
        const calculatedHeight = Math.max(cellSize, resizeOriginalHeight + deltaRows * step);
        newTop = resizeOriginalTop + resizeOriginalHeight - calculatedHeight;
        newHeight = calculatedHeight;
    }
    
    resizeStartCell.style.width = `${newWidth}px`;
    resizeStartCell.style.height = `${newHeight}px`;
    resizeStartCell.style.left = `${newLeft}px`;
    resizeStartCell.style.top = `${newTop}px`;
    resizeStartCell.dataset.combinedWidth = newWidth;
    resizeStartCell.dataset.combinedHeight = newHeight;
    resizeStartCell.dataset.combinedLeft = newLeft;
    resizeStartCell.dataset.combinedTop = newTop;
}

function handleResizeEnd(gridCfg) {
    if (!isResizingCombined || !resizeStartCell) return;
    
    document.removeEventListener('mousemove', handleResizeMove);
    
    const cell = resizeStartCell;
    const combinedId = resizeCombinedId;
    
    const left = parseFloat(cell.style.left);
    const top = parseFloat(cell.style.top);
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);

    const cellSize = gridCfg.CELL_SIZE;
    const gap = gridCfg.GAP;
    const step = cellSize + gap;

    const cellsInArea = designCells.filter(c => {
        const cLeft = parseFloat(c.dataset.originalX);
        const cTop = parseFloat(c.dataset.originalY);
        return cLeft >= left - 2 && cLeft <= left + width - cellSize + 2 &&
               cTop >= top - 2 && cTop <= top + height - cellSize + 2;
    });

    if (cellsInArea.length > 0) {
        designCells.forEach(c => {
            if (c.dataset.combinedId === combinedId) {
                c.dataset.combined = 'false';
                delete c.dataset.combinedId;
                c.style.opacity = '1';
                c.style.transform = 'scale(1)';
                c.style.pointerEvents = 'auto';
            }
        });

        combineCells(cellsInArea, gridCfg);
        

        const currentState = cell.dataset.state;
        if (currentState === 'combined_logo') {
            const newBase = cellsInArea.reduce((min, c) => {
                return (parseInt(c.dataset.designRow) < parseInt(min.dataset.designRow) || 
                       (parseInt(c.dataset.designRow) === parseInt(min.dataset.designRow) && parseInt(c.dataset.designCol) < parseInt(min.dataset.designCol))) ? c : min;
            }, cellsInArea[0]);
            newBase.style.border = 'none';
            newBase.style.backgroundColor = CONFIG.COLORS.background;
            newBase.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
            newBase.dataset.state = 'combined_logo';
        }
    }

    isResizingCombined = false;
    resizeStartCell = null;
    resizeDirection = null;
    resizeCombinedId = null;
}

function toggleCombinedStyle(cell) {
    const currentState = cell.dataset.state || 'combined_red';
    
    if (currentState === 'combined_red') {
        cell.style.border = 'none';
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
        cell.dataset.state = 'combined_logo';
    } else if (currentState === 'combined_logo') {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = 'none';
        cell.dataset.state = 'combined_normal';
    } else {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.primary;
        cell.style.boxShadow = 'none';
        cell.dataset.state = 'combined_red';
    }
}


function exportMobileDesignJSON() {
    const result = {};

    designCells.forEach(cell => {
        const row = parseInt(cell.dataset.designRow);
        const col = parseInt(cell.dataset.designCol);
        const state = cell.dataset.state || 'normal';
        const key = `${row},${col}`;

        if (state === 'hidden') return;
        if (state === 'normal') return;

        if (state === 'off') {
            result[key] = 'off';
        } else if (state === 'logo') {
            result[key] = 'logo';
        } else if (state === 'red') {
            result[key] = 'red';
        } else if (cell.dataset.combined === 'true') {
            const startRow = parseInt(cell.dataset.startRow);
            const startCol = parseInt(cell.dataset.startCol);
            const endRow = parseInt(cell.dataset.endRow);
            const endCol = parseInt(cell.dataset.endCol);
            
            let type = 'combined_red';
            if (state === 'combined_logo') type = 'combined_logo';
            else if (state === 'combined_normal') type = 'combined_normal';
            
            result[key] = {
                type: type,
                start: [isNaN(startRow) ? row : startRow, isNaN(startCol) ? col : startCol],
                end: [isNaN(endRow) ? row : endRow, isNaN(endCol) ? col : endCol],
                combined: true
            };
        }
    });

    const json = JSON.stringify(result, null, 2);

    navigator.clipboard.writeText(json).then(() => {
        alert('Mobile design layout successfully copied to clipboard!');
    }).catch(() => {
        prompt('Copy mobile design JSON below:', json);
    });
}

function importMobileDesignJSON() {
    const jsonStr = prompt('Paste your mobile layout JSON configuration here:');
    if (!jsonStr) return;

    try {
        const json = JSON.parse(jsonStr);
        designCells.forEach(c => restoreCell(c, MOBILE_CONFIG.GRID));

        Object.keys(json).forEach(key => {
            const [r, c] = key.split(',').map(Number);
            const val = json[key];
            const cell = designCells.find(cell => parseInt(cell.dataset.designRow) === r && parseInt(cell.dataset.designCol) === c);
            if (!cell) return;

            if (val === 'off') {
                applyOffState(cell, MOBILE_CONFIG.GRID);
            } else if (val === 'red') {
                cell.style.backgroundColor = CONFIG.COLORS.primary;
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.dataset.state = 'red';
            } else if (val === 'logo') {
                cell.style.border = 'none';
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
                cell.dataset.state = 'logo';
            } else if (typeof val === 'object' && val.combined) {
                const [startR, startC] = val.start;
                const [endR, endC] = val.end;
                const group = designCells.filter(cell => {
                    const cr = parseInt(cell.dataset.designRow);
                    const cc = parseInt(cell.dataset.designCol);
                    return cr >= startR && cr <= endR && cc >= startC && cc <= endC;
                });
                if (group.length > 1) {
                    combineCells(group, MOBILE_CONFIG.GRID);
                    const base = group[0];
                    if (val.type === 'combined_logo') {
                        base.style.border = 'none';
                        base.style.backgroundColor = CONFIG.COLORS.background;
                        base.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
                        base.dataset.state = 'combined_logo';
                    } else if (val.type === 'combined_normal') {
                        base.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                        base.style.backgroundColor = CONFIG.COLORS.background;
                        base.style.boxShadow = 'none';
                        base.dataset.state = 'combined_normal';
                    }
                }
            }
        });
    } catch (err) {
        alert('Invalid JSON format provided.');
    }
}