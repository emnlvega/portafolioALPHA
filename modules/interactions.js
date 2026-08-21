import { CONFIG } from './config.js';
import { getCellPosition } from './grid.js';
import { restartRandomAnimations, refreshAnimationCount } from './animations.js';
import { showDialog } from './dialogs.js';
import { isSpecialPageActiveCheck } from './sidebar/index.js';
import { isMobile } from './mobile.js';
import { getCurrentMobilePage } from './mobile/mobile-nav.js';

export let designCells = [];
export let selectedCells = [];
export let isDragging = false;
export let dragStartCell = null;
export let isResizingCombined = false;
export let resizeStartCell = null;
export let resizeStartX = 0;
export let resizeStartY = 0;
export let resizeOriginalWidth = 0;
export let resizeOriginalHeight = 0;
export let resizeOriginalLeft = 0;
export let resizeOriginalTop = 0;
export let resizeDirection = null;
export let resizeCombinedId = null;
export let isClickOnCombined = false;

function isMobileSpecialPage() {
    if (!isMobile()) return false;
    const page = getCurrentMobilePage ? getCurrentMobilePage() : 'inicio';
    return page === 'sobre-mi' || page === 'proyectos' || page === 'proyecto-detalle' || page === 'contacto';
}

function hasInicioContent(cell) {
    return cell.querySelector('.inicio-bienvenido, .inicio-proyecto, .inicio-vermas');
}

export function setDesignCells(cells) {
    designCells = cells;
}

export function applyOffState(cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    
    const cellSize = CONFIG.CELL_SIZE;
    const origX = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
    const origY = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);

    cell.style.transition = 'all 0.3s ease';
    cell.style.left = `${origX}px`;
    cell.style.top = `${origY}px`;
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
    cell.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
    cell.style.backgroundColor = CONFIG.COLORS.background;
    cell.style.boxShadow = 'none';
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
    cell.style.pointerEvents = 'auto';
    cell.dataset.state = 'off';
    cell.dataset.prevState = 'normal';
    cell.classList.add('off');
}

export function cleanInicioContent() {
    document.querySelectorAll('.inicio-bienvenido, .inicio-proyecto, .inicio-vermas').forEach(el => {
        el.remove();
    });
    
    const existingImage = document.getElementById('letters-animation-image');
    if (existingImage) {
        existingImage.remove();
    }
    
    if (window.stopFlickerOnInicio) {
        window.stopFlickerOnInicio();
    }
    
    if (window.setInicioClickable) {
        window.setInicioClickable(false);
    }
    

    if (window.unblockSidebarInteraction) {
        window.unblockSidebarInteraction();
    }
    
    const gridCells = document.querySelectorAll('.grid-cell, .logo-cell');
    gridCells.forEach(cell => {
        if (cell.dataset.isSidebar !== 'true') {
            cell.style.pointerEvents = '';
            cell.style.cursor = '';
        }
    });
}

export function toggleCellOff(cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (cell.dataset.isSidebar) return;

    cleanInicioContent();

    const currentState = cell.dataset.state || 'normal';

    if (currentState === 'off') {
        restoreCell(cell);
        return;
    }

    if (cell.dataset.combined === 'true') {
        const combinedId = cell.dataset.combinedId;
        const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
        
        allCells.forEach(c => {
            if (c.dataset.combinedId === combinedId) {
                const size = CONFIG.CELL_SIZE;
                const origX = parseFloat(c.dataset.originalX) || parseFloat(c.style.left);
                const origY = parseFloat(c.dataset.originalY) || parseFloat(c.style.top);
                
                c.style.transition = 'all 0.3s ease';
                c.style.left = `${origX}px`;
                c.style.top = `${origY}px`;
                c.style.width = `${size}px`;
                c.style.height = `${size}px`;
                c.style.opacity = '1';
                c.style.transform = 'scale(1)';
                c.style.pointerEvents = 'auto';
                c.style.zIndex = '';
                c.style.boxShadow = 'none';
                c.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                c.style.borderColor = CONFIG.COLORS.primary;
                c.style.backgroundColor = CONFIG.COLORS.background;
                
                c.dataset.state = 'normal';
                c.dataset.prevState = 'normal';
                c.dataset.combined = 'false';
                c.classList.remove('off');
                delete c.dataset.combinedId;
                delete c.dataset.combinedLeft;
                delete c.dataset.combinedTop;
                delete c.dataset.combinedWidth;
                delete c.dataset.combinedHeight;
                delete c.dataset.combinedRows;
                delete c.dataset.combinedCols;
            }
        });
        
        setTimeout(() => {
            refreshAnimationCount();
        }, 50);
        return;
    }

    applyOffState(cell);
}

