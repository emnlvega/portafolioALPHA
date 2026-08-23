import { CONFIG, LOGO_DESIGN, updateColors, getCurrentColors, createColors, getResponsiveConfig } from './modules/config.js';
import { createGrid, repositionGrid, repositionSidebarOverlay, repositionSidebarTexts, repositionCombinedCells, getCellPosition } from './modules/grid.js';
import { resetGrid, exportDesignToJSON, designCells, setupCellEvents, toggleCellOff, cleanInicioContent } from './modules/interactions.js';
import { importDesignFromJSON } from './modules/logo.js';
import { animateSidebar, returnToMainLogo, isSpecialPageActiveCheck, handleSidebarAction, isTransitioningCheck } from './modules/sidebar/index.js';
import { startRandomAnimations, stopRandomAnimations, restartRandomAnimations } from './modules/animations.js';
import { toggleArchitectMode, updateArchitectOverlay, isArchitectModeActive } from './modules/architect.js';
import { initOverlays, pauseOverlays, resumeOverlays, setOverlayOpacity, setOverlayBlendMode, destroyOverlays, setOverlayRandomOrder } from './modules/overlay.js';
import { initSettings, toggleSettings, closeSettings } from './modules/settings.js';
import { showDialog, showImportDialog } from './modules/dialogs.js';
import { handleURLOnLoad, updateURL } from './modules/sidebar/index.js';
import { setHashLoad } from './modules/logo.js';
import { loadSobreMiData } from './modules/sidebar/pages/sobre-mi.js';
import { loadContactoData } from './modules/sidebar/pages/contacto.js';
import { isMobile, getDeviceType } from './modules/mobile.js';
import { MOBILE_CONFIG } from './modules/mobile/mobile-config.js';
import { renderMobileHome } from './modules/mobile/mobile-home.js';
import { navigateMobileTo } from './modules/mobile/mobile-nav.js';
import { getCurrentMobilePage } from './modules/mobile/mobile-nav.js';
import { startLogoAnimation, stopLogoAnimation, enableLogoAnimation, disableLogoAnimation, startFlickerOnInicio, setOnInicio, stopFlickerOnInicio } from './modules/emnlvega.js';
import { initSimpleMode } from './modules/simpleMode.js';

let dicc = null;
let gridData = null;
let isLogoAnimationRunning = false;
let isInicioContentClickable = false;
let isInitialized = false;
let proyectosData = null;

async function loadDicc() {
    if (dicc) return dicc;
    try {
        const response = await fetch('./modules/dicc.json');
        dicc = await response.json();
        return dicc;
    } catch (e) {
        console.error('Error loading dicc:', e);
        return null;
    }
}

function getTextSizes() {
    return CONFIG.TEXT_SIZES;
}

function getLetterSpacing() {
    return CONFIG.LETTER_SPACING;
}

function getLineHeight() {
    return CONFIG.LINE_HEIGHT;
}

window.stopFlickerOnInicio = stopFlickerOnInicio;

window.setInicioClickable = function(value) {
    isInicioContentClickable = value;
    if (value) {
        enableInicioClicks();
    } else {
        disableInicioClicks();
    }
};

function blockSidebarInteraction() {
    const sidebarItems = document.querySelectorAll('.sidebar-text, .sidebar-cell');
    sidebarItems.forEach(item => {
        item.style.pointerEvents = 'none';
    });
}

function unblockSidebarInteraction() {
    const sidebarItems = document.querySelectorAll('.sidebar-text, .sidebar-cell');
    sidebarItems.forEach(item => {
        item.style.pointerEvents = '';
    });
}

window.unblockSidebarInteraction = unblockSidebarInteraction;

async function loadProyectosData() {
    if (proyectosData) return proyectosData;
    try {
        const response = await fetch('./modules/sidebar/data/proyectos.json');
        proyectosData = await response.json();
        return proyectosData;
    } catch (e) {
        console.error('Error loading proyectos data:', e);
        return null;
    }
}

function renderBienvenido() {
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const primaryColor = CONFIG.COLORS.primary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    
    const titleCell = Array.from(document.querySelectorAll('.grid-cell, .logo-cell')).find(c => 
        c.dataset.combined === 'true' && 
        parseInt(c.dataset.designRow) === 0 && 
        parseInt(c.dataset.designCol) === 0
    );
    
    if (!titleCell) return;
    
    const bienvenido = document.createElement('div');
    bienvenido.className = 'inicio-bienvenido';
    bienvenido.style.cssText = `
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
        font-size: ${textSizes.subTitle + 12}px;
        letter-spacing: ${letterSpacing.title + 3}px;
        text-transform: uppercase;
        text-shadow: 0 0 10px ${primaryColor},
                     0 0 30px rgba(${primaryRGB}, 0.5),
                     0 0 60px rgba(${primaryRGB}, 0.3);
        pointer-events: none;
        z-index: 20;
        user-select: none;
    `;
    bienvenido.textContent = dicc.script.bienvenido;
    titleCell.appendChild(bienvenido);
}

