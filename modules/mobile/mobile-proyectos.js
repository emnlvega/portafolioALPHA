// modules/mobile/mobile-proyectos.js
import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

const PROYECTOS_DESIGN = {
  "0,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 126.5,
    "width": 375,
    "height": 52,
    "combined": true
  },
  "3,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 183.5,
    "width": 33,
    "height": 109,
    "combined": true
  },
  "3,2": {
    "type": "combined_normal",
    "left": 810.5,
    "top": 183.5,
    "width": 71,
    "height": 109,
    "combined": true
  },
  "3,6": {
    "type": "combined_normal",
    "left": 886.5,
    "top": 183.5,
    "width": 71,
    "height": 109,
    "combined": true
  },
  "3,10": {
    "type": "combined_normal",
    "left": 962.5,
    "top": 183.5,
    "width": 71,
    "height": 109,
    "combined": true
  },
  "3,14": {
    "type": "combined_normal",
    "left": 1038.5,
    "top": 183.5,
    "width": 71,
    "height": 109,
    "combined": true
  },
  "3,18": {
    "type": "combined_normal",
    "left": 1114.5,
    "top": 183.5,
    "width": 33,
    "height": 109,
    "combined": true
  },
  "9,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 297.5,
    "width": 14,
    "height": 337,
    "combined": true
  },
  "9,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,7": {
    "type": "combined_normal",
    "left": 905.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,13": {
    "type": "combined_normal",
    "left": 1019.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,19": {
    "type": "combined_normal",
    "left": 1133.5,
    "top": 297.5,
    "width": 14,
    "height": 337,
    "combined": true
  },
  "15,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 411.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "15,7": {
    "type": "combined_normal",
    "left": 905.5,
    "top": 411.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "15,13": {
    "type": "combined_normal",
    "left": 1019.5,
    "top": 411.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 525.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,7": {
    "type": "combined_normal",
    "left": 905.5,
    "top": 525.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "21,13": {
    "type": "combined_normal",
    "left": 1019.5,
    "top": 525.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "27,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 639.5,
    "width": 185,
    "height": 52,
    "combined": true
  },
  "27,10": {
    "type": "combined_normal",
    "left": 962.5,
    "top": 639.5,
    "width": 185,
    "height": 52,
    "combined": true
  }
};

let proyectosData = [];
let categorias = ['TODOS'];
let categoriaActual = 0;
let paginaProyectos = 0;
let startCat = 0;
const PROYECTOS_POR_PAGINA = 9;
let gridReady = false;

async function loadProyectosData() {
    try {
        const response = await fetch('./modules/sidebar/data/proyectos.json');
        if (!response.ok) throw new Error('No se pudo cargar');
        const data = await response.json();
        proyectosData = data.projects || [];
        
        const cats = new Set();
        proyectosData.forEach(p => {
            if (p.category) cats.add(p.category);
        });
        categorias = ['TODOS', ...Array.from(cats)];
        return true;
    } catch (err) {
        proyectosData = [
            { id: 1, name: 'BRANDING', icon: '◆', category: 'DISEÑO' },
            { id: 2, name: 'UI/UX', icon: '◈', category: 'DISEÑO' },
            { id: 3, name: 'ILUSTRACION', icon: '◉', category: 'ARTE' },
            { id: 4, name: 'MOTION', icon: '◊', category: 'ANIMACIÓN' },
            { id: 5, name: 'WEB DESIGN', icon: '◇', category: 'WEB' },
            { id: 6, name: 'APP DESIGN', icon: '○', category: 'DISEÑO' },
            { id: 7, name: 'LOGO', icon: '□', category: 'BRANDING' },
            { id: 8, name: 'PACKAGING', icon: '△', category: 'DISEÑO' },
            { id: 9, name: 'FOTOGRAFIA', icon: '▽', category: 'ARTE' }
        ];
        categorias = ['TODOS', 'DISEÑO', 'ARTE', 'ANIMACIÓN', 'WEB', 'BRANDING'];
        return false;
    }
}

function getProyectosFiltrados() {
    const categoria = categorias[categoriaActual] || 'TODOS';
    if (categoria === 'TODOS') return proyectosData;
    return proyectosData.filter(p => p.category === categoria);
}

function getProyectosPagina() {
    const filtrados = getProyectosFiltrados();
    const start = paginaProyectos * PROYECTOS_POR_PAGINA;
    return filtrados.slice(start, start + PROYECTOS_POR_PAGINA);
}

function getTotalPaginas() {
    const filtrados = getProyectosFiltrados();
    return Math.ceil(filtrados.length / PROYECTOS_POR_PAGINA) || 1;
}

export async function renderMobileProyectos() {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    if (proyectosData.length === 0) {
        await loadProyectosData();
    }
    
    startCat = Math.max(0, Math.min(categoriaActual, categorias.length - 4));
    
    document.querySelectorAll('.mobile-proyectos-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-proyecto-item, .mobile-categoria-item, .mobile-flecha, .mobile-page-indicator').forEach(el => el.remove());
    
    stopRandomAnimations();
    resetGrid(false);
    
    importDesignFromJSON(PROYECTOS_DESIGN, () => {
        gridReady = true;
        createProyectosContent();
        // 🔥 SIEMPRE CREAR LOS BOTONES DE NAVEGACIÓN
        createMobileNavButtons('proyectos');
        disableInteractions();
    }, true);
}

