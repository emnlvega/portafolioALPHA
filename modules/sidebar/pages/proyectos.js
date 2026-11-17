import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';
import { importDesignFromJSON } from '../../logo.js';
import { resetGrid } from '../../interactions.js';
import { isTransitioningCheck, updateURL } from '../index.js';
import { handleProyectosTextureEnter, handleProyectosTextureLeave } from '../../settings.js';

let allProjectsCache = null;
let proyectosDataCache = {};
let currentPage = 0;
const PROJECTS_PER_PAGE = 21;
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

function getLineHeight() {
    return CONFIG.LINE_HEIGHT || {
        title: 1.2,
        subTitle: 1.4,
        medium: 1.6,
        small: 1.5,
        tiny: 1.3
    };
}

export const EXPANDED_DESIGN = {
  "0,0": {
    "type": "combined_normal",
    "start": [
      0,
      0
    ],
    "end": [
      1,
      1
    ],
    "combined": true
  },
  "0,2": {
    "type": "combined_normal",
    "start": [
      0,
      2
    ],
    "end": [
      16,
      29
    ],
    "combined": true
  },
  "0,30": {
    "type": "combined_normal",
    "start": [
      0,
      30
    ],
    "end": [
      1,
      31
    ],
    "combined": true
  },
  "2,0": {
    "type": "combined_normal",
    "start": [
      2,
      0
    ],
    "end": [
      16,
      1
    ],
    "combined": true
  },
  "2,30": {
    "type": "combined_normal",
    "start": [
      2,
      30
    ],
    "end": [
      16,
      31
    ],
    "combined": true
  }
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
    toggleTextureOverlay(false);
}

async function loadProyectosLayout() {
    return {
      "design": {
        "0,0": {
          "type": "combined_normal",
          "start": [
            0,
            0
          ],
          "end": [
            2,
            31
          ],
          "combined": true
        },
        "3,2": {
          "type": "combined_normal",
          "start": [
            3,
            2
          ],
          "end": [
            3,
            29
          ],
          "combined": true
        },
        "4,0": {
          "type": "combined_normal",
          "start": [
            3,
            0
          ],
          "end": [
            16,
            1
          ],
          "combined": true
        },
        "4,2": {
          "type": "combined_normal",
          "start": [
            4,
            2
          ],
          "end": [
            7,
            5
          ],
          "combined": true
        },
        "4,6": {
          "type": "combined_normal",
          "start": [
            4,
            6
          ],
          "end": [
            7,
            9
          ],
          "combined": true
        },
        "4,10": {
          "type": "combined_normal",
          "start": [
            4,
            10
          ],
          "end": [
            7,
            13
          ],
          "combined": true
        },
        "4,14": {
          "type": "combined_normal",
          "start": [
            4,
            14
          ],
          "end": [
            7,
            17
          ],
          "combined": true
        },
        "4,18": {
          "type": "combined_normal",
          "start": [
            4,
            18
          ],
          "end": [
            7,
            21
          ],
          "combined": true
        },
        "4,22": {
          "type": "combined_normal",
          "start": [
            4,
            22
          ],
          "end": [
            7,
            25
          ],
          "combined": true
        },
        "4,26": {
          "type": "combined_normal",
          "start": [
            4,
            26
          ],
          "end": [
            7,
            29
          ],
          "combined": true
        },
        "4,30": {
          "type": "combined_normal",
          "start": [
            3,
            30
          ],
          "end": [
            16,
            31
          ],
          "combined": true
        },
        "8,2": {
          "type": "combined_normal",
          "start": [
            8,
            2
          ],
          "end": [
            11,
            5
          ],
          "combined": true
        },
        "8,6": {
          "type": "combined_normal",
          "start": [
            8,
            6
          ],
          "end": [
            11,
            9
          ],
          "combined": true
        },
        "8,10": {
          "type": "combined_normal",
          "start": [
            8,
            10
          ],
          "end": [
            11,
            13
          ],
          "combined": true
        },
        "8,14": {
          "type": "combined_normal",
          "start": [
            8,
            14
          ],
          "end": [
            11,
            17
          ],
          "combined": true
        },
        "8,22": {
          "type": "combined_normal",
          "start": [
            8,
            22
          ],
          "end": [
            11,
            25
          ],
          "combined": true
        },
        "8,26": {
          "type": "combined_normal",
          "start": [
            8,
            26
          ],
          "end": [
            11,
            29
          ],
          "combined": true
        },
        "11,18": {
          "type": "combined_normal",
          "start": [
            8,
            18
          ],
          "end": [
            11,
            21
          ],
          "combined": true
        },
        "12,2": {
          "type": "combined_normal",
          "start": [
            12,
            2
          ],
          "end": [
            15,
            5
          ],
          "combined": true
        },
        "12,6": {
          "type": "combined_normal",
          "start": [
            12,
            6
          ],
          "end": [
            15,
            9
          ],
          "combined": true
        },
        "12,10": {
          "type": "combined_normal",
          "start": [
            12,
            10
          ],
          "end": [
            15,
            13
          ],
          "combined": true
        },
        "12,14": {
          "type": "combined_normal",
          "start": [
            12,
            14
          ],
          "end": [
            15,
            17
          ],
          "combined": true
        },
        "12,18": {
          "type": "combined_normal",
          "start": [
            12,
            18
          ],
          "end": [
            15,
            21
          ],
          "combined": true
        },
        "12,22": {
          "type": "combined_normal",
          "start": [
            12,
            22
          ],
          "end": [
            15,
            25
          ],
          "combined": true
        },
        "12,26": {
          "type": "combined_normal",
          "start": [
            12,
            26
          ],
          "end": [
            15,
            29
          ],
          "combined": true
        },
        "16,2": {
          "type": "combined_normal",
          "start": [
            16,
            2
          ],
          "end": [
            16,
            29
          ],
          "combined": true
        }
      },
      "title": "PROYECTOS",
      "content": {
        "selectMessage": "SELECCIONA TU PROYECTO",
        "backText": "VOLVER",
        "nextText": "SIGUIENTE",
        "pagePrefix": "PÁG",
        "pageOf": "DE"
      }
    };
}