export function restoreCell(cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    
    const cellSize = CONFIG.CELL_SIZE;
    const origX = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
    const origY = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);

    cell.style.transition = 'all 0.3s ease';
    cell.style.left = `${origX}px`;
    cell.style.top = `${origY}px`;
    cell.style.width = `${cellSize}px`;
    cell.style.height = `${cellSize}px`;
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
    cell.style.pointerEvents = 'auto';
    cell.classList.remove('off');
    cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
    cell.style.borderColor = CONFIG.COLORS.primary;
    cell.style.backgroundColor = CONFIG.COLORS.background;
    cell.style.boxShadow = 'none';
    cell.dataset.state = 'normal';
    cell.dataset.prevState = 'normal';
    cell.dataset.combined = 'false';
    delete cell.dataset.combinedId;
    delete cell.dataset.combinedLeft;
    delete cell.dataset.combinedTop;
    delete cell.dataset.combinedWidth;
    delete cell.dataset.combinedHeight;
    delete cell.dataset.combinedRows;
    delete cell.dataset.combinedCols;
    
    setTimeout(() => {
        refreshAnimationCount();
    }, 50);
}

export function toggleCellStyle(cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (hasInicioContent(cell)) return;

    cleanInicioContent();
    
    const currentState = cell.dataset.state || 'normal';

    if (currentState === 'normal') {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.borderColor = CONFIG.COLORS.primary;
        cell.style.backgroundColor = CONFIG.COLORS.primary;
        cell.style.boxShadow = 'none';
        cell.dataset.state = 'red';
        cell.dataset.prevState = 'red';
    } else if (currentState === 'red') {
        cell.style.border = 'none';
        cell.style.borderColor = 'transparent';
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
        cell.dataset.state = 'logo';
        cell.dataset.prevState = 'logo';
    } else if (currentState === 'logo') {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.borderColor = CONFIG.COLORS.primary;
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = 'none';
        cell.dataset.state = 'normal';
        cell.dataset.prevState = 'normal';
    }
}

export function toggleCombinedStyle(cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (hasInicioContent(cell)) return;

    cleanInicioContent();
    
    const currentState = cell.dataset.state || 'combined_red';
    const combinedId = cell.dataset.combinedId;

    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    const groupCells = [];

    allCells.forEach(c => {
        if (c.dataset.combinedId === combinedId) {
            groupCells.push(c);
        }
    });

    let newState;
    if (currentState === 'combined_red') {
        newState = 'combined_logo';
    } else if (currentState === 'combined_logo') {
        newState = 'combined_normal';
    } else {
        newState = 'combined_red';
    }

    groupCells.forEach(c => {
        if (c === cell) {
            if (newState === 'combined_red') {
                c.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                c.style.backgroundColor = CONFIG.COLORS.primary;
                c.style.borderColor = CONFIG.COLORS.primary;
                c.style.boxShadow = 'none';
            } else if (newState === 'combined_logo') {
                c.style.border = 'none';
                c.style.borderColor = 'transparent';
                c.style.backgroundColor = CONFIG.COLORS.background;
                c.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
            } else {
                c.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                c.style.borderColor = CONFIG.COLORS.primary;
                c.style.backgroundColor = CONFIG.COLORS.background;
                c.style.boxShadow = 'none';
            }
            c.dataset.state = newState;
            c.dataset.prevState = newState;
        }
    });
}

function getCellAt(row, col) {
    return designCells.find(c => {
        const cRow = parseInt(c.dataset.designRow);
        const cCol = parseInt(c.dataset.designCol);
        return cRow === row && cCol === col;
    });
}

