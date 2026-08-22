import { CONFIG } from './config.js';
import { designCells } from './interactions.js';
import { stopRandomAnimations, restartRandomAnimations } from './animations.js';
import { isSpecialPageActiveCheck, isProgrammaticLoadCheck } from './sidebar/index.js';
import { getCellPosition } from './grid.js';

let isHashLoad = false;

export function setHashLoad(value) {
    isHashLoad = value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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

function applyDesignDirectly(jsonData, onComplete) {
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;
        
        const size = CONFIG.CELL_SIZE;
        const origX = parseFloat(cell.dataset.originalX);
        const origY = parseFloat(cell.dataset.originalY);
        
        if (!isNaN(origX) && !isNaN(origY)) {
            cell.style.left = `${origX}px`;
            cell.style.top = `${origY}px`;
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
            cell.dataset.state = 'normal';
            cell.dataset.prevState = 'normal';
            cell.dataset.combined = 'false';
            cell.classList.remove('off');
            delete cell.dataset.combinedId;
            delete cell.dataset.combinedLeft;
            delete cell.dataset.combinedTop;
            delete cell.dataset.combinedWidth;
            delete cell.dataset.combinedHeight;
            delete cell.dataset.originalCombinedOffsetX;
            delete cell.dataset.originalCombinedOffsetY;
        }
    });

    const container = document.getElementById('grid-container');
    const currentOffsetX = parseFloat(container.dataset.originalOffsetX) || 0;
    const currentOffsetY = parseFloat(container.dataset.originalOffsetY) || 0;
    const cellSize = CONFIG.CELL_SIZE;
    const gap = CONFIG.GAP;
    const sidebarWidth = CONFIG.SIDEBAR_WIDTH;
    
    Object.entries(jsonData).forEach(([key, value]) => {
        if (value === 'normal') return;
        
        const [row, col] = key.split(',').map(Number);
        const cell = designCells.find(c => 
            parseInt(c.dataset.designRow) === row && 
            parseInt(c.dataset.designCol) === col
        );
        if (!cell) return;

        if (typeof value === 'object' && value.combined) {
            const { type, left, top, width, height } = value;
            const basePos = getCellPosition(col + sidebarWidth, row, cellSize, currentOffsetX, currentOffsetY);
            
            let combinedCols = 1;
            let combinedRows = 1;
            if (width && height) {
                if (window.innerWidth < 768) {
                    combinedCols = Math.round((width + gap) / (cellSize + gap));
                    combinedRows = Math.round((height + gap) / (cellSize + gap));
                    if (combinedCols < 1) combinedCols = 1;
                    if (combinedRows < 1) combinedRows = 1;
                } else {
                    const originalCellSize = 38;
                    const originalGap = 15;
                    const originalCombinedCols = Math.round((width + originalGap) / (originalCellSize + originalGap));
                    const originalCombinedRows = Math.round((height + originalGap) / (originalCellSize + originalGap));
                    combinedCols = Math.max(1, originalCombinedCols);
                    combinedRows = Math.max(1, originalCombinedRows);
                }
            }
            
            const newWidth = combinedCols * (cellSize + gap) - gap;
            const newHeight = combinedRows * (cellSize + gap) - gap;
            
            cell.style.left = `${basePos.x}px`;
            cell.style.top = `${basePos.y}px`;
            cell.style.width = `${newWidth}px`;
            cell.style.height = `${newHeight}px`;
            cell.style.zIndex = '10';
            cell.style.pointerEvents = 'auto';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            cell.dataset.combined = 'true';
            cell.dataset.combinedId = 'direct_' + Date.now() + '_' + row + '_' + col;
            cell.dataset.combinedLeft = basePos.x;
            cell.dataset.combinedTop = basePos.y;
            cell.dataset.combinedWidth = newWidth;
            cell.dataset.combinedHeight = newHeight;
            cell.dataset.originalCombinedOffsetX = currentOffsetX;
            cell.dataset.originalCombinedOffsetY = currentOffsetY;

            const isRed = type === 'combined_red' || type === 'h_red' || type === 'v_red' || type === 'hh_red';
            const isLogo = type === 'combined_logo' || type === 'h_logo' || type === 'v_logo' || type === 'hh_logo';
            
            if (isRed) {
                cell.style.backgroundColor = CONFIG.COLORS.primary;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.boxShadow = 'none';
                cell.dataset.state = 'combined_red';
            } else if (isLogo) {
                cell.style.border = 'none';
                cell.style.borderColor = 'transparent';
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
                cell.dataset.state = 'combined_logo';
            } else {
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = 'none';
                cell.dataset.state = 'combined_normal';
            }

            const cellsInArea = getCellsInArea(basePos.x, basePos.y, newWidth, newHeight);
            cellsInArea.forEach(c => {
                if (c !== cell) {
                    c.style.opacity = '0';
                    c.style.transform = 'scale(0)';
                    c.style.pointerEvents = 'none';
                    c.dataset.state = 'hidden';
                    c.dataset.combined = 'true';
                    c.dataset.combinedId = cell.dataset.combinedId;
                }
            });
            
        } else if (value === 'logo') {
            cell.style.border = 'none';
            cell.style.borderColor = 'transparent';
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
            cell.dataset.state = 'logo';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            
        } else if (value === 'red') {
            cell.style.backgroundColor = CONFIG.COLORS.primary;
            cell.style.borderColor = CONFIG.COLORS.primary;
            cell.style.boxShadow = 'none';
            cell.dataset.state = 'red';
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            
        } else if (value === 'off') {
            cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
            cell.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            cell.style.pointerEvents = 'auto';
            cell.style.boxShadow = 'none';
            cell.dataset.state = 'off';
            cell.dataset.prevState = 'normal';
            cell.classList.add('off');
        }
    });

    setTimeout(() => {
        restartRandomAnimations();
    }, 500);
    
    if (onComplete) {
        setTimeout(onComplete, 300);
    }
}