export async function getProyectosDesign() {
    const data = await loadProyectosLayout();
    return data.design;
}

async function loadAllProjects() {
    if (allProjectsCache) return allProjectsCache;
    
    const projectIds = [
        "oandabot",
        "formateadorandrea",
        "meteowatcher"
    ];

    try {
        const projects = [];
        for (const id of projectIds) {
            const data = await loadProjectData(id);
            if (data) {
                projects.push(data);
            }
        }

        allProjectsCache = projects;
        return projects;
    } catch (e) {
        console.error("Error loading project folders:", e);
        return [];
    }
}

async function loadProjectData(projectId) {
    if (proyectosDataCache[projectId]) return proyectosDataCache[projectId];
    try {
        const response = await fetch(new URL(`../data/proyectos/${projectId}/${projectId}.json`, import.meta.url));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        proyectosDataCache[projectId] = data;
        return data;
    } catch (e) {
        console.error(`Error loading project data for ${projectId}:`, e);
        return null;
    }
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

    handleProyectosTextureLeave();

    if (window.location.hash.includes('proyectos')) {
        updateURL('proyectos');
    }
}

function toggleDetailExpand() {
    if (isTransitioningCheck()) {
        return;
    }
    
    if (isExpanding) return;
    if (!isDetailExpanded && (!selectedProjectId || !selectedProjectData)) return;
    
    isExpanding = true;

    loadProyectosLayout().then(layoutData => {
        const savedProjectId = selectedProjectId;
        const savedProjectData = selectedProjectData;
        const savedDetailPage = detailPage;

        const newExpandedState = !isDetailExpanded;
        const designToImport = newExpandedState ? EXPANDED_DESIGN : layoutData.design;

        if (newExpandedState) {
            handleProyectosTextureEnter();
        } else {
            handleProyectosTextureLeave();
        }

        document.querySelectorAll('.proyectos-content, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn').forEach(el => el.remove());
        
        const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
        allCells.forEach(cell => {
            const children = cell.querySelectorAll('.proyectos-content, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn');
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

}

function addExpandButton(cell) {
    const oldBtn = cell.querySelector('.expand-btn');
    if (oldBtn) oldBtn.remove();
    
    const btn = document.createElement('div');
    btn.className = 'expand-btn';
    const textSizes = getTextSizes();
    btn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 12px;
        z-index: 25;
        cursor: pointer;
        pointer-events: auto;
        color: ${CONFIG.COLORS.secondary};
        font-size: ${textSizes.arrows + 22}px;
        transition: all 0.3s ease;
        opacity: 0.8;
        user-select: none;
        font-family: 'Courier New', monospace;
        line-height: 1;
        text-shadow: 0 0 15px rgba(${CONFIG.COLORS.secondaryRGB}, 1),
                     0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.6),
                     0 0 60px rgba(${CONFIG.COLORS.secondaryRGB}, 0.3);
    `;
    
    btn.textContent = isDetailExpanded ? '−' : '+';
    
    btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '1';
        btn.style.transform = 'scale(1.15)';
        btn.style.color = CONFIG.COLORS.primary;
        btn.style.textShadow = `0 0 15px rgba(${CONFIG.COLORS.primaryRGB}, 1),
                                0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.6),
                                0 0 60px rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '0.8';
        btn.style.transform = 'scale(1)';
        btn.style.color = CONFIG.COLORS.secondary;
        btn.style.textShadow = `0 0 15px rgba(${CONFIG.COLORS.secondaryRGB}, 1),
                                0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.6),
                                0 0 60px rgba(${CONFIG.COLORS.secondaryRGB}, 0.3)`;
    });
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleDetailExpand();
    });
    
    cell.appendChild(btn);
}