export function combineCells(cells) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (cells.length < 2) return;

    cleanInicioContent();

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

    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const width = (maxCol - minCol + 1) * (cellSize + gap) - gap;
    const height = (maxRow - minRow + 1) * (cellSize + gap) - gap;

    const origX = parseFloat(baseCell.dataset.originalX) || parseFloat(baseCell.style.left);
    const origY = parseFloat(baseCell.dataset.originalY) || parseFloat(baseCell.style.top);

    const baseCol = parseInt(baseCell.dataset.designCol);
    const baseRow = parseInt(baseCell.dataset.designRow);
    const targetX = origX - (minCol - baseCol) * (cellSize + gap);
    const targetY = origY - (minRow - baseRow) * (cellSize + gap);

    const combinedId = Date.now() + Math.random();
    const secondaryCells = cells.filter(c => c !== baseCell);

    const container = document.getElementById('grid-container');
    const currentOffsetX = parseFloat(container.dataset.originalOffsetX) || 0;
    const currentOffsetY = parseFloat(container.dataset.originalOffsetY) || 0;

    cells.forEach(c => {
        c.style.pointerEvents = 'none';
    });

    baseCell.style.transition = `all ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
    baseCell.style.left = `${targetX}px`;
    baseCell.style.top = `${targetY}px`;
    baseCell.style.width = `${width}px`;
    baseCell.style.height = `${height}px`;
    baseCell.style.backgroundColor = CONFIG.COLORS.primary;
    baseCell.style.borderColor = CONFIG.COLORS.primary;
    baseCell.style.zIndex = '10';
    baseCell.style.boxShadow = 'none';
    baseCell.dataset.state = 'combined_red';
    baseCell.dataset.prevState = 'combined_red';
    baseCell.dataset.combined = 'true';
    baseCell.dataset.combinedId = combinedId;
    baseCell.dataset.combinedLeft = targetX;
    baseCell.dataset.combinedTop = targetY;
    baseCell.dataset.combinedWidth = width;
    baseCell.dataset.combinedHeight = height;
    baseCell.dataset.originalCombinedOffsetX = currentOffsetX;
    baseCell.dataset.originalCombinedOffsetY = currentOffsetY;

    setTimeout(() => {
        secondaryCells.forEach(c => {
            c.style.transition = `all ${CONFIG.ANIMATION_DURATION * 0.3}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
            c.style.opacity = '0';
            c.style.transform = 'scale(0)';
            c.style.pointerEvents = 'none';
            c.dataset.state = 'hidden';
            c.dataset.combined = 'true';
            c.dataset.combinedId = combinedId;
        });
        baseCell.style.pointerEvents = 'auto';
    }, CONFIG.ANIMATION_DURATION);
}

export function startResizeCombined(e, cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (cell.dataset.combined !== 'true') return;
    if (e.button !== 0) return;
    if (hasInicioContent(cell)) return;

    cleanInicioContent();
    
    const rect = cell.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const threshold = 10;
    
    const width = parseFloat(cell.style.width);
    const height = parseFloat(cell.style.height);
    
    let direction = null;
    if (mouseX > width - threshold && mouseY > threshold && mouseY < height - threshold) {
        direction = 'e';
    } else if (mouseX < threshold && mouseY > threshold && mouseY < height - threshold) {
        direction = 'w';
    } else if (mouseY > height - threshold && mouseX > threshold && mouseX < width - threshold) {
        direction = 's';
    } else if (mouseY < threshold && mouseX > threshold && mouseX < width - threshold) {
        direction = 'n';
    } else if (mouseX > width - threshold && mouseY > height - threshold) {
        direction = 'se';
    } else if (mouseX < threshold && mouseY > height - threshold) {
        direction = 'sw';
    } else if (mouseX > width - threshold && mouseY < threshold) {
        direction = 'ne';
    } else if (mouseX < threshold && mouseY < threshold) {
        direction = 'nw';
    }
    
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
        document.addEventListener('mouseup', handleResizeEnd);
    } else {
        isClickOnCombined = true;
    }
}

