import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';

let proyectosData = null;
let currentPage = 0;
let currentCategory = 'TODOS';
const PROJECTS_PER_PAGE = 14;
let projectsCache = null;

const CATEGORY_ICONS = {
    'DISEÑO GRAFICO': '◆',
    'DISENO WEB': '◈',
    'FRONTEND': '◉',
    'BACKEND': '◊',
    'LOGOS': '◇',
    'BRANDING': '○',
    'ARTE': '□'
};

async function loadProyectosData() {
    if (proyectosData) return proyectosData;
    const response = await fetch(new URL('../data/proyectos.json', import.meta.url));
    proyectosData = await response.json();
    return proyectosData;
}

export function getProyectosDesign() {
    return loadProyectosData().then(data => data.design);
}

export async function renderProyectosContent() {
    const data = await loadProyectosData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // 🔥 LIMPIEZA COMPLETA
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message').forEach(el => el.remove());
    
    // Limpiar dentro de todas las celdas
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    // BUSCAR las celdas combinadas por posición (NO CREAR NUEVAS)
    let titleCell = null;
    let leftArrowCell = null;
    let rightArrowCell = null;
    let categoryCells = [];
    let projectCells = [];
    let detailCell = null;

    const cellMap = {
        '0,0': 'title',
        '3,0': 'leftArrow',
        '3,30': 'rightArrow',
        '8,2': 'detail'
    };
    // Las categorías están en fila 3, columnas 2,6,10,14,18,22,26 (índices 0-based)
    const categoryCols = [2, 6, 10, 14, 18, 22, 26];
    // Los proyectos están en fila 6, columnas 2,4,6,8,10,12,14,16,18,20,22,24,26,28
    const projectCols = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            const key = `${row},${col}`;
            
            if (key === '0,0') titleCell = cell;
            else if (key === '3,0') leftArrowCell = cell;
            else if (key === '3,30') rightArrowCell = cell;
            else if (key === '8,2') detailCell = cell;
            else if (row === 3 && categoryCols.includes(col)) {
                categoryCells.push(cell);
            } else if (row === 6 && projectCols.includes(col)) {
                projectCells.push(cell);
            }
        }
    });
    
    // Si no hay celdas combinadas, esperar a que importDesignFromJSON las cree
    if (categoryCells.length === 0 && projectCells.length === 0) {
        console.log('Esperando a que las celdas combinadas se creen...');
        setTimeout(() => renderProyectosContent(), 100);
        return;
    }
    
    // ===== TÍTULO =====
    if (titleCell) {
        const title = document.createElement('div');
        title.className = 'proyectos-content';
        title.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 32px;
            letter-spacing: 12px;
            text-transform: uppercase;
            text-shadow: 0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
        `;
        title.textContent = data.title + (currentCategory !== 'TODOS' ? ` - ${currentCategory}` : '');
        titleCell.appendChild(title);
    }
    
    // ===== CATEGORÍAS (FILTROS) =====
    const categories = ['TODOS', ...data.categories];
    categoryCells.forEach((cell, index) => {
        if (index >= categories.length) return;
        
        const catName = categories[index];
        const isActive = catName === currentCategory;
        const catIcon = catName === 'TODOS' ? '◈' : CATEGORY_ICONS[catName] || '◆';
        
        const cat = document.createElement('div');
        cat.className = 'proyectos-category proyectos-filter';
        cat.dataset.category = catName;
        cat.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            text-shadow: ${isActive ? 'var(--text-shadow-active)' : 'var(--text-shadow-normal)'};
            pointer-events: auto;
            cursor: pointer;
            z-index: 20;
            padding: 8px;
            text-align: center;
            line-height: 1.3;
            border: 1px solid ${isActive ? CONFIG.COLORS.secondary : `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`};
            border-radius: 4px;
            transition: all 0.3s ease;
            gap: 4px;
            background: transparent;
        `;
        
        const iconSpan = document.createElement('span');
        iconSpan.textContent = catIcon;
        iconSpan.style.cssText = `
            font-size: 18px;
            color: ${isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
            transition: all 0.3s ease;
        `;
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = catName;
        nameSpan.style.cssText = `
            font-size: 9px;
            letter-spacing: 1px;
            opacity: 0.8;
        `;
        
        cat.appendChild(iconSpan);
        cat.appendChild(nameSpan);
        
        cat.addEventListener('mouseenter', () => {
            if (!isActive) {
                cat.style.borderColor = CONFIG.COLORS.secondary;
                cat.style.color = CONFIG.COLORS.secondary;
                iconSpan.style.color = CONFIG.COLORS.secondary;
                cat.style.textShadow = 'var(--text-shadow-hover)';
            }
        });
        cat.addEventListener('mouseleave', () => {
            if (!isActive) {
                cat.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
                cat.style.color = CONFIG.COLORS.primary;
                iconSpan.style.color = CONFIG.COLORS.primary;
                cat.style.textShadow = 'var(--text-shadow-normal)';
            }
        });
        
        cat.addEventListener('click', () => {
            if (catName === currentCategory) return;
            currentCategory = catName;
            currentPage = 0;
            renderProyectosContent();
        });
        
        cell.appendChild(cat);
    });
    
    // ===== PROYECTOS =====
    const allProjects = data.projects;
    const filteredProjects = currentCategory === 'TODOS' 
        ? allProjects 
        : allProjects.filter(p => p.category === currentCategory);
    
    const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);
    const startIndex = currentPage * PROJECTS_PER_PAGE;
    const endIndex = Math.min(startIndex + PROJECTS_PER_PAGE, filteredProjects.length);
    const pageProjects = filteredProjects.slice(startIndex, endIndex);
    
    projectsCache = { filteredProjects, totalPages, startIndex, endIndex };
    
    projectCells.forEach((cell, index) => {
        if (index >= pageProjects.length) return;
        
        const project = pageProjects[index];
        const item = document.createElement('div');
        item.className = 'proyectos-item';
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
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            cursor: pointer;
            pointer-events: auto;
            z-index: 20;
            padding: 8px;
            text-align: center;
            border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
            border-radius: 4px;
            transition: all 0.3s ease;
            background: transparent;
        `;
        
        const icon = document.createElement('span');
        icon.textContent = project.icon;
        icon.style.cssText = `
            font-size: 24px;
            margin-bottom: 4px;
            color: ${CONFIG.COLORS.primary};
            text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
            transition: all 0.3s ease;
        `;
        
        const name = document.createElement('span');
        name.textContent = project.name;
        name.style.cssText = `
            font-size: 9px;
            letter-spacing: 1px;
            opacity: 0.8;
        `;
        
        const catTag = document.createElement('span');
        catTag.textContent = project.category;
        catTag.style.cssText = `
            font-size: 7px;
            letter-spacing: 1px;
            opacity: 0.4;
            margin-top: 2px;
            text-transform: uppercase;
        `;
        
        item.appendChild(icon);
        item.appendChild(name);
        item.appendChild(catTag);
        
        item.addEventListener('mouseenter', () => {
            item.style.borderColor = CONFIG.COLORS.secondary;
            item.style.color = CONFIG.COLORS.secondary;
            item.style.textShadow = 'var(--text-shadow-hover)';
            icon.style.color = CONFIG.COLORS.secondary;
            icon.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
        });
        
        item.addEventListener('mouseleave', () => {
            item.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
            item.style.color = CONFIG.COLORS.primary;
            item.style.textShadow = 'var(--text-shadow-normal)';
            icon.style.color = CONFIG.COLORS.primary;
            icon.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
        });
        
        item.addEventListener('click', () => {
            showProjectDetail(project, detailCell);
        });
        
        cell.appendChild(item);
    });
    
    // ===== MENSAJE DE SELECCIÓN =====
    if (detailCell) {
        // Limpiar solo los mensajes y detalles anteriores
        detailCell.querySelectorAll('.proyectos-detail, .proyectos-select-message').forEach(el => el.remove());
        
        const hasProjectSelected = detailCell.querySelector('.proyectos-detail');
        
        if (!hasProjectSelected && pageProjects.length > 0) {
            const message = document.createElement('div');
            message.className = 'proyectos-select-message';
            message.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                color: ${CONFIG.COLORS.primary};
                font-family: 'Courier New', monospace;
                pointer-events: none;
                z-index: 20;
                gap: 16px;
                opacity: 0.6;
                background: transparent;
            `;
            
            const text = document.createElement('span');
            text.textContent = 'SELECCIONA UN PROYECTO';
            text.style.cssText = `
                font-size: 14px;
                letter-spacing: 6px;
                text-transform: uppercase;
                text-shadow: var(--text-shadow-normal);
            `;
            
            const arrows = document.createElement('span');
            arrows.textContent = '▲ ▲ ▲';
            arrows.style.cssText = `
                font-size: 24px;
                letter-spacing: 12px;
                animation: blinkArrows 1.2s ease-in-out infinite;
                text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            `;
            message.appendChild(arrows);
            message.appendChild(text);

            detailCell.appendChild(message);
            
            if (!document.getElementById('blinkArrowsStyle')) {
                const style = document.createElement('style');
                style.id = 'blinkArrowsStyle';
                style.textContent = `
                    @keyframes blinkArrows {
                        0%, 100% { opacity: 0.3; transform: translateY(0); }
                        50% { opacity: 1; transform: translateY(-4px); }
                    }
                `;
                document.head.appendChild(style);
            }
        }
    }
    
    // ===== FLECHAS =====
    if (leftArrowCell) {
        const leftArrow = document.createElement('div');
        leftArrow.className = 'proyectos-nav';
        leftArrow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 28px;
            cursor: pointer;
            pointer-events: ${currentPage > 0 ? 'auto' : 'none'};
            z-index: 20;
            opacity: ${currentPage > 0 ? '1' : '0.3'};
            transition: all 0.3s ease;
            text-shadow: var(--text-shadow-normal);
            background: transparent;
        `;
        leftArrow.textContent = '◀';
        
        leftArrow.addEventListener('mouseenter', () => {
            if (currentPage > 0) {
                leftArrow.style.color = CONFIG.COLORS.secondary;
                leftArrow.style.textShadow = 'var(--text-shadow-hover)';
            }
        });
        leftArrow.addEventListener('mouseleave', () => {
            leftArrow.style.color = CONFIG.COLORS.primary;
            leftArrow.style.textShadow = 'var(--text-shadow-normal)';
        });
        
        leftArrow.addEventListener('click', () => {
            if (currentPage > 0) {
                currentPage--;
                renderProyectosContent();
            }
        });
        
        leftArrowCell.appendChild(leftArrow);
    }
    
    if (rightArrowCell) {
        const rightArrow = document.createElement('div');
        rightArrow.className = 'proyectos-nav';
        rightArrow.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 28px;
            cursor: pointer;
            pointer-events: ${currentPage < totalPages - 1 ? 'auto' : 'none'};
            z-index: 20;
            opacity: ${currentPage < totalPages - 1 ? '1' : '0.3'};
            transition: all 0.3s ease;
            text-shadow: var(--text-shadow-normal);
            background: transparent;
        `;
        rightArrow.textContent = '▶';
        
        rightArrow.addEventListener('mouseenter', () => {
            if (currentPage < totalPages - 1) {
                rightArrow.style.color = CONFIG.COLORS.secondary;
                rightArrow.style.textShadow = 'var(--text-shadow-hover)';
            }
        });
        rightArrow.addEventListener('mouseleave', () => {
            rightArrow.style.color = CONFIG.COLORS.primary;
            rightArrow.style.textShadow = 'var(--text-shadow-normal)';
        });
        
        rightArrow.addEventListener('click', () => {
            if (currentPage < totalPages - 1) {
                currentPage++;
                renderProyectosContent();
            }
        });
        
        rightArrowCell.appendChild(rightArrow);
    }
}

