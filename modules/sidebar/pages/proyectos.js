import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';

let proyectosData = null;
let currentPage = 0;
let currentCategory = 'TODOS';
const PROJECTS_PER_PAGE = 14;
let projectsCache = null;
let selectedProjectId = null;
let selectedProjectData = null;
let detailPage = 0;
let totalDetailPages = 0;

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

export function clearProjectSelection() {
    selectedProjectId = null;
    selectedProjectData = null;
    detailPage = 0;
}

export async function renderProyectosContent() {
    const data = await loadProyectosData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let leftArrowCell = null;
    let rightArrowCell = null;
    let detailLeftArrowCell = null;
    let detailRightArrowCell = null;
    let categoryCells = [];
    let projectCells = [];
    let detailCell = null;

    const categoryCols = [2, 6, 10, 14, 18, 22, 26];
    const projectCols = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            const key = `${row},${col}`;
            
            if (key === '0,0') {
                titleCell = cell;
            } else if (key === '2,0') {
                leftArrowCell = cell;
            } else if (key === '2,30') {
                rightArrowCell = cell;
            } else if (key === '7,0') {
                detailLeftArrowCell = cell;
            } else if (key === '7,30') {
                detailRightArrowCell = cell;
            } else if (key === '7,2') {
                detailCell = cell;
            } else if (row === 2 && categoryCols.includes(col)) {
                categoryCells.push(cell);
            } else if (row === 5 && projectCols.includes(col)) {
                projectCells.push(cell);
            }
        }
    });
    
    if (categoryCells.length === 0 && projectCells.length === 0) {
        console.log('Esperando a que las celdas combinadas se creen...');
        setTimeout(() => renderProyectosContent(), 100);
        return;
    }
    
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
            user-select: none;
        `;
        title.textContent = data.title + (currentCategory !== 'TODOS' ? ` - ${currentCategory}` : '');
        titleCell.appendChild(title);
    }
    
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
        const isSelected = selectedProjectId === project.id;
        
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
            color: ${isSelected ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            cursor: pointer;
            pointer-events: auto;
            z-index: 20;
            padding: 8px;
            text-align: center;
            border: 1px solid ${isSelected ? CONFIG.COLORS.secondary : `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`};
            border-radius: 4px;
            transition: all 0.3s ease;
            background: transparent;
            text-shadow: ${isSelected ? 'var(--text-shadow-active)' : 'var(--text-shadow-normal)'};
        `;
        
        const icon = document.createElement('span');
        icon.textContent = project.icon;
        icon.style.cssText = `
            font-size: 24px;
            margin-bottom: 4px;
            color: ${isSelected ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
            text-shadow: ${isSelected ? `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)` : `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`};
            transition: all 0.3s ease;
        `;
        
        const name = document.createElement('span');
        name.textContent = project.name;
        name.style.cssText = `
            font-size: 9px;
            letter-spacing: 1px;
            opacity: ${isSelected ? '1' : '0.8'};
        `;
        
        const catTag = document.createElement('span');
        catTag.textContent = project.category;
        catTag.style.cssText = `
            font-size: 7px;
            letter-spacing: 1px;
            opacity: ${isSelected ? '0.6' : '0.4'};
            margin-top: 2px;
            text-transform: uppercase;
            color: ${isSelected ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
        `;
        
        item.appendChild(icon);
        item.appendChild(name);
        item.appendChild(catTag);
        
        item.addEventListener('mouseenter', () => {
            if (!isSelected) {
                item.style.borderColor = CONFIG.COLORS.secondary;
                item.style.color = CONFIG.COLORS.secondary;
                item.style.textShadow = 'var(--text-shadow-hover)';
                icon.style.color = CONFIG.COLORS.secondary;
                icon.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
            }
        });
        
        item.addEventListener('mouseleave', () => {
            if (!isSelected) {
                item.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
                item.style.color = CONFIG.COLORS.primary;
                item.style.textShadow = 'var(--text-shadow-normal)';
                icon.style.color = CONFIG.COLORS.primary;
                icon.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
            }
        });
        
        item.addEventListener('click', () => {
            if (selectedProjectId === project.id) {
                selectedProjectId = null;
                selectedProjectData = null;
                detailPage = 0;
                renderProyectosContent();
                return;
            }
            
            selectedProjectId = project.id;
            selectedProjectData = project;
            detailPage = 0;
            renderProyectosContent();
        });
        
        cell.appendChild(item);
    });
    
    if (detailCell) {
        detailCell.querySelectorAll('.proyectos-detail, .proyectos-select-message').forEach(el => el.remove());
        
        if (selectedProjectId && selectedProjectData) {
            showProjectDetail(selectedProjectData, detailCell);
        } else if (pageProjects.length > 0) {
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
    
    // ===== FLECHAS DE CATEGORÍA (OUTLINE) =====
    const categoryArrows = [
        {
            cell: leftArrowCell,
            direction: '◀',
            isActive: currentPage > 0,
            onClick: () => { 
                currentPage--; 
                renderProyectosContent(); 
            }
        },
        {
            cell: rightArrowCell,
            direction: '▶',
            isActive: currentPage < totalPages - 1,
            onClick: () => { 
                currentPage++; 
                renderProyectosContent(); 
            }
        }
    ];

    categoryArrows.forEach((arrow) => {
        if (!arrow.cell) return;
        
        const el = document.createElement('div');
        el.className = 'proyectos-nav category-arrow';
        el.style.cssText = `
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
            cursor: ${arrow.isActive ? 'pointer' : 'default'};
            pointer-events: ${arrow.isActive ? 'auto' : 'none'};
            z-index: 20;
            opacity: ${arrow.isActive ? '1' : '0.2'};
            transition: color 0.3s ease, opacity 0.3s ease, text-shadow 0.3s ease;
            background: transparent;
            color: ${CONFIG.COLORS.background};
            -webkit-text-stroke: 2px ${CONFIG.COLORS.primary};
            text-stroke: 2px ${CONFIG.COLORS.primary};
        `;
        el.textContent = arrow.direction;
        
        if (arrow.isActive) {
            el.style.textShadow = `
                0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)
            `;
            el.style.animation = 'blinkArrow 1.2s ease-in-out infinite';
        } else {
            el.style.textShadow = 'var(--text-shadow-normal)';
            el.style.opacity = '0.2';
        }
        
        if (arrow.isActive) {
            el.addEventListener('mouseenter', () => {
                el.style.textShadow = `
                    0 0 5px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                    0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                    0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                    0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2),
                    0 0 120px rgba(${CONFIG.COLORS.primaryRGB}, 0.1)
                `;
            });
            el.addEventListener('mouseleave', () => {
                el.style.textShadow = `
                    0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                    0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                    0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                    0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)
                `;
            });
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                arrow.onClick();
            });
        }
        
        arrow.cell.appendChild(el);
    });
    
    // ===== FLECHAS DE DETALLE (FILL) =====
    const detailArrows = [
        {
            cell: detailLeftArrowCell,
            direction: '◀',
            isActive: detailPage > 0,
            onClick: () => { 
                if (detailPage > 0) {
                    detailPage--; 
                    renderProyectosContent(); 
                }
            }
        },
        {
            cell: detailRightArrowCell,
            direction: '▶',
            isActive: selectedProjectData && detailPage < (selectedProjectData.pages ? selectedProjectData.pages.length - 1 : 0),
            onClick: () => { 
                if (selectedProjectData && detailPage < (selectedProjectData.pages ? selectedProjectData.pages.length - 1 : 0)) {
                    detailPage++; 
                    renderProyectosContent(); 
                }
            }
        }
    ];

    detailArrows.forEach((arrow) => {
        if (!arrow.cell) return;
        
        const el = document.createElement('div');
        el.className = 'proyectos-nav detail-arrow';
        el.style.cssText = `
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
            cursor: ${arrow.isActive ? 'pointer' : 'default'};
            pointer-events: ${arrow.isActive ? 'auto' : 'none'};
            z-index: 20;
            opacity: ${arrow.isActive ? '1' : '0.2'};
            transition: color 0.3s ease, opacity 0.3s ease, text-shadow 0.3s ease;
            background: transparent;
        `;
        el.textContent = arrow.direction;
        
        if (arrow.isActive) {
            el.style.color = CONFIG.COLORS.primary;
            el.style.textShadow = `
                0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)
            `;
            el.style.animation = 'blinkArrow 1.2s ease-in-out infinite';
        } else {
            el.style.color = CONFIG.COLORS.primary;
            el.style.textShadow = 'var(--text-shadow-normal)';
            el.style.opacity = '0.2';
        }
        
        if (arrow.isActive) {
            el.addEventListener('mouseenter', () => {
                el.style.textShadow = `
                    0 0 5px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                    0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                    0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                    0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2),
                    0 0 120px rgba(${CONFIG.COLORS.primaryRGB}, 0.1)
                `;
            });
            el.addEventListener('mouseleave', () => {
                el.style.textShadow = `
                    0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                    0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.8),
                    0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.4),
                    0 0 80px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)
                `;
            });
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                arrow.onClick();
            });
        }
        
        arrow.cell.appendChild(el);
    });
}