function handleResizeMove(e) {
    if (!isResizingCombined || !resizeStartCell) return;
    
    const dx = e.clientX - resizeStartX;
    const dy = e.clientY - resizeStartY;
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    
    let newWidth = resizeOriginalWidth;
    let newHeight = resizeOriginalHeight;
    let newLeft = resizeOriginalLeft;
    let newTop = resizeOriginalTop;
    
    const minSize = cellSize;
    
    if (resizeDirection.includes('e')) {
        newWidth = Math.max(minSize, resizeOriginalWidth + dx);
        newWidth = Math.round(newWidth / (cellSize + gap)) * (cellSize + gap) - gap;
        if (newWidth < minSize) newWidth = minSize;
    }
    if (resizeDirection.includes('w')) {
        const delta = -dx;
        newWidth = Math.max(minSize, resizeOriginalWidth + delta);
        newWidth = Math.round(newWidth / (cellSize + gap)) * (cellSize + gap) - gap;
        if (newWidth < minSize) newWidth = minSize;
        newLeft = resizeOriginalLeft + resizeOriginalWidth - newWidth;
    }
    if (resizeDirection.includes('s')) {
        newHeight = Math.max(minSize, resizeOriginalHeight + dy);
        newHeight = Math.round(newHeight / (cellSize + gap)) * (cellSize + gap) - gap;
        if (newHeight < minSize) newHeight = minSize;
    }
    if (resizeDirection.includes('n')) {
        const delta = -dy;
        newHeight = Math.max(minSize, resizeOriginalHeight + delta);
        newHeight = Math.round(newHeight / (cellSize + gap)) * (cellSize + gap) - gap;
        if (newHeight < minSize) newHeight = minSize;
        newTop = resizeOriginalTop + resizeOriginalHeight - newHeight;
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

function handleResizeEnd(e) {
    if (!isResizingCombined || !resizeStartCell) return;

    cleanInicioContent();
    
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
    
    const cell = resizeStartCell;
    const combinedId = cell.dataset.combinedId;
    const left = parseFloat(cell.dataset.combinedLeft) || parseFloat(cell.style.left);
    const top = parseFloat(cell.dataset.combinedTop) || parseFloat(cell.style.top);
    const width = parseFloat(cell.dataset.combinedWidth) || parseFloat(cell.style.width);
    const height = parseFloat(cell.dataset.combinedHeight) || parseFloat(cell.style.height);
    
    const cellsInArea = getCellsInArea(left, top, width, height);
    cellsInArea.forEach(c => {
        if (c !== cell) {
            c.style.transition = 'all 0.3s ease';
            c.style.opacity = '0';
            c.style.transform = 'scale(0)';
            c.style.pointerEvents = 'none';
            c.style.zIndex = '';
            c.dataset.state = 'hidden';
            c.dataset.combined = 'true';
            c.dataset.combinedId = combinedId;
        }
    });
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(c => {
        if (c.dataset.combinedId === combinedId && c !== cell) {
            c.style.transition = 'all 0.3s ease';
            c.style.opacity = '0';
            c.style.transform = 'scale(0)';
            c.style.pointerEvents = 'none';
            c.style.zIndex = '';
            c.dataset.state = 'hidden';
            c.dataset.combined = 'true';
            c.dataset.combinedId = combinedId;
        }
    });
    
    const currentState = cell.dataset.state || 'combined_red';
    const isRed = currentState === 'combined_red';
    const isLogo = currentState === 'combined_logo';
    
    if (isRed) {
        cell.style.backgroundColor = CONFIG.COLORS.primary;
        cell.style.borderColor = CONFIG.COLORS.primary;
        cell.style.boxShadow = 'none';
    } else if (isLogo) {
        cell.style.border = 'none';
        cell.style.borderColor = 'transparent';
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
    } else {
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.borderColor = CONFIG.COLORS.primary;
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.boxShadow = 'none';
    }
    
    cell.style.pointerEvents = 'auto';
    cell.style.zIndex = '10';
    cell.style.opacity = '1';
    cell.style.transform = 'scale(1)';
    cell.dataset.combined = 'true';
    cell.dataset.combinedId = combinedId;
    
    isResizingCombined = false;
    resizeStartCell = null;
    resizeDirection = null;
    resizeCombinedId = null;
}

function getCellsInArea(left, top, width, height) {
    const cellSize = CONFIG.CELL_SIZE;
    const cells = [];
    
    designCells.forEach(cell => {
        const cellLeft = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
        const cellTop = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);
        
        const cellRight = cellLeft + cellSize;
        const cellBottom = cellTop + cellSize;
        const combinedRight = left + width;
        const combinedBottom = top + height;
        
        if (cellLeft >= left - 1 && cellRight <= combinedRight + 1 &&
            cellTop >= top - 1 && cellBottom <= combinedBottom + 1) {
            cells.push(cell);
        }
    });
    
    return cells;
}

export function handleMouseDown(e, cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (cell.dataset.isSidebar) return;
    if (hasInicioContent(cell)) return;

    if (cell.dataset.state === 'off') {
        restoreCell(cell);
        return;
    }

    if (cell.dataset.combined === 'true') {
        startResizeCombined(e, cell);
        return;
    }

    isDragging = false;
    dragStartCell = cell;
    selectedCells = [cell];

    toggleCellStyle(cell);
}

export function handleMouseUp(e, cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    
    if (isResizingCombined) {
        handleResizeEnd(e);
        return;
    }

    if (isClickOnCombined && cell && cell.dataset.combined === 'true') {
        if (!hasInicioContent(cell)) {
            toggleCombinedStyle(cell);
        }
        isClickOnCombined = false;
        return;
    }

    if (isDragging && selectedCells.length > 1) {
        combineCells(selectedCells);
    }
    isDragging = false;
    dragStartCell = null;
    isClickOnCombined = false;
}

export function handleMouseEnter(e, cell) {
    if (isSpecialPageActiveCheck()) return;
    if (isMobileSpecialPage()) return;
    if (cell.dataset.isSidebar) return;
    if (cell.dataset.combined === 'true') return;
    if (cell.dataset.state === 'off') return;
    if (hasInicioContent(cell)) return;
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

export function setupCellEvents(cell) {
    cell.addEventListener('mousedown', function(e) {
        if (e.button === 0) {
            e.preventDefault();
            handleMouseDown(e, this);
        }
    });

    cell.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        if (!this.dataset.isSidebar) {
            toggleCellOff(this);
        }
        return false;
    });

    cell.addEventListener('mouseenter', function(e) {
        handleMouseEnter(e, this);
    });

    cell.addEventListener('mouseup', function(e) {
        handleMouseUp(e, this);
    });

    cell.addEventListener('dragstart', (e) => e.preventDefault());
}

