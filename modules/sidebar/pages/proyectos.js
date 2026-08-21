

import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';
import { importDesignFromJSON } from '../../logo.js';
import { resetGrid } from '../../interactions.js';
import { isTransitioningCheck, updateURL } from '../index.js';

let proyectosData = null;
let currentPage = 0;
let currentCategory = 'TODOS';
const PROJECTS_PER_PAGE = 14;
let projectsCache = null;
let selectedProjectId = null;
let selectedProjectData = null;
let detailPage = 0;
let totalDetailPages = 0;
let isDetailExpanded = false;
let isExpanding = false;
let detailCellRef = null;
let renderTimeout = null;
let textureWasVisibleBeforeExpand = true;

const LIGHT_TEXT_SHADOW = `0 0 7px rgba(var(--color-primary-rgb), 1)`;

export const EXPANDED_DESIGN = {
    "0,0": {
        "type": "combined_normal",
        "left": 199,
        "top": 23,
        "width": 91,
        "height": 91,
        "combined": true
    },
    "0,2": {
        "type": "combined_normal",
        "left": 305,
        "top": 23,
        "width": 1469,
        "height": 886,
        "combined": true
    },
    "0,30": {
        "type": "combined_normal",
        "left": 1789,
        "top": 23,
        "width": 91,
        "height": 91,
        "combined": true
    },
    "2,0": {
        "type": "combined_normal",
        "left": 199,
        "top": 129,
        "width": 91,
        "height": 780,
        "combined": true
    },
    "2,30": {
        "type": "combined_normal",
        "left": 1789,
        "top": 129,
        "width": 91,
        "height": 780,
        "combined": true
    }
};

const CATEGORY_ICONS = {
    '≤2021': '◆',
    'DISENO WEB': '◈',
    'FRONTEND': '◉',
    'BACKEND': '◊',
    'LOGOS': '◇',
    'BRANDING': '○',
    'ARTE': '□'
};


export function setDetailExpanded(value) {
    isDetailExpanded = value;
}


export function toggleTextureOverlay(show) {
    const overlay = document.getElementById('overlay-container');
    if (overlay) {
        overlay.style.display = show ? 'block' : 'none';
    }
}

function getTextureVisibilityFromSettings() {
    try {
        const saved = localStorage.getItem('edesign_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            return parsed.textura !== undefined ? parsed.textura : true;
        }
    } catch (e) {}
    return true;
}


export function clearProyectosTextureState() {

    const textureEnabled = getTextureVisibilityFromSettings();
    

    if (textureEnabled) {
        toggleTextureOverlay(true);
    } else {
        toggleTextureOverlay(false);
    }
}

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
    isDetailExpanded = false;
    detailCellRef = null;
    isExpanding = false;
    window.selectedProjectId = null;
    if (renderTimeout) {
        clearTimeout(renderTimeout);
        renderTimeout = null;
    }

    const textureEnabled = getTextureVisibilityFromSettings();
    if (textureEnabled && textureWasVisibleBeforeExpand) {
        toggleTextureOverlay(true);
    } else {
        toggleTextureOverlay(false);
    }

    if (window.location.hash.includes('proyectos')) {
        updateURL('proyectos');
    }
}

function toggleDetailExpand() {
    if (isTransitioningCheck()) {
        return;
    }
    
    if (isExpanding) return;
    if (!selectedProjectId || !selectedProjectData) return;
    
    isExpanding = true;

    textureWasVisibleBeforeExpand = getTextureVisibilityFromSettings();

    loadProyectosData().then(data => {
        const savedProjectId = selectedProjectId;
        const savedProjectData = selectedProjectData;
        const savedDetailPage = detailPage;

        const newExpandedState = !isDetailExpanded;
        const designToImport = newExpandedState ? EXPANDED_DESIGN : data.design;

        if (newExpandedState) {
            toggleTextureOverlay(false);
        } else {
            toggleTextureOverlay(textureWasVisibleBeforeExpand);
        }

        document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn').forEach(el => el.remove());
        
        const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
        allCells.forEach(cell => {
            const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn');
            children.forEach(child => child.remove());
        });

        const titleCell = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="0"]');
        if (titleCell) {
            const children = titleCell.querySelectorAll('.proyectos-content, .proyectos-detail, .proyectos-select-message, .expand-back-btn');
            children.forEach(child => child.remove());
        }

        const nextCell = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="30"]');
        if (nextCell) {
            const children = nextCell.querySelectorAll('.expand-next-btn');
            children.forEach(child => child.remove());
        }

        const shouldReset = false;

        importDesignFromJSON(designToImport, () => {
            isDetailExpanded = newExpandedState;
            selectedProjectId = savedProjectId;
            selectedProjectData = savedProjectData;
            detailPage = savedDetailPage;

            if (renderTimeout) {
                clearTimeout(renderTimeout);
                renderTimeout = null;
            }

            renderTimeout = setTimeout(() => {
                renderProyectosContent();
                isExpanding = false;
                renderTimeout = null;
            }, 500);
        }, shouldReset);
    });
}