async function renderProyectosInicio() {
    const data = await loadProyectosData();
    if (!data || !data.projects || data.projects.length === 0) return;
    
    const textSizes = getTextSizes();
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const projectCells = [
        { row: 14, col: 0 },
        { row: 14, col: 6 },
        { row: 14, col: 12 },
        { row: 14, col: 18 },
        { row: 14, col: 24 }
    ];
    
    const shuffled = [...data.projects].sort(() => Math.random() - 0.5).slice(0, 5);
    
    projectCells.forEach((pos, index) => {
        if (index >= shuffled.length) return;
        const project = shuffled[index];
        
        const cell = Array.from(document.querySelectorAll('.grid-cell, .logo-cell')).find(c => 
            c.dataset.combined === 'true' && 
            parseInt(c.dataset.designRow) === pos.row && 
            parseInt(c.dataset.designCol) === pos.col
        );
        
        if (!cell) return;
        
        const wrapper = document.createElement('div');
        wrapper.className = 'inicio-proyecto';
        wrapper.dataset.projectId = project.id;
        wrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            cursor: pointer;
            z-index: 20;
            overflow: hidden;
            transition: all 0.3s ease;
            font-family: 'Courier New', monospace;
        `;
        
        if (!isInicioContentClickable) {
            wrapper.style.pointerEvents = 'none';
            wrapper.style.cursor = 'default';
        }
        
        const bgImg = document.createElement('img');
        bgImg.src = `https://picsum.photos/seed/${project.name.replace(/\s/g, '')}/600/400`;
        bgImg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.4;
            filter: grayscale(1);
            transition: all 0.3s ease;
        `;
        wrapper.appendChild(bgImg);
        
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${primaryColor};
            mix-blend-mode: color;
            opacity: 0.3;
            transition: all 0.3s ease;
        `;
        wrapper.appendChild(overlay);
        
        const title = document.createElement('div');
        title.style.cssText = `
            position: relative;
            z-index: 2;
            color: ${secondaryColor};
            font-size: ${textSizes.subTitle + 2}px;
            letter-spacing: ${textSizes.small + 1}px;
            font-weight: bold;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
            text-align: center;
            padding: 10px;
            border-radius: 4px;
            pointer-events: none;
        `;
        title.textContent = project.name;
        wrapper.appendChild(title);
        
        wrapper.addEventListener('mouseenter', () => {
            wrapper.style.boxShadow = `0 0 30px rgba(${primaryRGB}, 0.3)`;
            bgImg.style.opacity = '0.6';
            bgImg.style.transform = 'scale(1.05)';
            title.style.textShadow = `0 0 30px rgba(255, 255, 255, 1)`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.boxShadow = 'none';
            bgImg.style.opacity = '0.4';
            bgImg.style.transform = 'scale(1)';
            title.style.textShadow = `0 0 20px rgba(255, 255, 255, 0.8)`;
        });
        
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (!isInicioContentClickable) return;
            
            removeInicioContent();
            
            disableLogoAnimation();
            stopLogoAnimation();
            setOnInicio(false);
            setHashLoad(false);
            
            window.selectedProjectId = project.id;
            
            const sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
                const toggle = document.querySelector('.sidebar-toggle');
                if (toggle) {
                    toggle.classList.add('active');
                }
            }
            
            if (gridData) {
                const existingOverlay = document.querySelector('.sidebar-overlay');
                if (!existingOverlay) {
                    animateSidebar(
                        gridData.sidebarCells,
                        gridData.rows,
                        gridData.cellSize,
                        gridData.offsetX || 0,
                        gridData.offsetY || 0
                    );
                }
            }
            
            handleSidebarAction('proyectos');
            
            const url = `index.html#${project.id}`;
            window.history.pushState({}, '', url);
        });
        
        wrapper.addEventListener('auxclick', (e) => {
            if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                window.open(`index.html#${project.id}`, '_blank');
            }
        });
        
        wrapper.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const parentCell = this.closest('.grid-cell, .logo-cell');
            if (parentCell && !parentCell.dataset.isSidebar) {
                toggleCellOff(parentCell);
            }
            return false;
        });
        
        cell.appendChild(wrapper);
    });
    
    const verMasCell = Array.from(document.querySelectorAll('.grid-cell, .logo-cell')).find(c => 
        c.dataset.combined === 'true' && 
        parseInt(c.dataset.designRow) === 14 && 
        parseInt(c.dataset.designCol) === 30
    );
    
    if (verMasCell) {
        const verMas = document.createElement('div');
        verMas.className = 'inicio-vermas';
        verMas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: auto;
            cursor: pointer;
            z-index: 20;
            color: ${primaryColor};
            transition: all 0.3s ease;
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.arrows + 20}px;
            text-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
        `;
        
        const verMasText = dicc.script.verMas;
        verMas.textContent = verMasText;
        
        if (!isInicioContentClickable) {
            verMas.style.pointerEvents = 'none';
            verMas.style.cursor = 'default';
        }
        
        verMas.addEventListener('mouseenter', () => {
            verMas.style.color = secondaryColor;
            verMas.style.textShadow = `0 0 30px rgba(255, 255, 255, 1)`;
            verMas.style.transform = 'scale(1.2)';
        });
        
        verMas.addEventListener('mouseleave', () => {
            verMas.style.color = secondaryColor;
            verMas.style.textShadow = `0 0 20px rgba(255, 255, 255, 0.8)`;
            verMas.style.transform = 'scale(1)';
        });
        
        verMas.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            if (!isInicioContentClickable) return;
            
            removeInicioContent();
            
            disableLogoAnimation();
            stopLogoAnimation();
            setOnInicio(false);
            setHashLoad(false);
            
            const sidebar = document.getElementById('sidebar');
            if (sidebar && !sidebar.classList.contains('active')) {
                sidebar.classList.add('active');
                const toggle = document.querySelector('.sidebar-toggle');
                if (toggle) {
                    toggle.classList.add('active');
                }
            }
            
            if (gridData) {
                const existingOverlay = document.querySelector('.sidebar-overlay');
                if (!existingOverlay) {
                    animateSidebar(
                        gridData.sidebarCells,
                        gridData.rows,
                        gridData.cellSize,
                        gridData.offsetX || 0,
                        gridData.offsetY || 0
                    );
                }
            }
            
            handleSidebarAction('proyectos');
            
            window.history.pushState({}, '', 'index.html#proyectos');
        });
        
        verMas.addEventListener('auxclick', (e) => {
            if (e.button === 1) {
                e.preventDefault();
                e.stopPropagation();
                window.open('index.html#proyectos', '_blank');
            }
        });
        
        verMas.addEventListener('contextmenu', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const parentCell = this.closest('.grid-cell, .logo-cell');
            if (parentCell && !parentCell.dataset.isSidebar) {
                toggleCellOff(parentCell);
            }
            return false;
        });
        
        verMasCell.appendChild(verMas);
    }
}

function removeInicioContent() {
    isInicioContentClickable = false;
    
    const allSelectors = [
        '.inicio-bienvenido', '.inicio-proyecto', '.inicio-vermas',
        '.proyectos-content', '.proyectos-category', '.proyectos-item', 
        '.proyectos-detail', '.proyectos-nav', '.proyectos-filter', 
        '.proyectos-select-message', '.sobre-mi-content', '.contacto-content',
        '.expand-btn', '.expand-back-btn', '.expand-next-btn'
    ];
    
    document.querySelectorAll(allSelectors.join(',')).forEach(el => el.remove());
    
    document.querySelectorAll('.grid-cell, .logo-cell').forEach(cell => {
        const childNodes = Array.from(cell.childNodes);
        childNodes.forEach(node => {
            if (node.nodeType === 1) {
                const el = node;
                if (el.classList) {
                    const hasContent = allSelectors.some(selector => 
                        el.matches && el.matches(selector)
                    );
                    if (hasContent) {
                        el.remove();
                    }
                }
            }
        });
        
        cell.style.pointerEvents = '';
        cell.style.cursor = '';
        cell.style.boxShadow = 'none';
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.background;
    });
}

window.removeInicioContent = removeInicioContent;

function renderInicioContent() {
    removeInicioContent();

    setTimeout(() => {
        renderBienvenido();
        renderProyectosInicio();

        if (isInicioContentClickable) {
            enableInicioClicks();
        } else {
            disableInicioClicks();
        }
    }, 50);
}

document.addEventListener('renderInicioContent', function() {
    setTimeout(() => {
        renderInicioContent();
    }, 50);
});

function loadSpecialPage(page, projectId = null) {
    removeInicioContent();
    
    disableLogoAnimation();
    stopLogoAnimation();
    setOnInicio(false);
    setHashLoad(false);
    
    if (gridData) {
        animateSidebar(
            gridData.sidebarCells,
            gridData.rows,
            gridData.cellSize,
            gridData.offsetX || 0,
            gridData.offsetY || 0
        );
    }
    
    if (page === 'proyectos') {
        if (projectId) {
            window.selectedProjectId = projectId;
        }
        
        if (isMobile()) {
            import('./modules/mobile/mobile-nav.js').then(module => {
                if (projectId) {
                    setTimeout(() => {
                        module.openProyectoDetalle(projectId);
                    }, 500);
                } else {
                    module.navigateMobileTo('proyectos');
                }
            });
            return;
        }
        
        handleSidebarAction('proyectos');
        
        if (projectId) {
            setTimeout(() => {
                import('./modules/sidebar/pages/proyectos.js').then(module => {
                    if (module.selectProjectById) {
                        module.selectProjectById(projectId);
                    }
                }).catch(err => {
                    console.error('Error loading proyectos module:', err);
                });
            }, 300);
        }
    } else if (page === 'sobre-mi') {
        if (isMobile()) {
            import('./modules/mobile/mobile-nav.js').then(module => {
                module.navigateMobileTo('sobre-mi');
            });
            return;
        }
        handleSidebarAction('sobre-mi');
    } else if (page === 'contacto') {
        if (isMobile()) {
            import('./modules/mobile/mobile-nav.js').then(module => {
                module.navigateMobileTo('contacto');
            });
            return;
        }
        handleSidebarAction('contacto');
    }
}

function enableInicioClicks() {
    document.querySelectorAll('.inicio-proyecto, .inicio-vermas').forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.cursor = 'pointer';
        el.style.zIndex = '20';
    });
}

function disableInicioClicks() {
    document.querySelectorAll('.inicio-proyecto, .inicio-vermas').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'default';
    });
}

function loadInicio(instant = false) {
    removeInicioContent();
    stopLogoAnimation();
    setHashLoad(false);
    setOnInicio(true);
    
    const pageSelectors = [
        '.proyectos-content', '.proyectos-category', '.proyectos-item', 
        '.proyectos-detail', '.proyectos-nav', '.proyectos-filter', 
        '.proyectos-select-message', '.sobre-mi-content', '.contacto-content',
        '.expand-btn'
    ];
    document.querySelectorAll(pageSelectors.join(',')).forEach(el => el.remove());
    
    document.querySelectorAll('.grid-cell, .logo-cell').forEach(cell => {
        const children = Array.from(cell.children);
        children.forEach(child => {
            const hasPageContent = pageSelectors.some(selector => 
                child.matches && child.matches(selector)
            );
            if (hasPageContent) {
                child.remove();
            }
        });
        
        cell.style.pointerEvents = '';
        cell.style.cursor = '';
        cell.style.boxShadow = 'none';
        cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
        cell.style.backgroundColor = CONFIG.COLORS.background;
    });
    
    const existingImage = document.getElementById('letters-animation-image');
    if (existingImage) {
        existingImage.remove();
    }
    
    if (instant) {
        enableLogoAnimation();
        isLogoAnimationRunning = true;
        blockSidebarInteraction();
        startLogoAnimation(() => {
            isLogoAnimationRunning = false;
            unblockSidebarInteraction();
            isInicioContentClickable = true;
            enableInicioClicks();
        }, true);
    } else {
        enableLogoAnimation();
        isLogoAnimationRunning = true;
        blockSidebarInteraction();
        startLogoAnimation(() => {
            isLogoAnimationRunning = false;
            unblockSidebarInteraction();
            isInicioContentClickable = true;
            enableInicioClicks();
        }, false);
    }
    
    if (gridData) {
        const existingOverlay = document.querySelector('.sidebar-overlay');
        if (!existingOverlay) {
            setTimeout(() => {
                animateSidebar(
                    gridData.sidebarCells,
                gridData.rows,
                gridData.cellSize,
                gridData.offsetX || 0,
                gridData.offsetY || 0
                );
            }, 2700);
        }
    }
    
    setTimeout(() => {
        renderInicioContent();
    }, 100);
    
    setTimeout(() => {
        startRandomAnimations();
    }, 500);
}

document.addEventListener('loadInicioInstant', function() {
    removeInicioContent();
    stopLogoAnimation();
    
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content').forEach(el => el.remove());
    
    document.querySelectorAll('.grid-cell, .logo-cell').forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content');
        children.forEach(child => child.remove());
    });
    
    loadInicio(true);
});


document.addEventListener('keydown', (e) => {
    if (isMobile()) return;
    
    
    if ((e.key === 'e' || e.key === 'E') && document.body.classList.contains('mobile-simulator')) {
        const target = e.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            return;
        }
        e.preventDefault();
        if (window.exportMobileDesign) {
            window.exportMobileDesign();
        }
    }
});

function applyMobileConfig() {
    if (isMobile()) {
        const grid = MOBILE_CONFIG.GRID || MOBILE_CONFIG;
        
        CONFIG.CELL_SIZE = grid.CELL_SIZE;
        CONFIG.GAP = grid.GAP;
        CONFIG.COLS = grid.COLS;
        CONFIG.ROWS = grid.ROWS;
        CONFIG.SIDEBAR_WIDTH = grid.SIDEBAR_WIDTH;
        CONFIG.BORDER_RADIUS = grid.BORDER_RADIUS;
        
        CONFIG.ANIMATIONS.SCALE.ENABLED = false;
        CONFIG.ANIMATIONS.COLOR.ENABLED = false;
        CONFIG.ANIMATIONS.GLOW.ENABLED = false;
        CONFIG.ANIMATIONS.ROTATE.ENABLED = false;
        CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED = false;
        CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED = true;
        
        CONFIG.ANIMATIONS.OPACITY_WAVE.DURATION = 2000;
        CONFIG.ANIMATIONS.OPACITY_WAVE.MIN_INTERVAL = 100;
        CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_INTERVAL = 100;
        CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_SIMULTANEOUS = 8;
        CONFIG.ANIMATIONS.OPACITY_WAVE.MIN_OPACITY = 0.2;
        CONFIG.ANIMATIONS.OPACITY_WAVE.MAX_OPACITY = 0.9;
        
        document.documentElement.style.setProperty('--cell-size', `${grid.CELL_SIZE}px`);
        document.documentElement.style.setProperty('--cell-gap', `${grid.GAP}px`);
        document.documentElement.style.setProperty('--cell-radius', `${grid.BORDER_RADIUS}px`);
        
        document.body.classList.add('mobile-device');
        
        setTimeout(() => {
            document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell').forEach(cell => {
                cell.style.borderRadius = `${grid.BORDER_RADIUS}px`;
            });
            const overlay = document.querySelector('.sidebar-overlay');
            if (overlay) {
                overlay.style.borderRadius = `${grid.BORDER_RADIUS}px`;
            }
        }, 50);
        
    }
}

function applyMobileOverlays() {

    let savedSettings = null;
    try {
        const saved = localStorage.getItem('edesign_settings');
        if (saved) {
            savedSettings = JSON.parse(saved);
        }
    } catch (e) {}
    
    const show = MOBILE_CONFIG.SHOW || {};
    
    const grain = document.getElementById('grain-overlay');
    if (grain) {

        if (savedSettings && savedSettings.grain !== undefined) {
            grain.style.display = savedSettings.grain ? 'block' : 'none';
        } else {
            grain.style.display = show.grain !== undefined ? (show.grain ? 'block' : 'none') : 'block';
        }
    }
    
    const gaussian = document.getElementById('gaussian-blur');
    if (gaussian) {
        if (savedSettings && savedSettings.gaussianBlur !== undefined) {
            gaussian.style.display = savedSettings.gaussianBlur ? 'block' : 'none';
        } else {
            gaussian.style.display = show.gaussianBlur !== undefined ? (show.gaussianBlur ? 'block' : 'none') : 'none';
        }
    }
    
    const bloom = document.getElementById('bloom-overlay');
    if (bloom) {
        if (savedSettings && savedSettings.bloom !== undefined) {
            bloom.style.display = savedSettings.bloom ? 'block' : 'none';
        } else {
            bloom.style.display = show.bloom !== undefined ? (show.bloom ? 'block' : 'none') : 'block';
        }
    }
    
    const burnBlur = document.getElementById('burn-blur');
    if (burnBlur) {
        if (savedSettings && savedSettings.burnBlur !== undefined) {
            burnBlur.style.display = savedSettings.burnBlur ? 'block' : 'none';
        } else {
            burnBlur.style.display = show.burnBlur !== undefined ? (show.burnBlur ? 'block' : 'none') : 'block';
        }
    }
    

    const texture = document.getElementById('overlay-container');
    if (texture) {

        if (savedSettings && savedSettings.textura !== undefined) {
            texture.style.display = savedSettings.textura ? 'block' : 'none';
        } else {
            texture.style.display = show.texture !== undefined ? (show.texture ? 'block' : 'none') : 'block';
        }
    }
    

    if (savedSettings && savedSettings.scanlines !== undefined) {
        if (savedSettings.scanlines) {
            document.body.classList.remove('no-scanlines');
        } else {
            document.body.classList.add('no-scanlines');
        }
    } else if (show.scanlines !== undefined) {
        if (show.scanlines) {
            document.body.classList.remove('no-scanlines');
        } else {
            document.body.classList.add('no-scanlines');
        }
    } else {
        document.body.classList.add('no-scanlines');
    }
    

    if (savedSettings && savedSettings.vignette !== undefined) {
        if (savedSettings.vignette) {
            document.body.classList.remove('no-vignette');
        } else {
            document.body.classList.add('no-vignette');
        }
    } else if (show.vignette !== undefined) {
        if (show.vignette) {
            document.body.classList.remove('no-vignette');
        } else {
            document.body.classList.add('no-vignette');
        }
    } else {
        document.body.classList.remove('no-vignette');
    }
    
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        if (savedSettings && savedSettings.flicker !== undefined) {
            if (savedSettings.flicker) {
                gridContainer.classList.remove('no-flicker');
            } else {
                gridContainer.classList.add('no-flicker');
            }
        } else if (show.flicker !== undefined) {
            if (show.flicker) {
                gridContainer.classList.remove('no-flicker');
            } else {
                gridContainer.classList.add('no-flicker');
            }
        } else {
            gridContainer.classList.remove('no-flicker');
        }
    }
    
    if (savedSettings && savedSettings.glow !== undefined) {
        if (savedSettings.glow) {
            document.body.classList.remove('no-glow');
        } else {
            document.body.classList.add('no-glow');
        }
    } else if (show.glow !== undefined) {
        if (show.glow) {
            document.body.classList.remove('no-glow');
        } else {
            document.body.classList.add('no-glow');
        }
    } else {
        document.body.classList.remove('no-glow');
    }
    
    if (gridContainer) {
        if (show.crtCurvature !== undefined) {
            if (show.crtCurvature) {
                gridContainer.classList.remove('no-curvature');
            } else {
                gridContainer.classList.add('no-curvature');
            }
        } else {
            gridContainer.classList.remove('no-curvature');
        }
    }
    
    if (gridContainer) {
        if (show.crtReflection !== undefined) {
            if (show.crtReflection) {
                gridContainer.classList.remove('no-reflection');
            } else {
                gridContainer.classList.add('no-reflection');
            }
        } else {
            gridContainer.classList.remove('no-reflection');
        }
    }
}

function injectCSSVariables() {
    const { COLORS } = CONFIG;
    const root = document.documentElement;
    const radius = getComputedStyle(root).getPropertyValue('--cell-radius').trim() || `${CONFIG.BORDER_RADIUS}px`;

    root.style.setProperty('--color-primary', COLORS.primary);
    root.style.setProperty('--color-primary-rgb', COLORS.primaryRGB);
    root.style.setProperty('--color-secondary', COLORS.secondary);
    root.style.setProperty('--color-secondary-rgb', COLORS.secondaryRGB);
    root.style.setProperty('--color-bg', COLORS.background);
    
    root.style.setProperty('--color-primary-dim', COLORS.primaryDim);
    root.style.setProperty('--color-primary-very-dim', COLORS.primaryVeryDim);
    root.style.setProperty('--color-secondary-dim', COLORS.secondaryDim);
    root.style.setProperty('--scanline-color', COLORS.scanlineColor);
    root.style.setProperty('--vignette-color', COLORS.vignetteColor);
    root.style.setProperty('--bloom-color', COLORS.bloomColor);
    
    root.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
    root.style.setProperty('--cell-gap', `${CONFIG.GAP}px`);

    if (!getComputedStyle(root).getPropertyValue('--cell-radius').trim()) {
        root.style.setProperty('--cell-radius', `${CONFIG.BORDER_RADIUS}px`);
    }
    
    root.style.setProperty('--glow-primary-intense', `0 0 5px rgba(${COLORS.primaryRGB}, 1)`);
    root.style.setProperty('--glow-primary-medium', `0 0 40px rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--glow-primary-soft', `0 0 80px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--glow-primary-inset', `inset 0 0 40px rgba(${COLORS.primaryRGB}, 0.12)`);
    
    root.style.setProperty('--glow-secondary-intense', `0 0 5px rgba(${COLORS.secondaryRGB}, 1)`);
    root.style.setProperty('--glow-secondary-medium', `0 0 30px rgba(${COLORS.secondaryRGB}, 0.1)`);
    root.style.setProperty('--glow-secondary-soft', `0 0 60px rgba(${COLORS.secondaryRGB}, 0.05)`);
    root.style.setProperty('--glow-secondary-inset', `inset 0 0 30px rgba(${COLORS.secondaryRGB}, 0.05)`);
    
    root.style.setProperty('--glow-hover-intense', `0 0 5px rgba(${COLORS.secondaryRGB}, 1)`);
    root.style.setProperty('--glow-hover-medium', `0 0 60px rgba(${COLORS.secondaryRGB}, 0.2)`);
    root.style.setProperty('--glow-hover-soft', `0 0 120px rgba(${COLORS.secondaryRGB}, 0.08)`);
    root.style.setProperty('--glow-hover-inset', `inset 0 0 40px rgba(${COLORS.secondaryRGB}, 0.08)`);
    
    root.style.setProperty('--text-shadow-normal', `
        0 0 10px rgba(${COLORS.primaryRGB}, 1),
        0 0 20px rgba(${COLORS.primaryRGB}, 1),
        0 0 60px rgba(${COLORS.primaryRGB}, 0.50),
        0 0 100px rgba(${COLORS.primaryRGB}, 0.25),
        0 0 150px rgba(${COLORS.primaryRGB}, 0.1)
    `);
    
    root.style.setProperty('--text-shadow-hover', `
        0 0 5px rgba(${COLORS.primaryRGB}, 1),
        0 0 20px rgba(${COLORS.primaryRGB}, 0.8),
        0 0 40px rgba(${COLORS.primaryRGB}, 0.4),
        0 0 80px rgba(${COLORS.primaryRGB}, 0.2),
        0 0 120px rgba(${COLORS.primaryRGB}, 0.1)
    `);
    
    root.style.setProperty('--text-shadow-active', `
        0 0 20px rgba(${COLORS.primaryRGB}, 0.8),
        0 0 40px rgba(${COLORS.primaryRGB}, 0.4),
        0 0 80px rgba(${COLORS.primaryRGB}, 0.2)
    `);
    
    root.style.setProperty('--scanline-red', `rgba(${COLORS.primaryRGB}, 0.10)`);
    root.style.setProperty('--scanline-white', `rgba(${COLORS.secondaryRGB}, 0.06)`);
    root.style.setProperty('--scanline-normal', `rgba(${COLORS.primaryRGB}, 0.03)`);
    
    root.style.setProperty('--border-primary', `1px solid ${COLORS.primary}`);
    root.style.setProperty('--border-primary-light', `2px solid rgba(${COLORS.primaryRGB}, 0.08)`);
    root.style.setProperty('--border-primary-dim', `1px solid rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--border-off', `1px solid rgba(${COLORS.primaryRGB}, 0.3)`);
    root.style.setProperty('--border-off-hover', `rgba(${COLORS.secondaryRGB}, 0.25)`);
    
    root.style.setProperty('--sidebar-shadow', `0 0 40px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--sidebar-inset', `inset 0 0 40px rgba(${COLORS.primaryRGB}, 0.05)`);
    
    root.style.setProperty('--dialog-border', `2px solid rgba(${COLORS.primaryRGB}, 0.6)`);
    root.style.setProperty('--dialog-shadow', `0 0 50px rgba(${COLORS.primaryRGB}, 0.15)`);
    root.style.setProperty('--dialog-inset', `inset 0 0 50px rgba(${COLORS.primaryRGB}, 0.05)`);
    
    root.style.setProperty('--bloom-center', '0%');
    root.style.setProperty('--bloom-edge', 'transparent 70%');
    
    root.style.setProperty('--crt-curvature-center', 'transparent 40%');
    root.style.setProperty('--crt-curvature-mid', 'rgba(0, 0, 0, 0.05) 55%');
    root.style.setProperty('--crt-curvature-mid2', 'rgba(0, 0, 0, 0.2) 70%');
    root.style.setProperty('--crt-curvature-mid3', 'rgba(0, 0, 0, 0.5) 85%');
    root.style.setProperty('--crt-curvature-mid4', 'rgba(0, 0, 0, 0.85) 95%');
    root.style.setProperty('--crt-curvature-edge', 'rgba(0, 0, 0, 1) 100%');
    
    root.style.setProperty('--crt-reflection-center', 'rgba(255, 255, 255, 0.04) 0%');
    root.style.setProperty('--crt-reflection-mid', 'rgba(255, 255, 255, 0.01) 25%');
    root.style.setProperty('--crt-reflection-edge', 'transparent 60%');
}