function showProjectDetail(project, detailCell) {
    if (!detailCell) return;
    
    detailCell.querySelectorAll('.proyectos-detail, .proyectos-select-message').forEach(el => el.remove());
    
    const detail = document.createElement('div');
    detail.className = 'proyectos-detail';
    detail.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 20px 30px;
        color: ${CONFIG.COLORS.primary};
        font-family: 'Courier New', monospace;
        pointer-events: none;
        z-index: 20;
        overflow: hidden;
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 20px;
        opacity: 0;
        transition: opacity 0.5s ease;
        background: transparent;
    `;
    
    const leftCol = document.createElement('div');
    leftCol.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        text-align: center;
    `;
    
    const icon = document.createElement('div');
    icon.textContent = project.icon;
    icon.style.cssText = `
        font-size: 48px;
        color: ${CONFIG.COLORS.primary};
        text-shadow: 0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
    `;
    
    const meta = document.createElement('div');
    meta.style.cssText = `
        font-size: 10px;
        letter-spacing: 1px;
        opacity: 0.6;
        line-height: 1.8;
    `;
    meta.innerHTML = `
        ${project.category}<br>
        ${project.type}<br>
        ${project.year}
    `;
    
    leftCol.appendChild(icon);
    leftCol.appendChild(meta);
    
    const rightCol = document.createElement('div');
    rightCol.style.cssText = `
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 8px;
        overflow: hidden;
    `;
    
    const name = document.createElement('div');
    name.textContent = project.name;
    name.style.cssText = `
        font-size: 20px;
        letter-spacing: 4px;
        font-weight: bold;
        text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
    `;
    
    const desc = document.createElement('div');
    desc.textContent = project.description;
    desc.style.cssText = `
        font-size: 12px;
        letter-spacing: 1px;
        line-height: 1.6;
        opacity: 0.8;
    `;
    
    const details = document.createElement('div');
    details.textContent = project.details;
    details.style.cssText = `
        font-size: 11px;
        letter-spacing: 0.5px;
        line-height: 1.5;
        opacity: 0.6;
        padding-top: 8px;
        border-top: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
    `;
    
    rightCol.appendChild(name);
    rightCol.appendChild(desc);
    rightCol.appendChild(details);
    
    detail.appendChild(leftCol);
    detail.appendChild(rightCol);
    detailCell.appendChild(detail);
    
    requestAnimationFrame(() => {
        detail.style.opacity = '1';
    });
}