export function resetGrid(keepCombined = false) {
    cleanInicioContent();
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
    
    allCells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;

        if (keepCombined && cell.dataset.combined === 'true') return;
        
        const size = CONFIG.CELL_SIZE;
        const origX = parseFloat(cell.dataset.originalX);
        const origY = parseFloat(cell.dataset.originalY);

        if (!isNaN(origX) && !isNaN(origY)) {
            cell.style.left = `${origX}px`;
            cell.style.top = `${origY}px`;
        }

        cell.style.width = `${size}px`;
        cell.style.height = `${size}px`;
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.borderColor = CONFIG.COLORS.primary;
        cell.style.backgroundColor = CONFIG.COLORS.background;
        cell.style.opacity = '1';
        cell.style.transform = 'scale(1)';
        cell.style.pointerEvents = 'auto';
        cell.style.zIndex = '';
        cell.style.boxShadow = 'none';
        cell.style.transition = 'all 0.3s ease';
        
        cell.dataset.state = 'normal';
        cell.dataset.prevState = 'normal';
        cell.dataset.combined = 'false';
        cell.classList.remove('off');
        delete cell.dataset.combinedId;
        delete cell.dataset.combinedLeft;
        delete cell.dataset.combinedTop;
        delete cell.dataset.combinedWidth;
        delete cell.dataset.combinedHeight;
        delete cell.dataset.combinedRows;
        delete cell.dataset.combinedCols;
        delete cell.dataset.originalCombinedOffsetX;
        delete cell.dataset.originalCombinedOffsetY;
    });

    selectedCells = [];
    isDragging = false;
    dragStartCell = null;
    isResizingCombined = false;
    resizeStartCell = null;
    isClickOnCombined = false;

    document.querySelectorAll('.expand-btn').forEach(el => el.remove());
    
    setTimeout(() => {
        refreshAnimationCount();
    }, 50);
    
    setTimeout(() => {
        restartRandomAnimations();
    }, 200);
}

export function exportDesignToJSON() {
    if (isMobileSpecialPage()) return;
    
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
            const left = parseFloat(cell.dataset.combinedLeft) || parseFloat(cell.style.left);
            const top = parseFloat(cell.dataset.combinedTop) || parseFloat(cell.style.top);
            const width = parseFloat(cell.dataset.combinedWidth) || parseFloat(cell.style.width);
            const height = parseFloat(cell.dataset.combinedHeight) || parseFloat(cell.style.height);
            
            let type = 'combined_red';
            if (state === 'combined_logo') type = 'combined_logo';
            else if (state === 'combined_normal') type = 'combined_normal';
            
            result[key] = {
                type: type,
                left: left,
                top: top,
                width: width,
                height: height,
                combined: true
            };
        }
    });

    const json = JSON.stringify(result, null, 2);
    console.log(json);

    navigator.clipboard.writeText(json).then(() => {
        showDialog('DISEÑO EXPORTADO', 'El diseño ha sido copiado al portapapeles como JSON.');
    }).catch(() => {
        showDialog('DISEÑO EXPORTADO', 'Copia el siguiente JSON manualmente:\n\n' + json);
    });
}