function hasHashInURL() {
    return window.location.hash && window.location.hash.length > 0;
}

function regenerateEverything() {
    if (isLogoAnimationRunning) return;
    if (!gridData) return;
    
    const oldOverlay = document.querySelector('.sidebar-overlay');
    const oldSidebarTexts = document.querySelectorAll('.sidebar-text');
    if (oldOverlay) oldOverlay.remove();
    oldSidebarTexts.forEach(el => el.remove());
    
    stopRandomAnimations();
    stopLogoAnimation();
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
    allCells.forEach(cell => {
        if (cell.dataset.isSidebar !== 'true') {
            const state = cell.dataset.state || 'normal';
            if (state === 'off') {
                cell.style.border = `1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.3)`;
                cell.style.backgroundColor = CONFIG.COLORS.background;
            } else if (state === 'logo' || state === 'combined_logo') {
                cell.style.border = 'none';
                cell.style.borderColor = 'transparent';
                cell.style.backgroundColor = CONFIG.COLORS.background;
                cell.style.boxShadow = `inset 0 0 0 4px ${CONFIG.COLORS.secondary}`;
            } else if (state === 'red' || state === 'combined_red') {
                cell.style.backgroundColor = CONFIG.COLORS.primary;
                cell.style.borderColor = CONFIG.COLORS.primary;
            } else {
                cell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
                cell.style.borderColor = CONFIG.COLORS.primary;
                cell.style.backgroundColor = CONFIG.COLORS.background;
            }
        }
    });
    
    const container = document.getElementById('grid-container');
    const rect = container.getBoundingClientRect();
    const cellSize = CONFIG.CELL_SIZE;
    const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH } = CONFIG;
    const totalWidth = cols * (cellSize + GAP) - GAP;
    const totalHeight = rows * (cellSize + GAP) - GAP;
    const offsetX = (rect.width - totalWidth) / 2;
    const offsetY = (rect.height - totalHeight) / 2;
    container.dataset.originalOffsetX = offsetX;
    container.dataset.originalOffsetY = offsetY;
    
    repositionGrid(offsetX, offsetY);
    repositionSidebarOverlay(offsetX, offsetY);
    repositionSidebarTexts(offsetX, offsetY);
    repositionCombinedCells(offsetX, offsetY);
    
    setTimeout(() => {
        animateSidebar(
            gridData.sidebarCells,
            gridData.rows,
            gridData.cellSize,
            offsetX,
            offsetY
        );
    }, 30000);
    
    setTimeout(() => {
        restartRandomAnimations();
    }, 500);
}