export async function renderProyectosContent() {
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const layoutData = await loadProyectosLayout();
    const allProjects = await loadAllProjects();
    const container = document.getElementById('grid-container');
    if (!container) return;

    const hashId = window.location.hash ? window.location.hash.replace('#', '').trim() : '';
    
    // If we have a selectedProjectId in memory or a valid project hash (not 'proyectos' or empty)
    if ((hashId && hashId !== 'proyectos') || window.selectedProjectId) {
        const targetId = hashId && hashId !== 'proyectos' ? hashId : window.selectedProjectId;
        if (!selectedProjectId || selectedProjectId !== targetId) {
            await selectProjectById(targetId);
            return;
        }
    } else {
        // Only reset if truly on the main projects catalog view
        selectedProjectId = null;
        selectedProjectData = null;
        isDetailExpanded = false;
        window.selectedProjectId = null;
        handleProyectosTextureEnter();
    }

    // Force texture overlay off while viewing projects
    handleProyectosTextureEnter();

    const lineHeight = getLineHeight();
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    const content = layoutData.content || {};
    
    handleProyectosTextureEnter();
    
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
    
    document.querySelectorAll('.proyectos-content, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-select-message, .expand-btn, .expand-back-btn, .expand-next-btn');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let detailLeftArrow = null;
    let detailRightArrow = null;
    let projectCells = [];
    let detailCell = null;
    let backButtonCell = null;
    let nextProjectCell = null;

   const projectCols = [
        { r: 4, c: 2 }, { r: 4, c: 6 }, { r: 4, c: 10 }, { r: 4, c: 14 }, { r: 4, c: 18 }, { r: 4, c: 22 }, { r: 4, c: 26 },
        { r: 8, c: 2 }, { r: 8, c: 6 }, { r: 8, c: 10 }, { r: 8, c: 14 }, { r: 11, c: 18 }, { r: 8, c: 22 }, { r: 8, c: 26 },
        { r: 12, c: 2 }, { r: 12, c: 6 }, { r: 12, c: 10 }, { r: 12, c: 14 }, { r: 12, c: 18 }, { r: 12, c: 22 }, { r: 12, c: 26 }
    ];
    
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            const key = `${row},${col}`;
            
            if (key === '0,0' && !isDetailExpanded) {
                titleCell = cell;
            }
            else if (!isDetailExpanded && projectCols.some(p => p.r === row && p.c === col)) {
                projectCells.push(cell);
            }
            else if (isDetailExpanded && row === 2 && col === 0) {
                detailLeftArrow = cell;
            }
            else if (isDetailExpanded && row === 2 && col === 30) {
                detailRightArrow = cell;
            }
            else if (!isDetailExpanded && row === 3 && col === 2) {
                detailCell = cell;
                detailCellRef = cell;
            }
            else if (!isDetailExpanded && row === 4 && col === 0) {
                detailLeftArrow = cell;
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

    projectCells = projectCells.filter((cell, index, self) => 
        index === self.findIndex(c => c.dataset.designRow === cell.dataset.designRow && c.dataset.designCol === cell.dataset.designCol)
    );

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
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.title}px;
            letter-spacing: ${letterSpacing.title}px;
            text-transform: uppercase;
            text-shadow: ${LIGHT_TEXT_SHADOW};
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = layoutData.title || 'Proyectos';
        titleCell.appendChild(title);
    }
    
    if (!isDetailExpanded) {
        const totalPages = Math.ceil(allProjects.length / PROJECTS_PER_PAGE);
        const startIndex = currentPage * PROJECTS_PER_PAGE;
        const endIndex = Math.min(startIndex + PROJECTS_PER_PAGE, allProjects.length);
        const pageProjects = allProjects.slice(startIndex, endIndex);

        projectsCache = { allProjects, totalPages, startIndex, endIndex };

        projectCells.forEach((cell, index) => {
            const oldItem = cell.querySelector('.proyectos-item');
            if (oldItem) oldItem.remove();

            const item = document.createElement('div');
            item.className = 'proyectos-item';
            
            if (index < pageProjects.length) {
                cell.style.opacity = '1';
                cell.style.pointerEvents = 'auto';
                const project = pageProjects[index];
                const isSelected = selectedProjectId === project.id;
                
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
                    color: ${isSelected ? secondaryColor : primaryColor};
                    font-family: 'Courier New', monospace;
                    cursor: pointer;
                    pointer-events: auto;
                    z-index: 20;
                    padding: 8px;
                    text-align: center;
                    border: ${isSelected ? '3px' : '0px'} solid ${isSelected ? secondaryColor : primaryColor};
                    border-radius: 4px;
                    transition: all 0.3s ease;
                    background: transparent;
                    text-shadow: ${isSelected ? 'var(--text-shadow-normal)' : 'var(--text-shadow-active)'};
                `;
                
                const icon = document.createElement('span');
                icon.textContent = project.icon || '◆';
                icon.style.cssText = `
                    font-size: ${textSizes.projectIcon}px;
                    margin-bottom: 4px;
                    color: ${isSelected ? secondaryColor : secondaryColor};
                    text-shadow: ${isSelected ? `0 0 30px rgba(${primaryRGB}, 1)` : `0 0 20px rgba(${secondaryRGB}, 1)`};
                    transition: all 0.3s ease;
                `;
                
                const name = document.createElement('span');
                name.textContent = project.name;
                name.style.cssText = `
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    opacity: 1;
                `;
                
                item.appendChild(icon);
                item.appendChild(name);
                
                item.addEventListener('mouseenter', () => {
                    if (!isSelected) {
                        item.style.borderColor = primaryColor;
                        item.style.color = primaryColor;
                        item.style.textShadow = 'var(--text-shadow-hover)';
                        icon.style.color = primaryColor;
                        icon.style.textShadow = `0 0 30px rgba(${primaryRGB}, 0.4)`;
                    }
                });
                
                item.addEventListener('mouseleave', () => {
                    if (!isSelected) {
                        item.style.borderColor = `rgba(${secondaryRGB}, 0.1)`;
                        item.style.color = secondaryColor;
                        item.style.textShadow = 'var(--text-shadow-normal)';
                        icon.style.color = secondaryColor;
                        icon.style.textShadow = `0 0 20px rgba(${secondaryRGB}, 0.2)`;
                    }
                });
                
                item.addEventListener('click', async () => {
                    const fullData = await loadProjectData(project.id);
                    selectedProjectId = project.id;
                    selectedProjectData = fullData || project;
                    detailPage = 0;
                    window.selectedProjectId = project.id;
                    updateURL('proyectos', project.id);
                    toggleDetailExpand();
                });
            } else {
                cell.style.opacity = '0.2';
                cell.style.pointerEvents = 'none';
                item.style.cssText = `
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                `;
            }
            
            cell.appendChild(item);
        });

        const leftArrowCell = document.querySelector('.logo-cell[data-design-row="3"][data-design-col="0"], .grid-cell[data-design-row="3"][data-design-col="0"]');
        const rightArrowCell = document.querySelector('.logo-cell[data-design-row="3"][data-design-col="30"], .grid-cell[data-design-row="3"][data-design-col="30"]');
        
        if (leftArrowCell) {
            const el = document.createElement('div');
            el.className = 'proyectos-nav project-arrow';
            const isActive = currentPage > 0;
            leftArrowCell.style.opacity = isActive ? '1' : '0.2';
            leftArrowCell.style.pointerEvents = isActive ? 'auto' : 'none';
            leftArrowCell.style.borderColor = isActive ? CONFIG.COLORS.primary : `rgba(${secondaryRGB}, 0.1)`;
            leftArrowCell.style.borderStyle = isActive ? 'solid' : 'dashed';
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
                font-size: ${textSizes.arrows}px;
                cursor: ${isActive ? 'pointer' : 'default'};
                pointer-events: ${isActive ? 'auto' : 'none'};
                z-index: 20;
                opacity: ${isActive ? '1' : '0.1'};
                transition: color 0.3s ease, opacity 0.3s ease, text-shadow 0.3s ease;
                background: transparent;
                color: ${CONFIG.COLORS.background};
                -webkit-text-stroke: 2px ${secondaryColor};
                text-stroke: 2px ${secondaryColor};
            `;
            el.textContent = '◀';
            if (isActive) {
                el.style.textShadow = `0 0 10px rgba(${secondaryRGB}, 1), 0 0 20px rgba(${secondaryRGB}, 0.8), 0 0 40px rgba(${secondaryRGB}, 0.4), 0 0 80px rgba(${secondaryRGB}, 0.2)`;
                el.style.animation = 'blinkArrow 1.2s ease-in-out infinite';
                el.addEventListener('click', () => {
                    if (currentPage > 0) {
                        currentPage--;
                        renderProyectosContent();
                    }
                });
            } else {
                el.style.opacity = '0.1';
            }
            leftArrowCell.appendChild(el);
        }
        
        if (rightArrowCell) {
            const el = document.createElement('div');
            el.className = 'proyectos-nav project-arrow';
            const isActive = currentPage < totalPages - 1;
            rightArrowCell.style.opacity = isActive ? '1' : '0.2';
            rightArrowCell.style.pointerEvents = isActive ? 'auto' : 'none';
            rightArrowCell.style.borderColor = isActive ? CONFIG.COLORS.primary : `rgba(${secondaryRGB}, 0.1)`;
            rightArrowCell.style.borderStyle = isActive ? 'solid' : 'dashed';
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
                font-size: ${textSizes.arrows}px;
                cursor: ${isActive ? 'pointer' : 'default'};
                pointer-events: ${isActive ? 'auto' : 'none'};
                z-index: 20;
                opacity: ${isActive ? '1' : '0.1'};
                transition: color 0.3s ease, opacity 0.3s ease, text-shadow 0.3s ease;
                background: transparent;
                color: ${CONFIG.COLORS.background};
                -webkit-text-stroke: 2px ${secondaryColor};
                text-stroke: 2px ${secondaryColor};
            `;
            el.textContent = '▶';
            if (isActive) {
                el.style.textShadow = `0 0 10px rgba(${secondaryRGB}, 1), 0 0 20px rgba(${secondaryRGB}, 0.8), 0 0 40px rgba(${secondaryRGB}, 0.4), 0 0 80px rgba(${secondaryRGB}, 0.2)`;
                el.style.animation = 'blinkArrow 1.2s ease-in-out infinite';
                el.addEventListener('click', () => {
                    if (currentPage < totalPages - 1) {
                        currentPage++;
                        renderProyectosContent();
                    }
                });
            } else {
                el.style.opacity = '0.1';
            }
            rightArrowCell.appendChild(el);
        }
    }
    
    if (detailCell && isDetailExpanded) {
        if (selectedProjectId && selectedProjectData) {
            showProjectDetail(selectedProjectData, detailCell, textSizes, letterSpacing, getLineHeight(), content);
        }
        updateExpandButton(detailCell);
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
            font-size: ${textSizes.arrows}px;
            cursor: ${arrow.isActive ? 'pointer' : 'default'};
            pointer-events: ${arrow.isActive ? 'auto' : 'none'};
            z-index: 20;
            opacity: ${arrow.isActive ? '1' : '0.2'};
            transition: color 0.3s ease, opacity 0.3s ease, text-shadow 0.3s ease;
            background: transparent;
        `;
        el.textContent = arrow.direction;
        
        if (arrow.isActive) {
            el.style.color = secondaryColor;
            el.style.textShadow = `
                0 0 10px rgba(${secondaryRGB}, 1),
                0 0 20px rgba(${secondaryRGB}, 0.8),
                0 0 40px rgba(${secondaryRGB}, 0.4),
                0 0 80px rgba(${secondaryRGB}, 0.2)
            `;
            el.style.animation = 'blinkArrow 1.2s ease-in-out infinite';
            el.addEventListener('click', (e) => {
                e.stopPropagation();
                arrow.onClick();
            });
        } else {
            el.style.color = secondaryColor;
            el.style.textShadow = 'var(--text-shadow-normal)';
            el.style.opacity = '0.2';
        }
        
        arrow.cell.appendChild(el);
    });

    if (isDetailExpanded) {
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
                color: ${secondaryColor};
                transition: all 0.3s ease;
                gap: 4px;
            `;
            
            const arrowIcon = document.createElement('span');
            arrowIcon.textContent = '◀';
            arrowIcon.style.cssText = `
                font-size: ${textSizes.arrows}px;
                text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.3);
                transition: all 0.3s ease;
            `;
            backBtn.appendChild(arrowIcon);
            
            const backText = document.createElement('span');
            backText.textContent = content.backText;
            backText.style.cssText = `
                font-size: ${textSizes.small}px;
                letter-spacing: ${letterSpacing.small}px;
                opacity: 1;
                transition: all 0.3s ease;
                text-align: center;
                white-space: nowrap;
                width: 100%;
            `;
            backBtn.appendChild(backText);
            
            backBtn.addEventListener('mouseenter', () => {
                backBtn.style.color = primaryColor;
                arrowIcon.style.textShadow = `0 0 30px rgba(${primaryRGB}, 0.4)`;
                backText.style.opacity = '1';
            });
            
            backBtn.addEventListener('mouseleave', () => {
                backBtn.style.color = secondaryColor;
                arrowIcon.style.textShadow = `0 0 20px rgba(${secondaryRGB}, 0.3)`;
                backText.style.opacity = '1';
            });
            
            backBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                selectedProjectId = null;
                selectedProjectData = null;
                detailPage = 0;
                window.selectedProjectId = null;
                updateURL('proyectos');
                if (isDetailExpanded) {
                    toggleDetailExpand();
                }
            });
            
            backButtonCell.appendChild(backBtn);
        }
        
        const nextProjectCell = document.querySelector('.grid-cell[data-design-row="0"][data-design-col="30"]');
        if (nextProjectCell && nextProject) {
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
                color: ${secondaryColor};
                transition: all 0.3s ease;
                gap: 4px;
            `;
            
            const arrowIcon = document.createElement('span');
            arrowIcon.textContent = '▶';
            arrowIcon.style.cssText = `
                font-size: ${textSizes.arrows}px;
                text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.3);
                transition: all 0.3s ease;
            `;
            nextBtn.appendChild(arrowIcon);
            
            const nextText = document.createElement('span');
            nextText.textContent = content.nextText;
            nextText.style.cssText = `
                font-size: ${textSizes.small}px;
                letter-spacing: ${letterSpacing.small}px;
                opacity: 1;
                transition: all 0.3s ease;
                text-align: center;
                white-space: nowrap;
                width: 100%;
            `;
            nextBtn.appendChild(nextText);
            
            nextBtn.addEventListener('mouseenter', () => {
                nextBtn.style.color = primaryColor;
                arrowIcon.style.textShadow = `0 0 30px rgba(${primaryRGB}, 0.4)`;
                nextText.style.opacity = '1';
            });
            
            nextBtn.addEventListener('mouseleave', () => {
                nextBtn.style.color = secondaryColor;
                arrowIcon.style.textShadow = `0 0 20px rgba(${secondaryRGB}, 0.3)`;
                nextText.style.opacity = '1';
            });
            
            nextBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                if (nextProject) {
                    const fullData = await loadProjectData(nextProject.id);
                    selectedProjectId = nextProject.id;
                    selectedProjectData = fullData || nextProject;
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

function showProjectDetail(project, detailCell, textSizes, letterSpacing, lineHeight, content) {
    if (!detailCell) return;
    
    const hasPages = project.pages && project.pages.length > 0;
    const currentPageData = hasPages ? project.pages[detailPage] : null;
    totalDetailPages = hasPages ? project.pages.length : 0;
    
    const isExpanded = isDetailExpanded;
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const detail = document.createElement('div');
    detail.className = 'proyectos-detail';
    detail.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: ${isExpanded ? '30px 40px' : '20px 30px'};
        color: ${secondaryColor};
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
        pageIndicator2.textContent = `${content.pagePrefix} ${detailPage + 1} ${content.pageOf} ${project.pages.length}`;
        pageIndicator2.style.cssText = `
            font-size: ${content.pageIndicatorExpandedSize || 20}px;
            letter-spacing: ${letterSpacing.subTitle}px;
            color: ${primaryColor};
            opacity: 1;
            margin-top: 6px;
            text-transform: uppercase;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(pageIndicator2);
    }
    
    const icon = document.createElement('div');
    icon.textContent = project.icon || '◆';
    icon.style.cssText = `
        font-size: ${isExpanded ? textSizes.title : textSizes.arrows}px;
        color: ${secondaryColor};
        text-shadow: 0 0 40px rgba(${secondaryRGB}, 0.3);
        text-align: center;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(icon);
    
    const meta = document.createElement('div');
    meta.style.cssText = `
        font-size: ${isExpanded ? textSizes.medium : textSizes.small}px;
        letter-spacing: ${letterSpacing.medium}px;
        opacity: 1;
        text-align: center;
        line-height: ${lineHeight.small};
        flex-shrink: 0;
    `;
    meta.textContent = `${project.category || ''}${project.category && project.type ? '  ·  ' : ''}${project.type || ''}${(project.category || project.type) && project.year ? '  ·  ' : ''}${project.year || ''}`;
    contentWrapper.appendChild(meta);
    
    const name = document.createElement('div');
    name.textContent = project.name;
    name.style.cssText = `
        font-size: ${isExpanded ? textSizes.title : textSizes.normalTitle}px;
        letter-spacing: ${isExpanded ? letterSpacing.title : letterSpacing.subTitle}px;
        font-weight: bold;
        text-shadow: 0 0 30px rgba(${secondaryRGB}, 0.2);
        color: ${primaryColor};
        text-align: center;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(name);
    
    const desc = document.createElement('div');
    desc.textContent = project.description || '';
    desc.style.cssText = `
        font-size: ${isExpanded ? textSizes.medium : textSizes.small}px;
        letter-spacing: ${letterSpacing.medium}px;
        line-height: ${lineHeight.medium};
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
        background: rgba(${primaryRGB}, 0.2);
        margin: 4px 0;
        flex-shrink: 0;
    `;
    contentWrapper.appendChild(separator);
    
    if (hasPages && currentPageData) {
        const pageTitle = document.createElement('div');
        pageTitle.textContent = currentPageData.title || '';
        pageTitle.style.cssText = `
            font-size: ${isExpanded ? textSizes.subTitle : textSizes.medium}px;
            letter-spacing: ${letterSpacing.subTitle}px;
            font-weight: bold;
            color: ${primaryColor};
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
                const element = renderContentItem(item, project.id, isExpanded, textSizes, letterSpacing, lineHeight);
                if (element) {
                    contentContainer.appendChild(element);
                }
            });
        } else if (typeof currentPageData.content === 'string') {
            const textEl = document.createElement('div');
            textEl.textContent = currentPageData.content;
            textEl.style.cssText = `
                font-size: ${isExpanded ? textSizes.medium : textSizes.small}px;
                letter-spacing: ${letterSpacing.medium}px;
                color: ${primaryColor};
                line-height: ${lineHeight.medium};
                opacity: 1;
                text-align: center;
            `;
            contentContainer.appendChild(textEl);
        }
        
        contentWrapper.appendChild(contentContainer);
        
        const pageIndicator = document.createElement('div');
        pageIndicator.textContent = `${content.pagePrefix} ${detailPage + 1} ${content.pageOf} ${project.pages.length}`;
        pageIndicator.style.cssText = `
            font-size: ${content.pageIndicatorNormalSize || 11}px;
            letter-spacing: ${letterSpacing.small}px;
            color: ${primaryColor};
            opacity: 1;
            margin-top: 6px;
            text-transform: uppercase;
            flex-shrink: 0;
        `;
        contentWrapper.appendChild(pageIndicator);
    } else {
        const details = document.createElement('div');
        details.textContent = project.details || '';
        details.style.cssText = `   
            font-size: ${isExpanded ? textSizes.medium : textSizes.small}px;
            letter-spacing: ${letterSpacing.medium}px;
            line-height: ${lineHeight.medium};
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

function resolveAssetPath(projectId, filename) {
    if (!filename) return '';
    if (filename.startsWith('http://') || filename.startsWith('https://') || filename.startsWith('/')) {
        return filename;
    }
    return new URL(`../data/proyectos/${projectId}/${filename}`, import.meta.url).href;
}

function renderContentItem(item, projectId, isExpanded, textSizes, letterSpacing, lineHeight) {
    const container = document.createElement('div');
    container.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        width: ${item.width || '100%'};
        align-items: ${item.align === 'left' ? 'flex-start' : item.align === 'right' ? 'flex-end' : 'center'};
        text-align: ${item.align || 'center'};
        margin: ${item.align === 'center' ? '0 auto' : item.align === 'right' ? '0 0 0 auto' : '0'};
    `;
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    switch (item.type) {
        case 'row':
            const rowWrap = document.createElement('div');
            rowWrap.style.cssText = `
                display: flex;
                flex-direction: ${item.direction || 'row'};
                gap: ${item.gap || '16px'};
                width: ${item.width || '100%'};
                align-items: ${item.align || 'center'};
                justify-content: ${item.justify || 'space-between'};
                flex-wrap: ${item.wrap || 'nowrap'};
            `;
            if (Array.isArray(item.children)) {
                item.children.forEach(childItem => {
                    const childEl = renderContentItem(childItem, projectId, isExpanded, textSizes, letterSpacing, lineHeight);
                    if (childEl) {
                        childEl.style.flex = childItem.flex || '1';
                        childEl.style.width = childItem.width || 'auto';
                        rowWrap.appendChild(childEl);
                    }
                });
            }
            container.appendChild(rowWrap);
            break;

        case 'text':
            const textEl = document.createElement('div');
            textEl.textContent = item.value || '';
            textEl.style.cssText = `
                font-size: ${item.size === 'large' ? textSizes.subTitle : item.size === 'small' ? textSizes.small : (isExpanded ? textSizes.medium : textSizes.small)}px;
                letter-spacing: ${letterSpacing.medium}px;
                line-height: ${lineHeight.medium};
                opacity: 1;
                text-align: ${item.align || 'center'};
                width: 100%;
            `;
            container.appendChild(textEl);
            break;
            
        case 'link':
            const linkEl = document.createElement('a');
            linkEl.href = item.value || '#';
            linkEl.textContent = item.label || item.value || '';
            linkEl.target = '_blank';
            linkEl.style.cssText = `
                color: ${secondaryColor};
                font-size: ${isExpanded ? textSizes.medium : textSizes.small}px;
                letter-spacing: ${letterSpacing.medium}px;
                text-decoration: none;
                border-bottom: 1px solid rgba(${secondaryRGB}, 0.3);
                padding: 2px 0;
                transition: all 0.3s ease;
                display: inline-block;
                width: fit-content;
                cursor: pointer;
                pointer-events: auto;
            `;
            linkEl.addEventListener('mouseenter', () => {
                linkEl.style.borderBottomColor = primaryColor;
                linkEl.style.color = primaryColor;
            });
            linkEl.addEventListener('mouseleave', () => {
                linkEl.style.borderBottomColor = `rgba(${secondaryRGB}, 0.3)`;
                linkEl.style.color = secondaryColor;
            });
            container.appendChild(linkEl);
            break;
            
        case 'image':
            const imgWrap = document.createElement('div');
            imgWrap.style.cssText = `
                width: ${item.width || '100%'};
                max-width: 100%;
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid rgba(${secondaryRGB}, 0.1);
                cursor: pointer;
                pointer-events: auto;
                aspect-ratio: ${item.aspectRatio || 'auto'};
                height: ${item.height || 'auto'};
            `;
            
            const resolvedImgSrc = resolveAssetPath(projectId, item.value);
            const imgEl = document.createElement('img');
            imgEl.src = resolvedImgSrc;
            imgEl.alt = item.caption || '';
            imgEl.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: ${item.objectFit || 'cover'};
                display: block;
            `;
            imgWrap.appendChild(imgEl);
            
            imgWrap.addEventListener('click', () => {
                showImageLightbox(resolvedImgSrc);
            });
            
            container.appendChild(imgWrap);
            
            if (item.caption) {
                const captionEl = document.createElement('div');
                captionEl.textContent = item.caption;
                captionEl.style.cssText = `
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    opacity: 1;
                    color: ${primaryColor};
                    text-align: center;
                    margin-top: 2px;
                    width: 100%;
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
                    const resolvedSrc = resolveAssetPath(projectId, imgSrc);
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = `
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(${secondaryRGB}, 0.1);
                        aspect-ratio: 1;
                        cursor: pointer;
                        transition: all 0.3s ease;
                        pointer-events: auto;
                    `;
                    
                    const thumb = document.createElement('img');
                    thumb.src = resolvedSrc;
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
                        imgContainer.style.borderColor = primaryColor;
                    });
                    imgContainer.addEventListener('mouseleave', () => {
                        thumb.style.transform = 'scale(1)';
                        imgContainer.style.borderColor = `rgba(${secondaryRGB}, 0.1)`;
                    });
                    
                    imgContainer.addEventListener('click', () => {
                        showImageLightbox(resolvedSrc);
                    });
                    
                    galleryWrap.appendChild(imgContainer);
                });
            }
            container.appendChild(galleryWrap);
            break;
            
        case 'video':
            const videoWrap = document.createElement('div');
            videoWrap.style.cssText = `
                width: ${item.width || '100%'};
                border-radius: 4px;
                overflow: hidden;
                border: 1px solid rgba(${secondaryRGB}, 0.1);
                background: #000;
            `;
            
            const videoEl = document.createElement('video');
            videoEl.src = resolveAssetPath(projectId, item.value);
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
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    opacity: 1;
                    text-align: center;
                    margin-top: 2px;
                    width: 100%;
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
    const allProjects = await loadAllProjects();
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
        const fullData = await loadProjectData(projectId);
        selectedProjectId = project.id;
        selectedProjectData = fullData || project;
        detailPage = 0;
        window.selectedProjectId = project.id;
        
        isDetailExpanded = true;
        if (typeof handleProyectosTextureEnter === 'function') {
            handleProyectosTextureEnter();
        }
        
        // Lock URL hash immediately on initial load
        let url = window.location.pathname.split('#')[0];
        window.history.replaceState({}, '', `${url}#${project.id}`);
        
        importDesignFromJSON(EXPANDED_DESIGN, () => {
            renderProyectosContent();
        }, false);
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
        border: 1px solid rgba(var(--color-secondary-rgb), 0.2);
        box-shadow: 0 0 60px rgba(var(--color-secondary-rgb), 0.1);
    `;
    
    lightbox.appendChild(img);
    
    lightbox.addEventListener('click', () => {
        lightbox.remove();
    });
    
    document.body.appendChild(lightbox);
}