function updateExpandButton(cell) {
    const oldBtn = cell.querySelector('.expand-btn');
    if (oldBtn) oldBtn.remove();
    

    if (selectedProjectId && selectedProjectData) {
        addExpandButton(cell);
    }
}

function addExpandButton(cell) {
    const oldBtn = cell.querySelector('.expand-btn');
    if (oldBtn) oldBtn.remove();
    
    const btn = document.createElement('div');
    btn.className = 'expand-btn';
    btn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 12px;
        z-index: 25;
        cursor: pointer;
        pointer-events: auto;
        color: ${CONFIG.COLORS.primary};
        font-size: 50px;
        transition: all 0.3s ease;
        opacity: 0.8;
        user-select: none;
        font-family: 'Courier New', monospace;
        line-height: 1;
        text-shadow: 0 0 15px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                     0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.6),
                     0 0 60px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
    `;
    
    btn.textContent = isDetailExpanded ? '−' : '+';
    
    btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.15)';
        btn.style.color = CONFIG.COLORS.secondary;
        btn.style.textShadow = `0 0 15px rgba(${CONFIG.COLORS.secondaryRGB}, 1),
                                0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.6),
                                0 0 60px rgba(${CONFIG.COLORS.secondaryRGB}, 0.3)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '0.8';
        btn.style.transform = 'scale(1)';
        btn.style.color = CONFIG.COLORS.primary;
        btn.style.textShadow = `0 0 15px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                                0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.6),
                                0 0 60px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
    });
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDetailExpand();
    });
    
    cell.appendChild(btn);
}

export async function renderProyectosContent() {
    const data = await loadProyectosData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    const titleCellClean = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="0"]');
    if (titleCellClean) {
        const children = titleCellClean.querySelectorAll('.proyectos-content, .proyectos-detail, .proyectos-select-message, .expand-back-btn');
        children.forEach(child => child.remove());
        titleCellClean.style.backgroundColor = CONFIG.COLORS.background;
        titleCellClean.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        titleCellClean.style.borderColor = CONFIG.COLORS.primary;
        titleCellClean.style.boxShadow = 'none';
    }
    
    const nextCellClean = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="30"]');
    if (nextCellClean) {
        const children = nextCellClean.querySelectorAll('.expand-next-btn');
        children.forEach(child => child.remove());
        nextCellClean.style.backgroundColor = CONFIG.COLORS.background;
        nextCellClean.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        nextCellClean.style.borderColor = CONFIG.COLORS.primary;
        nextCellClean.style.boxShadow = 'none';
    }
    
    if (!selectedProjectId || !selectedProjectData) {
        if (!isDetailExpanded) {
            const textureEnabled = getTextureVisibilityFromSettings();
            toggleTextureOverlay(textureEnabled);
        }
    } else {
        toggleTextureOverlay(false);
    }
    
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let categoryLeftArrow = null;
    let categoryRightArrow = null;
    let detailLeftArrow = null;
    let detailRightArrow = null;
    let categoryCells = [];
    let projectCells = [];
    let detailCell = null;
    let backButtonCell = null;
    let nextProjectCell = null;

    const categoryCols = [2, 6, 10, 14, 18, 22, 26];
    const projectCols = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28];
    
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            const key = `${row},${col}`;
            
            if (key === '0,0' && !isDetailExpanded) {
                titleCell = cell;
            }
            else if (!isDetailExpanded && row === 2 && projectCols.includes(col)) {
                projectCells.push(cell);
            }
            else if (!isDetailExpanded && row === 2 && col === 0) {
                categoryLeftArrow = cell;
            }
            else if (!isDetailExpanded && row === 2 && col === 30) {
                categoryRightArrow = cell;
            }
            else if (isDetailExpanded && row === 2 && col === 0) {
                detailLeftArrow = cell;
            }
            else if (isDetailExpanded && row === 2 && col === 30) {
                detailRightArrow = cell;
            }
            else if (!isDetailExpanded && row === 4 && col === 0) {
                detailLeftArrow = cell;
            }
            else if (!isDetailExpanded && row === 4 && col === 2) {
                detailCell = cell;
                detailCellRef = cell;
            }
            else if (!isDetailExpanded && row === 4 && col === 30) {
                detailRightArrow = cell;
            }
            else if (isDetailExpanded && row === 0 && col === 0) {
                backButtonCell = cell;
            }
            else if (isDetailExpanded && row === 0 && col === 2) {
                detailCell = cell;
                detailCellRef = cell;
            }
            else if (isDetailExpanded && row === 0 && col === 30) {
                nextProjectCell = cell;
            }
        }
    });

    if (!detailCell) {
        setTimeout(() => renderProyectosContent(), 150);
        return;
    }
    
    if (titleCell && !isDetailExpanded) {
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
            text-shadow: ${LIGHT_TEXT_SHADOW};
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        
        if (selectedProjectId && selectedProjectData) {
            title.textContent = selectedProjectData.name;
        } else {
            title.textContent = data.title + (currentCategory !== 'TODOS' ? ` - ${currentCategory}` : '');
        }
        
        titleCell.appendChild(title);
    }

    
    if (!isDetailExpanded) {
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
                font-size: 50px;
                color: ${isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary};
                transition: all 0.3s ease;
            `;
            
            const nameSpan = document.createElement('span');
            nameSpan.textContent = catName;
            nameSpan.style.cssText = `
                font-size: 15px;
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
    }
    
    if (!isDetailExpanded) {
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
                text-shadow: ${isSelected ? `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 1)` : `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 1)`};
                transition: all 0.3s ease;
            `;
            
            const name = document.createElement('span');
            name.textContent = project.name;
            name.style.cssText = `
                font-size: 10px;
                letter-spacing: 1px;
                opacity: ${isSelected ? '1' : '1'};
            `;
            

            
            item.appendChild(icon);
            item.appendChild(name);

            
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

                updateURL('proyectos');
                renderProyectosContent();
                return;
            }
            
            selectedProjectId = project.id;
            selectedProjectData = project;
            detailPage = 0;
            window.selectedProjectId = project.id;

            updateURL('proyectos', project.id);
            renderProyectosContent();
        });
            
            cell.appendChild(item);
        });
    }
    
    if (detailCell) {
        if (selectedProjectId && selectedProjectData) {
            showProjectDetail(selectedProjectData, detailCell);
        } else if (!isDetailExpanded) {
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
                opacity: 1;
                background: transparent;
            `;
            
            const text = document.createElement('span');
            text.textContent = 'SELECCIONA UN PROYECTO';
            text.style.cssText = `
                font-size: 14px;
                letter-spacing: 6px;
                opacity: 100%;
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
        
        updateExpandButton(detailCell);
    }
    
    if (!isDetailExpanded) {
        const allProjects = data.projects;
        const filteredProjects = currentCategory === 'TODOS' 
            ? allProjects 
            : allProjects.filter(p => p.category === currentCategory);
        const totalPages = Math.ceil(filteredProjects.length / PROJECTS_PER_PAGE);

        const categoryArrows = [
            {
                cell: categoryLeftArrow,
                direction: '◀',
                isActive: currentPage > 0,
                onClick: () => { 
                    currentPage--; 
                    renderProyectosContent(); 
                }
            },
            {
                cell: categoryRightArrow,
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
    }
    
    const detailArrows = [
        {
            cell: detailLeftArrow,
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
            cell: detailRightArrow,
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

    if (isDetailExpanded) {
    const allProjects = data.projects;
    const currentIndex = allProjects.findIndex(p => p.id === selectedProjectId);
    const nextIndex = (currentIndex + 1) % allProjects.length;
    const nextProject = allProjects[nextIndex];
    
    const backButtonCell = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="0"]');
    if (backButtonCell) {
        const backBtn = document.createElement('div');
        backBtn.className = 'expand-back-btn';
        backBtn.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            pointer-events: auto;
            z-index: 25;
            font-family: 'Courier New', monospace;
            color: ${CONFIG.COLORS.primary};
            transition: all 0.3s ease;
            gap: 4px;
        `;
        
        const arrowIcon = document.createElement('span');
        arrowIcon.textContent = '◀';
        arrowIcon.style.cssText = `
            font-size: 28px;
            text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            transition: all 0.3s ease;
        `;
        backBtn.appendChild(arrowIcon);
        
        const backText = document.createElement('span');
        backText.textContent = 'REGRESAR';
        backText.style.cssText = `
            font-size: 10px;
            letter-spacing: 2px;
            opacity: 0.7;
            transition: all 0.3s ease;
        `;
        backBtn.appendChild(backText);
        
        backBtn.addEventListener('mouseenter', () => {
            backBtn.style.color = CONFIG.COLORS.secondary;
            arrowIcon.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
            backText.style.opacity = '1';
        });
        
        backBtn.addEventListener('mouseleave', () => {
            backBtn.style.color = CONFIG.COLORS.primary;
            arrowIcon.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
            backText.style.opacity = '0.7';
        });
        
        backBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (isDetailExpanded) {
                toggleDetailExpand();
            }
        });
        
        backButtonCell.appendChild(backBtn);
    }
    
    const nextProjectCell = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="30"]');
        if (nextProjectCell) {
            const nextBtn = document.createElement('div');
            nextBtn.className = 'expand-next-btn';
            nextBtn.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                pointer-events: auto;
                z-index: 25;
                font-family: 'Courier New', monospace;
                color: ${CONFIG.COLORS.primary};
                transition: all 0.3s ease;
                gap: 4px;
            `;
            
            const arrowIcon = document.createElement('span');
            arrowIcon.textContent = '▶';
            arrowIcon.style.cssText = `
                font-size: 28px;
                text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
                transition: all 0.3s ease;
            `;
            nextBtn.appendChild(arrowIcon);
            
            const nextText = document.createElement('span');
            nextText.textContent = 'SIGUIENTE';
            nextText.style.cssText = `
                font-size: 10px;
                letter-spacing: 2px;
                opacity: 0.7;
                transition: all 0.3s ease;
                text-align: center;
                white-space: nowrap;
                width: 100%;
            `;
            nextBtn.appendChild(nextText);
            
            nextBtn.addEventListener('mouseenter', () => {
                nextBtn.style.color = CONFIG.COLORS.secondary;
                arrowIcon.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
                nextText.style.opacity = '1';
            });
            
            nextBtn.addEventListener('mouseleave', () => {
                nextBtn.style.color = CONFIG.COLORS.primary;
                arrowIcon.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
                nextText.style.opacity = '0.7';
            });
            
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (nextProject) {
                    selectedProjectId = nextProject.id;
                    selectedProjectData = nextProject;
                    detailPage = 0;
                    window.selectedProjectId = nextProject.id;
                    updateURL('proyectos', nextProject.id);
                    renderProyectosContent();
                }
            });
            
            nextProjectCell.appendChild(nextBtn);
        }
    }
}

function showProjectDetail(project, detailCell) {
    if (!detailCell) {
        return;
    }
    
    const hasPages = project.pages && project.pages.length > 0;
    const currentPageData = hasPages ? project.pages[detailPage] : null;
    totalDetailPages = hasPages ? project.pages.length : 0;
    
    const isExpanded = isDetailExpanded;
    
    const detail = document.createElement('div');
    detail.className = 'proyectos-detail';
    detail.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: ${isExpanded ? '30px 40px' : '20px 30px'};
        color: ${CONFIG.COLORS.primary};
        font-family: 'Courier New', monospace;
        pointer-events: auto;
        z-index: 20;
        overflow-y: auto;
        overflow-x: hidden;
        display: flex;
        flex-direction: column;
        align-items: center;
        background: transparent;
        user-select: text;
        scroll-behavior: smooth;
    `;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        max-width: 95%;
        width: 100%;
        gap: 8px;
        padding: ${isExpanded ? '20px 0' : '10px 0'};
        flex-shrink: 0;
        margin: auto;
        pointer-events: none;
    `;

    if (isExpanded && hasPages) {
        const pageIndicator2 = document.createElement('div');
        pageIndicator2.textContent = `PÁGINA ${detailPage + 1} DE ${project.pages.length}`;
        pageIndicator2.style.cssText = `
            font-size: 20px;
            letter-spacing: 2px;
            color: white;
            opacity: 1;
            margin-top: 6px;
            text-transform: uppercase;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(pageIndicator2);
    }
    
    const icon = document.createElement('div');
    icon.textContent = project.icon;
    icon.style.cssText = `
        font-size: ${isExpanded ? '48px' : '36px'};
        color: ${CONFIG.COLORS.primary};
        text-shadow: 0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
        text-align: center;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(icon);
    
    const meta = document.createElement('div');
    meta.style.cssText = `
        font-size: ${isExpanded ? '12px' : '10px'};
        letter-spacing: 2px;
        opacity: 1;
        text-align: center;
        line-height: 1.8;
        flex-shrink: 0;
    `;
    meta.textContent = `${project.category}  ·  ${project.type}  ·  ${project.year}`;
    contentWrapper.appendChild(meta);
    
    const name = document.createElement('div');
    name.textContent = project.name;
    name.style.cssText = `
        font-size: ${isExpanded ? '28px' : '20px'};
        letter-spacing: ${isExpanded ? '8px' : '4px'};
        font-weight: bold;
        text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
        color: ${CONFIG.COLORS.secondary};
        text-align: center;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(name);
    
    const desc = document.createElement('div');
    desc.textContent = project.description;
    desc.style.cssText = `
        font-size: ${isExpanded ? '14px' : '12px'};
        letter-spacing: 1px;
        line-height: 1.6;
        opacity: 1;
        text-align: center;
        max-width: 90%;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(desc);
    
    const separator = document.createElement('div');
    separator.style.cssText = `
        width: 30%;
        height: 1px;
        background: rgba(${CONFIG.COLORS.secondaryRGB}, 0.2);
        margin: 4px 0;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(separator);
    
    if (hasPages && currentPageData) {
        const pageTitle = document.createElement('div');
        pageTitle.textContent = currentPageData.title;
        pageTitle.style.cssText = `
            font-size: ${isExpanded ? '16px' : '13px'};
            letter-spacing: 2px;
            font-weight: bold;
            color: ${CONFIG.COLORS.secondary};
            text-align: center;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(pageTitle);
        
        const contentContainer = document.createElement('div');
        contentContainer.style.cssText = `
            display: flex;
            flex-direction: column;
            gap: 10px;
            padding-top: 4px;
            width: 100%;
            max-width: 90%;
            align-items: center;
            flex-shrink: 0;
        `;
        
        if (Array.isArray(currentPageData.content)) {
            currentPageData.content.forEach(item => {
                const element = renderContentItem(item, isExpanded);
                if (element) {
                    contentContainer.appendChild(element);
                }
            });
        } else if (typeof currentPageData.content === 'string') {
            const textEl = document.createElement('div');
            textEl.textContent = currentPageData.content;
            textEl.style.cssText = `
                font-size: ${isExpanded ? '13px' : '11px'};
                letter-spacing: 0.5px;
                line-height: 1.6;
                opacity: 1;
                text-align: center;
            `;
            contentContainer.appendChild(textEl);
        }
        
        contentWrapper.appendChild(contentContainer);
        
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `PÁGINA ${detailPage + 1} DE ${project.pages.length}`;
        pageIndicator.style.cssText = `
            font-size: ${isExpanded ? '11px' : '9px'};
            letter-spacing: 2px;
            color: white;
            opacity: 1;
            margin-top: 6px;
            text-transform: uppercase;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(pageIndicator);
    } else {
        const details = document.createElement('div');
        details.textContent = project.details;
        details.style.cssText = `   
            font-size: ${isExpanded ? '13px' : '11px'};
            letter-spacing: 0.5px;
            line-height: 1.5;
            opacity: 1;
            text-align: center;
            max-width: 90%;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(details);
    }
    
    detail.appendChild(contentWrapper);
    detailCell.appendChild(detail);
    
    setTimeout(() => {
        detail.scrollTop = 0;
    }, 50);
}

function renderContentItem(item, isExpanded) {
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
                font-size: ${isExpanded ? '13px' : '11px'};
                letter-spacing: 0.5px;
                line-height: 1.8;
                opacity: 1;
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
                font-size: ${isExpanded ? '13px' : '11px'};
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
                    font-size: 20;
                    letter-spacing: 1px;
                    opacity: 1;
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
                grid-template-columns: repeat(auto-fit, minmax(${isExpanded ? '120px' : '80px'}, 1fr));
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
                    font-size: 20;
                    letter-spacing: 1px;
                    opacity: 1;
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

export async function selectProjectById(projectId) {
    const data = await loadProyectosData();
    const project = data.projects.find(p => p.id === projectId);
    if (project) {
        selectedProjectId = project.id;
        selectedProjectData = project;
        detailPage = 0;
        window.selectedProjectId = project.id;
        
        if (!textureWasVisibleBeforeExpand) {
            textureWasVisibleBeforeExpand = getTextureVisibilityFromSettings();
        }
        
        toggleTextureOverlay(false);
        
        renderProyectosContent();
    }
}

function showImageLightbox(src) {
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