function showProjectDetail(project, detailCell) {
    if (!detailCell) {
        console.warn('detailCell no encontrado');
        return;
    }
    
    detailCell.querySelectorAll('.proyectos-detail, .proyectos-select-message').forEach(el => el.remove());
    
    const hasPages = project.pages && project.pages.length > 0;
    const currentPageData = hasPages ? project.pages[detailPage] : null;
    totalDetailPages = hasPages ? project.pages.length : 0;
    
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
        overflow-y: auto;
        display: grid;
        grid-template-columns: 180px 1fr;
        gap: 20px;
        background: transparent;
        user-select: text;
    `;
    
    // Scrollbar personalizada para el detalle
    const styleScroll = document.createElement('style');
    styleScroll.textContent = `
        .proyectos-detail::-webkit-scrollbar {
            width: 4px;
        }
        .proyectos-detail::-webkit-scrollbar-track {
            background: transparent;
        }
        .proyectos-detail::-webkit-scrollbar-thumb {
            background: rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            border-radius: 2px;
        }
        .proyectos-detail::-webkit-scrollbar-thumb:hover {
            background: rgba(${CONFIG.COLORS.primaryRGB}, 0.6);
        }
    `;
    document.head.appendChild(styleScroll);
    
    const leftCol = document.createElement('div');
    leftCol.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        gap: 10px;
        text-align: center;
        padding-top: 10px;
        pointer-events: none;
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
        justify-content: flex-start;
        gap: 8px;
        overflow-y: auto;
        padding-right: 8px;
        pointer-events: auto;
    `;
    
    const name = document.createElement('div');
    name.textContent = project.name;
    name.style.cssText = `
        font-size: 20px;
        letter-spacing: 4px;
        font-weight: bold;
        text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
        color: ${CONFIG.COLORS.secondary};
        pointer-events: none;
    `;
    
    const desc = document.createElement('div');
    desc.textContent = project.description;
    desc.style.cssText = `
        font-size: 12px;
        letter-spacing: 1px;
        line-height: 1.6;
        opacity: 0.8;
        pointer-events: none;
    `;
    
    rightCol.appendChild(name);
    rightCol.appendChild(desc);
    
    if (hasPages && currentPageData) {
        const pageTitle = document.createElement('div');
        pageTitle.textContent = currentPageData.title;
        pageTitle.style.cssText = `
            font-size: 13px;
            letter-spacing: 2px;
            font-weight: bold;
            color: ${CONFIG.COLORS.secondary};
            margin-top: 10px;
            border-bottom: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
            padding-bottom: 6px;
            pointer-events: none;
        `;
        rightCol.appendChild(pageTitle);
        
        // Renderizar contenido personalizable
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 12px;
            padding-top: 6px;
        `;
        
        if (Array.isArray(currentPageData.content)) {
            currentPageData.content.forEach(item => {
                const element = renderContentItem(item);
                if (element) {
                    contentContainer.appendChild(element);
                }
            });
        } else if (typeof currentPageData.content === 'string') {
            // Fallback: si es texto plano
            const textEl = document.createElement('div');
            textEl.textContent = currentPageData.content;
            textEl.style.cssText = `
                font-size: 11px;
                letter-spacing: 0.5px;
                line-height: 1.6;
                opacity: 0.8;
            `;
            contentContainer.appendChild(textEl);
        }
        
        rightCol.appendChild(contentContainer);
        
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `PAGINA ${detailPage + 1} DE ${project.pages.length}`;
        pageIndicator.style.cssText = `
            font-size: 9px;
            letter-spacing: 2px;
            opacity: 0.4;
            margin-top: 8px;
            text-transform: uppercase;
            pointer-events: none;
        `;
        rightCol.appendChild(pageIndicator);
    } else {
        const details = document.createElement('div');
        details.textContent = project.details;
        details.style.cssText = `   
            font-size: 11px;
            letter-spacing: 0.5px;
            line-height: 1.5;
            opacity: 0.6;
            padding-top: 8px;
            border-top: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
            pointer-events: none;
        `;
        rightCol.appendChild(details);
    }
    
    detail.appendChild(leftCol);
    detail.appendChild(rightCol);
    detailCell.appendChild(detail);
}

function renderContentItem(item) {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: 100%;
    `;
    
    switch (item.type) {
        case 'text':
            const textEl = document.createElement('div');
            textEl.textContent = item.value;
            textEl.style.cssText = `
                font-size: 11px;
                letter-spacing: 0.5px;
                line-height: 1.8;
                opacity: 0.85;
            `;
            container.appendChild(textEl);
            break;
            
        case 'link':
            const linkEl = document.createElement('a');
            linkEl.href = item.value;
            linkEl.textContent = item.label || item.value;
            linkEl.target = '_blank';
            linkEl.style.cssText = `
                color: ${CONFIG.COLORS.primary};
                font-size: 11px;
                letter-spacing: 1px;
                text-decoration: none;
                border-bottom: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
                padding: 2px 0;
                transition: all 0.3s ease;
                display: inline-block;
                width: fit-content;
                cursor: pointer;
                pointer-events: auto;
            `;
            linkEl.addEventListener('mouseenter', () => {
                linkEl.style.borderBottomColor = CONFIG.COLORS.secondary;
                linkEl.style.color = CONFIG.COLORS.secondary;
            });
            linkEl.addEventListener('mouseleave', () => {
                linkEl.style.borderBottomColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
                linkEl.style.color = CONFIG.COLORS.primary;
            });
            container.appendChild(linkEl);
            break;
            
        case 'image':
            const imgWrap = document.createElement('div');
            imgWrap.style.cssText = `
                width: 100%;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
            `;
            
            const imgEl = document.createElement('img');
            imgEl.src = item.value;
            imgEl.alt = item.caption || '';
            imgEl.style.cssText = `
                width: 100%;
                height: auto;
                display: block;
            `;
            imgWrap.appendChild(imgEl);
            container.appendChild(imgWrap);
            
            if (item.caption) {
                const captionEl = document.createElement('div');
                captionEl.textContent = item.caption;
                captionEl.style.cssText = `
                    font-size: 9px;
                    letter-spacing: 1px;
                    opacity: 0.5;
                    text-align: center;
                    margin-top: 2px;
                `;
                container.appendChild(captionEl);
            }
            break;
            
        case 'gallery':
            const galleryWrap = document.createElement('div');
            galleryWrap.style.cssText = `
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
                gap: 8px;
                width: 100%;
                margin-top: 4px;
            `;
            
            if (Array.isArray(item.value)) {
                item.value.forEach(imgSrc => {
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = `
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
                        aspect-ratio: 1;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        pointer-events: auto;
                    `;
                    
                    const thumb = document.createElement('img');
                    thumb.src = imgSrc;
                    thumb.style.cssText = `
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        display: block;
                        transition: transform 0.3s ease;
                    `;
                    
                    imgContainer.appendChild(thumb);
                    
                    imgContainer.addEventListener('mouseenter', () => {
                        thumb.style.transform = 'scale(1.05)';
                        imgContainer.style.borderColor = CONFIG.COLORS.secondary;
                    });
                    imgContainer.addEventListener('mouseleave', () => {
                        thumb.style.transform = 'scale(1)';
                        imgContainer.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
                    });
                    
                    // Click para abrir imagen completa (lightbox simple)
                    imgContainer.addEventListener('click', () => {
                        showImageLightbox(imgSrc);
                    });
                    
                    galleryWrap.appendChild(imgContainer);
                });
            }
            container.appendChild(galleryWrap);
            break;
            
        case 'video':
            const videoWrap = document.createElement('div');
            videoWrap.style.cssText = `
                width: 100%;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
                background: #000;
            `;
            
            const videoEl = document.createElement('video');
            videoEl.src = item.value;
            videoEl.controls = true;
            videoEl.style.cssText = `
                width: 100%;
                display: block;
            `;
            videoWrap.appendChild(videoEl);
            container.appendChild(videoWrap);
            
            if (item.caption) {
                const captionEl = document.createElement('div');
                captionEl.textContent = item.caption;
                captionEl.style.cssText = `
                    font-size: 9px;
                    letter-spacing: 1px;
                    opacity: 0.5;
                    text-align: center;
                    margin-top: 2px;
                `;
                container.appendChild(captionEl);
            }
            break;
            
        default:
            return null;
    }
    
    return container;
}

function showImageLightbox(src) {
    // Eliminar lightbox anterior si existe
    const oldLightbox = document.getElementById('lightbox-overlay');
    if (oldLightbox) oldLightbox.remove();
    
    const lightbox = document.createElement('div');
    lightbox.id = 'lightbox-overlay';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.92);
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        backdrop-filter: blur(10px);
    `;
    
    const img = document.createElement('img');
    img.src = src;
    img.style.cssText = `
        max-width: 90%;
        max-height: 90%;
        object-fit: contain;
        border-radius: 8px;
        border: 1px solid rgba(var(--color-primary-rgb), 0.2);
        box-shadow: 0 0 60px rgba(var(--color-primary-rgb), 0.1);
    `;
    
    lightbox.appendChild(img);
    
    lightbox.addEventListener('click', () => {
        lightbox.remove();
    });
    
    document.body.appendChild(lightbox);
}