document.addEventListener('colorsUpdated', function(e) {
    const { colors } = e.detail;
    CONFIG.COLORS = colors;
    
    injectCSSVariables();
    
    document.querySelectorAll('.sidebar-cell').forEach(cell => {
        cell.style.borderColor = colors.primary;
        cell.style.backgroundColor = colors.background;
    });

    const overlay = document.getElementById('overlay-container');
    if (overlay) {
        try {
            const saved = localStorage.getItem('edesign_settings');
            if (saved) {
                const settings = JSON.parse(saved);
                overlay.style.display = settings.textura !== undefined ? (settings.textura ? 'block' : 'none') : 'block';
            }
        } catch (e) {}
    }
    
    const colorPicker = document.getElementById('colorPicker');
    if (colorPicker) {
        colorPicker.value = colors.primary;
    }
    
    const container = document.getElementById('color-picker-container');
    if (container) {
        container.style.color = colors.primary;
        const input = container.querySelector('#colorPicker');
        if (input) input.style.borderColor = colors.primary;
        const icon = container.querySelector('span:first-child');
        if (icon) {
            icon.style.color = colors.primary;
            icon.style.textShadow = `0 0 20px rgba(${colors.primaryRGB}, 0.3)`;
        }
        const hexLabel = container.querySelector('#colorHexLabel');
        if (hexLabel) {
            hexLabel.textContent = colors.primary.toUpperCase();
        }
    }
    
    regenerateEverything();
});