function updateProyectosContent() {
    document.querySelectorAll('.mobile-proyecto-item, .mobile-categoria-item, .mobile-flecha, .mobile-page-indicator, .mobile-proyectos-content').forEach(el => el.remove());
    createProyectosContent();
    // 🔥 ACTUALIZAR BOTONES TAMBIÉN (para cambiar el texto a "◀ INICIO")
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
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let catLeftArrow = null;
    let catRightArrow = null;
    let catCells = [];
    let projLeftArrow = null;
    let projRightArrow = null;
    let projCells = [];
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) titleCell = cell;
            else if (row === 3 && col === 0) catLeftArrow = cell;
            else if (row === 3 && col === 18) catRightArrow = cell;
            else if (row === 27 && col === 0) projLeftArrow = cell;
            else if (row === 27 && col === 10) projRightArrow = cell;
            else if (row === 3 && col >= 2 && col <= 14 && col % 4 === 2) {
                catCells.push({ cell, index: Math.floor((col - 2) / 4) });
            }
            else if ((row === 9 || row === 15 || row === 21) && [1, 7, 13].includes(col)) {
                projCells.push({ cell, row, col });
            }
        }
    });
    
    catCells.sort((a, b) => a.index - b.index);
    
    // ===== TÍTULO =====
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
            font-size: 20px;
            letter-spacing: 8px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(${primaryRGB}, 1),
                         0 0 40px rgba(${primaryRGB}, 0.6),
                         0 0 80px rgba(${primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = 'PROYECTOS';
        titleCell.appendChild(title);
    }
    
    // ===== CATEGORÍAS =====
    // 🔥 startCat ya está actualizado globalmente
    const categoriasVisibles = 4;
    
    catCells.forEach(({ cell }, index) => {
        const catIndex = startCat + index;
        if (catIndex >= categorias.length) return;
        
        const categoria = categorias[catIndex];
        const isActive = catIndex === categoriaActual;
        
        const catItem = document.createElement('div');
        catItem.className = 'mobile-categoria-item';
        catItem.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${isActive ? secondaryColor : primaryColor};
            font-family: 'Courier New', monospace;
            text-shadow: ${isActive ? `0 0 20px rgba(${secondaryRGB}, 0.3)` : `0 0 10px rgba(${primaryRGB}, 0.1)`};
            border: 1px solid ${isActive ? secondaryColor : `rgba(${primaryRGB}, 0.1)`};
            border-radius: 2px;
            background: ${isActive ? `rgba(${secondaryRGB}, 0.05)` : 'transparent'};
            padding: 4px;
            text-align: center;
            gap: 2px;
            pointer-events: auto;
            z-index: 15;
        `;

        catItem.addEventListener('click', (e) => {
            e.stopPropagation();
            if (catIndex !== categoriaActual) {
                categoriaActual = catIndex;
                paginaProyectos = 0;
                // Ajustar startCat para que la categoría seleccionada sea visible
                const categoriasVisibles = 4;
                if (categoriaActual < startCat || categoriaActual >= startCat + categoriasVisibles) {
                    startCat = Math.max(0, Math.min(categoriaActual, categorias.length - categoriasVisibles));
                }
                updateProyectosContent();
            }
        });
        
        const iconSpan = document.createElement('span');
        const firstProject = proyectosData.find(p => p.category === categoria);
        iconSpan.textContent = firstProject?.icon || '◆';
        iconSpan.style.cssText = `font-size: 20px; color: ${isActive ? secondaryColor : primaryColor};`;
        catItem.appendChild(iconSpan);
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = categoria;
        nameSpan.style.cssText = `font-size: 7px; letter-spacing: 2px; color: ${isActive ? secondaryColor : primaryColor};`;
        catItem.appendChild(nameSpan);
        
        cell.appendChild(catItem);
    });
    
    // ===== FLECHAS CATEGORÍAS =====
    createArrow(catLeftArrow, '◀', startCat > 0, () => {
        if (startCat > 0) {
            startCat = Math.max(0, startCat - 4);
            paginaProyectos = 0;
            updateProyectosContent();
        }
    });
    
    createArrow(catRightArrow, '▶', startCat + 4 < categorias.length, () => {
        if (startCat + 4 < categorias.length) {
            startCat = Math.min(categorias.length - 4, startCat + 4);
            paginaProyectos = 0;
            updateProyectosContent();
        }
    });
    
    // ===== PROYECTOS =====
    const proyectos = getProyectosPagina();
    const totalPaginas = getTotalPaginas();
    
    if (paginaProyectos >= totalPaginas && totalPaginas > 0) {
        paginaProyectos = totalPaginas - 1;
    }
    
    projCells.forEach(({ cell }, index) => {
        const project = proyectos[index];
        
        if (!project) {
            const empty = document.createElement('div');
            empty.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: rgba(${primaryRGB}, 0.1);
                font-family: 'Courier New', monospace;
                font-size: 12px;
                pointer-events: none;
                z-index: 10;
            `;
            empty.textContent = '·';
            cell.appendChild(empty);
            return;
        }
        
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
        icon.textContent = project.icon || '◆';
        icon.style.cssText = `
            font-size: 28px;
            color: ${primaryColor};
            text-shadow: 0 0 20px rgba(${primaryRGB}, 0.2);
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        projItem.appendChild(icon);
        
        const name = document.createElement('span');
        name.textContent = project.name || 'PROYECTO';
        name.style.cssText = `
            font-size: 8px;
            letter-spacing: 2px;
            color: ${primaryColor};
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
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
    
    // ===== FLECHAS PROYECTOS =====
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
        font-size: 28px;
        color: ${isActive ? CONFIG.COLORS.primary : `rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`};
        text-shadow: ${isActive ? `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)` : 'none'};
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
            arrow.style.color = CONFIG.COLORS.secondary;
            arrow.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
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