import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

const PROYECTOS_DESIGN = {
  "0,0": {
    "type": "combined_normal",
    "left": 452.5,
    "top": -28.83331298828125,
    "width": 375,
    "height": 52,
    "combined": true
  },
  "3,0": {
    "type": "combined_normal",
    "left": 452.5,
    "top": 28.16668701171875,
    "width": 14,
    "height": 451,
    "combined": true
  },
  "3,1": {
    "type": "combined_normal",
    "left": 471.5,
    "top": 28.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,7": {
    "type": "combined_normal",
    "left": 585.5,
    "top": 28.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,13": {
    "type": "combined_normal",
    "left": 699.5,
    "top": 28.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,19": {
    "type": "combined_normal",
    "left": 813.5,
    "top": 28.16668701171875,
    "width": 14,
    "height": 451,
    "combined": true
  },
  "9,1": {
    "type": "combined_normal",
    "left": 471.5,
    "top": 142.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,7": {
    "type": "combined_normal",
    "left": 585.5,
    "top": 142.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,13": {
    "type": "combined_normal",
    "left": 699.5,
    "top": 142.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "15,1": {
    "type": "combined_normal",
    "left": 471.5,
    "top": 256.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "15,7": {
    "type": "combined_normal",
    "left": 585.5,
    "top": 256.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "15,13": {
    "type": "combined_normal",
    "left": 699.5,
    "top": 256.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,1": {
    "type": "combined_normal",
    "left": 471.5,
    "top": 370.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,7": {
    "type": "combined_normal",
    "left": 585.5,
    "top": 370.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,13": {
    "type": "combined_normal",
    "left": 699.5,
    "top": 370.16668701171875,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "27,0": {
    "type": "combined_normal",
    "left": 452.5,
    "top": 484.16668701171875,
    "width": 185,
    "height": 52,
    "combined": true
  },
  "27,10": {
    "type": "combined_normal",
    "left": 642.5,
    "top": 484.16668701171875,
    "width": 185,
    "height": 52,
    "combined": true
  }
};

let proyectosData = null;
let paginaProyectos = 0;
const PROYECTOS_POR_PAGINA = 12;
let gridReady = false;

function getTextSizes() {
    return CONFIG.TEXT_SIZES || {
        title: 32,
        arrows: 28,
        projectIcon: 24,
        normalTitle: 20,
        subTitle: 16,
        medium: 14,
        small: 10,
        tiny: 8
    };
}

function getLetterSpacing() {
    return CONFIG.LETTER_SPACING || {
        title: 12,
        subTitle: 6,
        medium: 0.5,
        small: 1.5,
        tiny: 2
    };
}

async function loadProyectosData() {
    if (proyectosData) return proyectosData;
    const response = await fetch('./modules/sidebar/data/proyectos.json');
    proyectosData = await response.json();
    return proyectosData;
}

function getProyectosPagina() {
    const allProjects = proyectosData.projects;
    const start = paginaProyectos * PROYECTOS_POR_PAGINA;
    return allProjects.slice(start, start + PROYECTOS_POR_PAGINA);
}

function getTotalPaginas() {
    return Math.ceil(proyectosData.projects.length / PROYECTOS_POR_PAGINA);
}

export async function renderMobileProyectos() {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    await loadProyectosData();
    
    document.querySelectorAll('.mobile-proyectos-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-proyecto-item, .mobile-flecha, .mobile-page-indicator').forEach(el => el.remove());
    
    stopRandomAnimations();
    resetGrid(false);
    
    importDesignFromJSON(PROYECTOS_DESIGN, () => {
        gridReady = true;
        createProyectosContent();
        createMobileNavButtons('proyectos');
        disableInteractions();
    }, true);
}

function updateProyectosContent() {
    document.querySelectorAll('.mobile-proyecto-item, .mobile-flecha, .mobile-page-indicator, .mobile-proyectos-content').forEach(el => el.remove());
    createProyectosContent();
    createMobileNavButtons('proyectos');
}

function disableInteractions() {
    const container = document.getElementById('grid-container');
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
    allCells.forEach(cell => {
        cell.style.pointerEvents = 'none';
        cell.style.cursor = 'default';
        cell.dataset.locked = 'true';
        cell.onclick = null;
        cell.onmousedown = null;
        cell.oncontextmenu = null;
    });
}

function createProyectosContent() {
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let projLeftArrow = null;
    let projRightArrow = null;
    let projCells = [];
    let extraCells = [];
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) {
                titleCell = cell;
            }
            else if (row === 27 && col === 0) {
                projLeftArrow = cell;
            }
            else if (row === 27 && col === 10) {
                projRightArrow = cell;
            }
            else if (row === 3 && (col === 1 || col === 7 || col === 13)) {
                extraCells.push({ cell, col, index: Math.floor((col - 1) / 6) });
            }
            else if ((row === 9 || row === 15 || row === 21) && [1, 7, 13].includes(col)) {
                projCells.push({ cell, row, col, index: projCells.length });
            }
        }
    });
    
    projCells.sort((a, b) => a.row - b.row || a.col - b.col);
    
    if (titleCell) {
        const oldTitle = titleCell.querySelector('.mobile-proyectos-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-proyectos-content';
        title.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.normalTitle}px;
            letter-spacing: ${letterSpacing.subTitle + 2}px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(${primaryRGB}, 1),
                         0 0 40px rgba(${primaryRGB}, 0.6),
                         0 0 80px rgba(${primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = proyectosData.title;
        titleCell.appendChild(title);
    }
    
    const proyectos = getProyectosPagina();
    const totalPaginas = getTotalPaginas();
    
    if (paginaProyectos >= totalPaginas && totalPaginas > 0) {
        paginaProyectos = totalPaginas - 1;
    }
    
    const allProjects = proyectosData.projects;
    
    extraCells.forEach(({ cell }, index) => {
        const project = allProjects[index];
        
        const item = document.createElement('div');
        item.className = 'mobile-proyecto-item mobile-proyecto-destacado';
        item.dataset.projectId = project.id;
        item.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            border: 1px solid rgba(${primaryRGB}, 0.15);
            border-radius: 4px;
            background: rgba(${primaryRGB}, 0.05);
            transition: all 0.3s ease;
            cursor: pointer;
            pointer-events: auto;
            z-index: 20;
            gap: 2px;
            padding: 8px;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = project.icon;
        icon.style.cssText = `
            font-size: ${textSizes.projectIcon + 4}px;
            color: ${primaryColor};
            text-shadow: 0 0 20px rgba(${primaryRGB}, 0.2);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        item.appendChild(icon);
        
        const name = document.createElement('span');
        name.textContent = project.name;
        name.style.cssText = `
            font-size: ${textSizes.small}px;
            letter-spacing: ${letterSpacing.small}px;
            color: ${primaryColor};
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
            transition: all 0.3s ease;
            pointer-events: none;
            text-align: center;
        `;
        item.appendChild(name);
        
        item.addEventListener('mouseenter', () => {
            item.style.borderColor = secondaryColor;
            item.style.background = `rgba(${secondaryRGB}, 0.08)`;
            item.style.boxShadow = `0 0 30px rgba(${secondaryRGB}, 0.08)`;
            icon.style.color = secondaryColor;
            icon.style.textShadow = `0 0 30px rgba(${secondaryRGB}, 0.3)`;
            name.style.color = secondaryColor;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.borderColor = `rgba(${primaryRGB}, 0.15)`;
            item.style.background = `rgba(${primaryRGB}, 0.05)`;
            item.style.boxShadow = 'none';
            icon.style.color = primaryColor;
            icon.style.textShadow = `0 0 20px rgba(${primaryRGB}, 0.2)`;
            name.style.color = primaryColor;
        });
        
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            import('./mobile-nav.js').then(module => {
                module.openProyectoDetalle(project.id);
            });
        });
        
        cell.appendChild(item);
    });
    
    projCells.forEach(({ cell }, index) => {
        const project = proyectos[index];
        
        const projItem = document.createElement('div');
        projItem.className = 'mobile-proyecto-item';
        projItem.dataset.projectId = project.id;
        projItem.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            border: 1px solid rgba(${primaryRGB}, 0.1);
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.2);
            transition: all 0.3s ease;
            cursor: pointer;
            pointer-events: auto;
            z-index: 20;
            gap: 2px;
            padding: 8px;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = project.icon;
        icon.style.cssText = `
            font-size: ${textSizes.projectIcon + 4}px;
            color: ${primaryColor};
            text-shadow: 0 0 20px rgba(${primaryRGB}, 0.2);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        projItem.appendChild(icon);
        
        const name = document.createElement('span');
        name.textContent = project.name;
        name.style.cssText = `
            font-size: ${textSizes.small}px;
            letter-spacing: ${letterSpacing.small}px;
            color: ${secondaryColor};
            text-shadow: 0 0 10px rgba(${secondaryRGB}, 0.1);
            transition: all 0.3s ease;
            pointer-events: none;
            text-align: center;
        `;
        projItem.appendChild(name);
        
        projItem.addEventListener('mouseenter', () => {
            projItem.style.borderColor = secondaryColor;
            projItem.style.background = `rgba(${secondaryRGB}, 0.05)`;
            projItem.style.boxShadow = `0 0 30px rgba(${secondaryRGB}, 0.05)`;
            icon.style.color = secondaryColor;
            icon.style.textShadow = `0 0 30px rgba(${secondaryRGB}, 0.3)`;
            name.style.color = secondaryColor;
        });
        
        projItem.addEventListener('mouseleave', () => {
            projItem.style.borderColor = `rgba(${primaryRGB}, 0.1)`;
            projItem.style.background = 'rgba(0, 0, 0, 0.2)';
            projItem.style.boxShadow = 'none';
            icon.style.color = primaryColor;
            icon.style.textShadow = `0 0 20px rgba(${primaryRGB}, 0.2)`;
            name.style.color = primaryColor;
        });
        
        projItem.addEventListener('click', (e) => {
            e.stopPropagation();
            import('./mobile-nav.js').then(module => {
                module.openProyectoDetalle(project.id);
            });
        });
        
        cell.appendChild(projItem);
    });
    
    createArrow(projLeftArrow, '◀', paginaProyectos > 0, () => {
        if (paginaProyectos > 0) {
            paginaProyectos--;
            updateProyectosContent();
        }
    });
    
    createArrow(projRightArrow, '▶', paginaProyectos < totalPaginas - 1, () => {
        if (paginaProyectos < totalPaginas - 1) {
            paginaProyectos++;
            updateProyectosContent();
        }
    });
}

function createArrow(cell, direction, isActive, onClick) {
    if (!cell) return;
    
    const oldArrow = cell.querySelector('.mobile-flecha');
    if (oldArrow) oldArrow.remove();
    
    const textSizes = getTextSizes();
    const primaryColor = CONFIG.COLORS.primary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryColor = CONFIG.COLORS.secondary;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const arrow = document.createElement('div');
    arrow.className = 'mobile-flecha';
    arrow.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.arrows}px;
        color: ${isActive ? secondaryColor : `rgba(${secondaryRGB}, 0.2)`};
        text-shadow: ${isActive ? `0 0 20px rgba(${secondaryRGB}, 1)` : 'none'};
        cursor: ${isActive ? 'pointer' : 'default'};
        pointer-events: ${isActive ? 'auto' : 'none'};
        z-index: 25;
        transition: all 0.3s ease;
        user-select: none;
        -webkit-user-select: none;
        background: transparent;
    `;
    arrow.textContent = direction;
    
    if (isActive) {
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            onClick();
        });
        arrow.addEventListener('touchstart', (e) => {
            e.preventDefault();
            arrow.style.color = secondaryColor;
            arrow.style.textShadow = `0 0 30px rgba(${secondaryRGB}, 0.4)`;
        }, { passive: false });
        arrow.addEventListener('touchend', (e) => {
            e.preventDefault();
            onClick();
        }, { passive: false });
    }
    
    cell.appendChild(arrow);
}

export function getMobileProyectosDesign() {
    return PROYECTOS_DESIGN;
}