export function createColorPickerForSidebar() {
    const container = document.createElement('div');
    container.id = 'color-picker-container';
    container.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid ${CONFIG.COLORS.primary};
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        color: ${CONFIG.COLORS.primary};
        letter-spacing: 1px;
        opacity: 0;
        transition: opacity 0.5s ease, border-color 0.3s ease, color 0.3s ease;
        margin-top: 10px;
        justify-content: center;
    `;
    
    const colorDot = document.createElement('span');
    colorDot.style.cssText = `
        display: inline-block;
        width: 12px;
        height: 12px;
        border-radius: 50%;
        background: ${CONFIG.COLORS.primary};
        border: 1px solid rgba(255, 255, 255, 0.1);
        flex-shrink: 0;
        transition: all 0.3s ease;
    `;
    
    const input = document.createElement('input');
    input.id = 'colorPicker';
    input.type = 'color';
    input.value = CONFIG.COLORS.primary;
    input.style.cssText = `
        position: absolute;
        opacity: 0;
        width: 0;
        height: 0;
        pointer-events: none;
    `;
    
    const hexLabel = document.createElement('span');
    hexLabel.id = 'colorHexLabel';
    hexLabel.textContent = CONFIG.COLORS.primary.toUpperCase();
    hexLabel.style.cssText = `
        font-size: 8px;
        letter-spacing: 1px;
        opacity: 0.8;
        font-weight: bold;
        font-family: 'Courier New', monospace;
    `;
    
    container.addEventListener('click', function(e) {
        if (e.target !== input) {
            input.click();
        }
    });
    
    input.addEventListener('input', function(e) {
        const newColor = e.target.value;
        hexLabel.textContent = newColor.toUpperCase();
        colorDot.style.background = newColor;
        container.style.borderColor = newColor;
        container.style.color = newColor;
        updateColors(newColor);
    });
    
    container.appendChild(colorDot);
    container.appendChild(input);
    container.appendChild(hexLabel);
    
    container.addEventListener('mouseenter', () => {
        container.style.borderColor = CONFIG.COLORS.secondary;
        container.style.color = CONFIG.COLORS.secondary;
    });
    container.addEventListener('mouseleave', () => {
        container.style.borderColor = CONFIG.COLORS.primary;
        container.style.color = CONFIG.COLORS.primary;
    });
    
    return container;
}

document.addEventListener('contextmenu', function(e) {
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer && gridContainer.contains(e.target)) {
        e.preventDefault();
        return false;
    }
    if (e.target.closest('#color-picker-container')) {
        return true;
    }
    const sidebarText = e.target.closest('.sidebar-text');
    if (sidebarText) {
        return true;
    }
    const dialog = e.target.closest('#custom-dialog, #projects-dialog');
    if (dialog) {
        return true;
    }
});

document.addEventListener('keydown', (e) => {
    if (isTransitioningCheck()) {
        e.preventDefault();
        return;
    }

    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
    }

    if (e.key === 'Escape') {
        const dialogsOpen = document.querySelectorAll(
            '#custom-dialog.active, #projects-dialog.active, #import-dialog.active, #settings-dialog[style*="display: flex"]'
        );
        
        if (dialogsOpen.length > 0) {
            dialogsOpen.forEach(d => {
                if (d.id === 'settings-dialog') {
                    closeSettings();
                } else {
                    d.classList.remove('active');
                }
            });
            e.preventDefault();
            return;
        }
        
        if (isSpecialPageActiveCheck()) {
            e.preventDefault();
            returnToMainLogo();
            document.querySelectorAll('.sidebar-text').forEach(el => {
                el.classList.remove('active');
                el.style.color = CONFIG.COLORS.primary;
                el.style.textShadow = 'var(--text-shadow-normal)';
            });
            const inicioText = document.querySelector('.sidebar-text[data-action="inicio"]');
            if (inicioText) {
                inicioText.classList.add('active');
                inicioText.style.color = CONFIG.COLORS.secondary;
                inicioText.style.textShadow = 'var(--text-shadow-active)';
            }
            window.proyectosCurrentPage = 0;
            window.proyectosCurrentCategory = 'TODOS';
        }
        return;
    }

    if (e.key === 'e' || e.key === 'E') {
        if (CONFIG.ENABLE_EXPORT) {
            e.preventDefault();
            exportDesignToJSON();
        }
        return;
    }

    if (e.key === 'i' || e.key === 'I') {
        if (CONFIG.ENABLE_IMPORT) {
            e.preventDefault();
            showImportDialog();
        }
        return;
    }

    if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        if (!isLogoAnimationRunning) {
            setOnInicio(false);
            loadSpecialPage('proyectos');
        }
        return;
    }

    if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (!isLogoAnimationRunning) {
            setOnInicio(false);
            loadSpecialPage('sobre-mi');
        }
        return;
    }

    if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        if (!isLogoAnimationRunning) {
            setOnInicio(false);
            loadSpecialPage('contacto');
        }
        return;
    }

    if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleSettings();
        return;
    }

    if (e.key === ' ') {
        e.preventDefault();
        
        if (!isSpecialPageActiveCheck() && !isLogoAnimationRunning) {
            stopLogoAnimation();
            
            resetGrid();

            if (!window.location.hash || window.location.hash === '#inicio' || window.location.hash === '#') {
                setTimeout(() => {
                    renderInicioContent();
                    isInicioContentClickable = true;
                    enableInicioClicks();
                }, 300);
            }
        }
        return;
    }

    if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        const active = toggleArchitectMode();
        if (active) {
            updateArchitectOverlay();
        }
        return;
    }
});

function init() {
    loadDicc().then(() => {
        initSettings();
        
        const isSimpleMode = localStorage.getItem('simple_mode_state') === 'true';
        if (isSimpleMode) {
            const SIMPLE_PRIMARY = '#00FF9B';
            const SIMPLE_SECONDARY = '#CCCCCC';
            updateColors(SIMPLE_PRIMARY, SIMPLE_SECONDARY, '#000000');
            document.body.classList.add('simple-mode');

            try {
                const settings = {
                    grain: false,
                    gaussianBlur: false,
                    bloom: false,
                    burnBlur: false,
                    textura: false,
                    animations: false,
                    scanlines: false,
                    vignette: false,
                    flicker: false,
                    glow: false
                };
                localStorage.setItem('edesign_settings', JSON.stringify(settings));
            } catch (e) {}
            
            CONFIG.BORDER_RADIUS = 0;
            document.documentElement.style.setProperty('--cell-radius', '0px');
            CONFIG.ANIMATION_DURATION = 0;
            CONFIG.ANIMATION_DURATION_LOGO = 0;
            CONFIG.LOGO_DELAY = 0;
            CONFIG.LOGO_DELAY_COMBINED = 0;
        }
        
        initSimpleMode();
        
        const mobile = isMobile();
        
        if (mobile) {
            applyMobileConfig();
        } else {
            applyResponsiveConfig();
        }
        
        injectCSSVariables();
        
        Promise.all([
            loadSobreMiData().catch(() => {}),
            loadContactoData().catch(() => {}),
        ]).then(() => {});
        
        gridData = createGrid();
        
        designCells.forEach(cell => {
            setupCellEvents(cell);
        });
        
        const container = document.getElementById('grid-container');
        container.addEventListener('contextmenu', function(e) {
            const cell = e.target.closest('.grid-cell, .logo-cell');
            if (cell && !cell.dataset.isSidebar) {
                e.preventDefault();
                toggleCellOff(cell);
            }
        });
        
        document.addEventListener('click', function(e) {
            if (isLogoAnimationRunning) {
                const sidebarElement = e.target.closest('.sidebar-text, .sidebar-cell');
                if (sidebarElement) {
                    e.preventDefault();
                    e.stopPropagation();
                    return false;
                }
            }
        }, true);
        
        if (!isMobile()) {
            initOverlays();
        } else {

            try {
                const saved = localStorage.getItem('edesign_settings');
                if (saved) {
                    const settings = JSON.parse(saved);
                    if (settings.textura !== false) {
                        initOverlays();
                    }
                } else {
                    initOverlays();
                }
            } catch (e) {
                initOverlays();
            }
        }

        const hash = window.location.hash;
        
        disableLogoAnimation();
        
        if (mobile) {
            if (hash && hash !== '#inicio' && hash !== '#') {
                const result = handleURLOnLoad();
                
                if (result === 'inicio') {
                    setTimeout(() => {
                        renderMobileHome();
                    }, 300);
                } else if (result.page === 'proyectos' && result.projectId) {
                    window.selectedProjectId = result.projectId;
                    setTimeout(() => {
                        import('./modules/mobile/mobile-nav.js').then(module => {
                            module.openProyectoDetalle(result.projectId);
                        });
                    }, 500);
                } else if (result.page === 'proyectos') {

                    setTimeout(() => {
                        import('./modules/mobile/mobile-nav.js').then(module => {
                            module.navigateMobileTo('proyectos');
                        });
                    }, 300);
                } else if (result.page === 'sobre-mi') {
                    setTimeout(() => {
                        import('./modules/mobile/mobile-nav.js').then(module => {
                            module.navigateMobileTo('sobre-mi');
                        });
                    }, 300);
                } else if (result.page === 'contacto') {
                    setTimeout(() => {
                        import('./modules/mobile/mobile-nav.js').then(module => {
                            module.navigateMobileTo('contacto');
                        });
                    }, 300);
                }
            } else {
                setTimeout(() => {
                    renderMobileHome();
                }, 300);
            }
            return;
        }
        
        if (hash && hash !== '#inicio' && hash !== '#') {
            setTimeout(() => {
                const result = handleURLOnLoad();
                if (result.page === 'proyectos') {
                    loadSpecialPage('proyectos', result.projectId);
                } else if (result.page === 'sobre-mi') {
                    loadSpecialPage('sobre-mi');
                } else if (result.page === 'contacto') {
                    loadSpecialPage('contacto');
                }
            }, 100);
        } else {
            enableLogoAnimation();
            setTimeout(() => {
                loadInicio(false);
            }, CONFIG.LOGO_DELAY || 500);
        }
    });
}

window.addEventListener('beforeunload', () => {
    stopRandomAnimations();
    stopLogoAnimation();
});

let resizeTimeout;
let isResizing = false;

window.addEventListener('resize', () => {
    if (isMobile()) return;

    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (isResizing) return;
        isResizing = true;
        
        applyResponsiveConfig();
        
        const container = document.getElementById('grid-container');
        const rect = container.getBoundingClientRect();
        const cellSize = CONFIG.CELL_SIZE;
        const { COLS: cols, ROWS: rows, GAP, SIDEBAR_WIDTH } = CONFIG;
        
        const totalWidth = cols * (cellSize + GAP) - GAP;
        const totalHeight = rows * (cellSize + GAP) - GAP;
        const newOffsetX = (rect.width - totalWidth) / 2;
        const newOffsetY = (rect.height - totalHeight) / 2;
        
        container.dataset.originalOffsetX = newOffsetX;
        container.dataset.originalOffsetY = newOffsetY;
        
        const allCells = document.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
        allCells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (!isNaN(row) && !isNaN(col)) {
                const pos = getCellPosition(col, row, cellSize, newOffsetX, newOffsetY);
                if (!cell.dataset.isSidebar) {
                    cell.style.left = `${pos.x}px`;
                    cell.style.top = `${pos.y}px`;
                    cell.dataset.originalX = pos.x;
                    cell.dataset.originalY = pos.y;
                }
            }
        });
        
        repositionGrid(newOffsetX, newOffsetY);
        repositionSidebarOverlay(newOffsetX, newOffsetY);
        repositionSidebarTexts(newOffsetX, newOffsetY);
        repositionCombinedCells(newOffsetX, newOffsetY);
        
        import('./modules/emnlvega.js').then(module => {
            if (module.updateLettersPosition) {
                module.updateLettersPosition();
            }
        });
        
        restartRandomAnimations();
        
        if (isArchitectModeActive()) {
            setTimeout(updateArchitectOverlay, 100);
        }
        
        isResizing = false;
    }, 100);
});

function updateLettersImagePosition() {
    const img = document.getElementById('letters-animation-image');
    if (img) {
        img.remove();
    }
}

function applyResponsiveConfig() {
    if (isMobile()) return;
    
    const responsive = getResponsiveConfig();
    
    CONFIG.CELL_SIZE = responsive.CELL_SIZE;
    CONFIG.GAP = responsive.GAP;
    CONFIG.TEXT_SIZES = responsive.TEXT_SIZES;
    CONFIG.LETTER_SPACING = responsive.LETTER_SPACING;
    CONFIG.LINE_HEIGHT = responsive.LINE_HEIGHT;
    
    document.documentElement.style.setProperty('--cell-size', `${CONFIG.CELL_SIZE}px`);
    document.documentElement.style.setProperty('--cell-gap', `${CONFIG.GAP}px`);
}

export function updateLettersPosition() {
    updateLettersImagePosition();
}

window.addEventListener('popstate', () => {
    const result = handleURLOnLoad();
    if (result === 'inicio') {
        if (isSpecialPageActiveCheck()) {
            returnToMainLogo();
        }
    } else if (result.page === 'proyectos') {
        loadSpecialPage('proyectos', result.projectId);
    } else if (result.page === 'sobre-mi' || result.page === 'contacto') {
        loadSpecialPage(result.page);
    }
});

window.navigateMobileTo = navigateMobileTo;
window.handleMobileNav = navigateMobileTo;
window.mobileNav = navigateMobileTo;
window.getCurrentMobilePage = getCurrentMobilePage;

document.addEventListener('DOMContentLoaded', init);