export function importDesignFromJSON(jsonData, onComplete, reset = true) {
    if (isHashLoad) {
        applyDesignDirectly(jsonData, onComplete);
        return;
    }
    
    stopRandomAnimations();
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    
    allCells.forEach(cell => {
        if (cell.dataset.isSidebar === 'true') return;
        cell.style.pointerEvents = 'none';
        cell.style.cursor = 'default';
    });
    
    if (reset) {
        allCells.forEach(cell => {
            if (cell.dataset.isSidebar === 'true') return;
            
            const size = CONFIG.CELL_SIZE;
            const origX = parseFloat(cell.dataset.originalX);
            const origY = parseFloat(cell.dataset.originalY);
            
            if (!isNaN(origX) && !isNaN(origY)) {
                cell.style.transition = 'all 0.3s ease';
                cell.style.left = `${origX}px`;
                cell.style.top = `${origY}px`;
                cell.style.width = `${size}px`;
                cell.style.height = `${size}px`;
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
                cell.style.pointerEvents = 'none';
                cell.style.zIndex = '';
                cell.style.boxShadow = 'none';
                cell.dataset.state = 'normal';
                cell.dataset.prevState = 'normal';
                cell.dataset.combined = 'false';
                cell.classList.remove('off');
                delete cell.dataset.combinedId;
                delete cell.dataset.combinedLeft;
                delete cell.dataset.combinedTop;
                delete cell.dataset.combinedWidth;
                delete cell.dataset.combinedHeight;
                delete cell.dataset.originalCombinedOffsetX;
                delete cell.dataset.originalCombinedOffsetY;
            }
        });
    }
    
    setTimeout(() => {
        const outlineItems = [];
        const redItems = [];
        const combinedItems = [];
        const offItems = [];
        
        const container = document.getElementById('grid-container');
        const currentOffsetX = parseFloat(container.dataset.originalOffsetX) || 0;
        const currentOffsetY = parseFloat(container.dataset.originalOffsetY) || 0;
        const cellSize = CONFIG.CELL_SIZE;
        const gap = CONFIG.GAP;
        const sidebarWidth = CONFIG.SIDEBAR_WIDTH;
        
        Object.entries(jsonData).forEach(([key, value]) => {
            if (value === 'normal') return;
            
            const [row, col] = key.split(',').map(Number);
            const cell = designCells.find(c => 
                parseInt(c.dataset.designRow) === row && 
                parseInt(c.dataset.designCol) === col
            );
            if (!cell) return;
            
            if (cell.dataset.combined === 'true') {
                const size = CONFIG.CELL_SIZE;
                const origX = parseFloat(cell.dataset.originalX);
                const origY = parseFloat(cell.dataset.originalY);
                if (!isNaN(origX) && !isNaN(origY)) {
                    cell.style.left = `${origX}px`;
                    cell.style.top = `${origY}px`;
                    cell.style.width = `${size}px`;
                    cell.style.height = `${size}px`;
                    cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                    cell.style.backgroundColor = CONFIG.COLORS.background;
                    cell.style.opacity = '1';
                    cell.style.transform = 'scale(1)';
                    cell.style.pointerEvents = 'none';
                    cell.style.zIndex = '';
                    cell.style.boxShadow = 'none';
                    cell.dataset.state = 'normal';
                    cell.dataset.combined = 'false';
                    delete cell.dataset.combinedId;
                    delete cell.dataset.combinedLeft;
                    delete cell.dataset.combinedTop;
                    delete cell.dataset.combinedWidth;
                    delete cell.dataset.combinedHeight;
                }
            }
            
            if (value === 'logo') {
                outlineItems.push({ key, row, col, cell });
            } else if (value === 'red') {
                redItems.push({ key, row, col, cell });
            } else if (value === 'off') {
                offItems.push({ key, row, col, cell });
            } else {
                let type, data;
                if (typeof value === 'object' && value.combined) {
                    type = value.type;
                    data = value;
                } else {
                    type = value;
                    data = null;
                }
                combinedItems.push({ key, row, col, cell, type, data });
            }
        });
        
        const shuffledOutline = shuffleArray([...outlineItems]);
        shuffledOutline.forEach((item, index) => {
            setTimeout(() => {
                const { cell } = item;
                cell.style.transition = 'all 0.3s ease';
                cell.style.border = 'none';
                cell.style.borderColor = 'transparent';
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
                cell.dataset.state = 'logo';
                cell.dataset.prevState = 'logo';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
                cell.style.pointerEvents = 'none';
            }, index * 50);
        });
        
        const shuffledRed = shuffleArray([...redItems]);
        const outlineDelay = outlineItems.length * 50 + 100;
        shuffledRed.forEach((item, index) => {
            setTimeout(() => {
                const { cell } = item;
                cell.style.transition = 'all 0.3s ease';
                cell.style.backgroundColor = CONFIG.COLORS.primary;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.boxShadow = 'none';
                cell.dataset.state = 'red';
                cell.dataset.prevState = 'red';
                cell.style.opacity = '1';
                cell.style.transform = 'scale(1)';
                cell.style.pointerEvents = 'none';
            }, outlineDelay + index * 50);
        });
        
        offItems.forEach(({ cell }) => {
            cell.style.transition = 'all 0.3s ease';
            cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
            cell.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
            cell.style.backgroundColor = CONFIG.COLORS.background;
            cell.style.opacity = '1';
            cell.style.transform = 'scale(1)';
            cell.style.pointerEvents = 'none';
            cell.style.boxShadow = 'none';
            cell.dataset.state = 'off';
            cell.dataset.prevState = 'normal';
            cell.classList.add('off');
        });
        
        const combinedDelay = outlineDelay + redItems.length * 50 + CONFIG.LOGO_DELAY_COMBINED;
        setTimeout(() => {
            const animDuration = CONFIG.ANIMATION_DURATION_LOGO;
            const shuffledCombined = shuffleArray([...combinedItems]);
            
            shuffledCombined.forEach(({ key, row, col, cell, type, data }, index) => {
                const itemDelay = index * 30;
                
                setTimeout(() => {
                    const basePos = getCellPosition(col + sidebarWidth, row, cellSize, currentOffsetX, currentOffsetY);
                    
                    let combinedCols = 1;
                    let combinedRows = 1;
                    if (data && data.width && data.height) {
                        if (window.innerWidth < 768) {
                            combinedCols = Math.round((data.width + gap) / (cellSize + gap));
                            combinedRows = Math.round((data.height + gap) / (cellSize + gap));
                            if (combinedCols < 1) combinedCols = 1;
                            if (combinedRows < 1) combinedRows = 1;
                        } else {
                            const originalCellSize = 38;
                            const originalGap = 15;
                            const originalCombinedCols = Math.round((data.width + originalGap) / (originalCellSize + originalGap));
                            const originalCombinedRows = Math.round((data.height + originalGap) / (originalCellSize + originalGap));
                            combinedCols = Math.max(1, originalCombinedCols);
                            combinedRows = Math.max(1, originalCombinedRows);
                        }
                    } else {
                        const isH = type === 'h_red' || type === 'h_logo' || type === 'h_normal';
                        const isV = type === 'v_red' || type === 'v_logo' || type === 'v_normal';
                        const isHH = type === 'hh_red' || type === 'hh_logo' || type === 'hh_normal';
                        if (isH) combinedCols = 2;
                        else if (isV) combinedRows = 2;
                        else if (isHH) combinedCols = 3;
                    }
                    
                    const newLeft = basePos.x;
                    const newTop = basePos.y;
                    const newWidth = combinedCols * (cellSize + gap) - gap;
                    const newHeight = combinedRows * (cellSize + gap) - gap;
                    
                    if (!cell || cell.dataset.combined === 'true') {
                        const existingCell = designCells.find(c => 
                            parseInt(c.dataset.designRow) === row && 
                            parseInt(c.dataset.designCol) === col
                        );
                        if (existingCell) {
                            cell = existingCell;
                        } else {
                            return;
                        }
                    }
                    
                    if (cell.dataset.combined === 'true') {
                        const size = CONFIG.CELL_SIZE;
                        const origX = parseFloat(cell.dataset.originalX);
                        const origY = parseFloat(cell.dataset.originalY);
                        if (!isNaN(origX) && !isNaN(origY)) {
                            cell.style.left = `${origX}px`;
                            cell.style.top = `${origY}px`;
                            cell.style.width = `${size}px`;
                            cell.style.height = `${size}px`;
                            cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                            cell.style.backgroundColor = CONFIG.COLORS.background;
                            cell.style.opacity = '1';
                            cell.style.transform = 'scale(1)';
                            cell.style.pointerEvents = 'none';
                            cell.style.zIndex = '';
                            cell.style.boxShadow = 'none';
                            cell.dataset.state = 'normal';
                            cell.dataset.combined = 'false';
                            delete cell.dataset.combinedId;
                            delete cell.dataset.combinedLeft;
                            delete cell.dataset.combinedTop;
                            delete cell.dataset.combinedWidth;
                            delete cell.dataset.combinedHeight;
                        }
                    }
                    
                    const combinedId = 'import_' + Date.now() + '_' + row + '_' + col;
                    const cellsInArea = getCellsInArea(newLeft, newTop, newWidth, newHeight);
                    
                    cell.style.transition = `all ${animDuration}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                    cell.style.left = `${newLeft}px`;
                    cell.style.top = `${newTop}px`;
                    cell.style.width = `${newWidth}px`;
                    cell.style.height = `${newHeight}px`;
                    cell.style.zIndex = '10';
                    cell.style.pointerEvents = 'none';
                    cell.style.opacity = '1';
                    cell.style.transform = 'scale(1)';
                    cell.dataset.combined = 'true';
                    cell.dataset.combinedId = combinedId;
                    cell.dataset.combinedLeft = newLeft;
                    cell.dataset.combinedTop = newTop;
                    cell.dataset.combinedWidth = newWidth;
                    cell.dataset.combinedHeight = newHeight;
                    cell.dataset.originalCombinedOffsetX = currentOffsetX;
                    cell.dataset.originalCombinedOffsetY = currentOffsetY;
                    
                    const isRed = type === 'combined_red' || type === 'h_red' || type === 'v_red' || type === 'hh_red';
                    const isLogo = type === 'combined_logo' || type === 'h_logo' || type === 'v_logo' || type === 'hh_logo';
                    
                    if (isRed) {
                        cell.style.backgroundColor = CONFIG.COLORS.primary;
                        cell.style.borderColor = CONFIG.COLORS.primary;
                        cell.style.boxShadow = 'none';
                        cell.dataset.state = 'combined_red';
                    } else if (isLogo) {
                        cell.style.border = 'none';
                        cell.style.borderColor = 'transparent';
                        cell.style.backgroundColor = CONFIG.COLORS.background;
                        cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
                        cell.dataset.state = 'combined_logo';
                    } else {
                        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                        cell.style.borderColor = CONFIG.COLORS.primary;
                        cell.style.backgroundColor = CONFIG.COLORS.background;
                        cell.style.boxShadow = 'none';
                        cell.dataset.state = 'combined_normal';
                    }
                    cell.dataset.prevState = cell.dataset.state;
                    
                    cellsInArea.forEach(c => {
                        if (c !== cell) {
                            c.style.transition = `all ${animDuration * 0.3}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
                            c.style.opacity = '0';
                            c.style.transform = 'scale(0)';
                            c.style.pointerEvents = 'none';
                            c.style.zIndex = '';
                            c.style.boxShadow = 'none';
                            c.dataset.state = 'hidden';
                            c.dataset.combined = 'true';
                            c.dataset.combinedId = combinedId;
                        }
                    });
                    
                    if (onComplete && index === shuffledCombined.length - 1) {
                        setTimeout(() => {
                            const allCellsFinal = document.querySelectorAll('.grid-cell, .logo-cell');
                            allCellsFinal.forEach(c => {
                                if (c.dataset.isSidebar === 'true') return;
                                if (!c.querySelector('.proyectos-item, .proyectos-category, .proyectos-nav, .expand-btn, .proyectos-detail, .proyectos-select-message')) {
                                    c.style.pointerEvents = 'auto';
                                    c.style.cursor = '';
                                }
                            });
                            setTimeout(() => {
                                restartRandomAnimations();
                            }, 500);
                            onComplete();
                        }, animDuration + 100);
                    }
                }, itemDelay);
            });
        }, combinedDelay);
    }, 300);
}