import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { renderMobileHome } from './mobile-home.js';
import { renderMobileSobreMi } from './mobile-sobremi.js';
import { renderMobileProyectos } from './mobile-proyectos.js';
import { renderMobileProyectoDetalle } from './mobile-proyecto-detalle.js';
import { renderMobileContacto } from './mobile-contacto.js';
import { removeMobileHomeLetters } from './mobile-home.js';

let currentMobilePage = 'inicio';
let navButtonsCreated = false;
let currentProjectId = null;
let dicc = null;

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

const MOBILE_PAGES = {
    'inicio': renderMobileHome,
    'sobre-mi': renderMobileSobreMi,
    'proyectos': renderMobileProyectos,
    'proyecto-detalle': () => {
        if (currentProjectId) {
            renderMobileProyectoDetalle(currentProjectId);
        } else {
            renderMobileProyectos();
        }
    },
    'contacto': renderMobileContacto
};

export function openProyectoDetalle(projectId) {
    currentProjectId = projectId;
    navigateMobileTo('proyecto-detalle', projectId);
}

export function volverAProyectos() {
    currentProjectId = null;
    navigateMobileTo('proyectos');
}

export function navigateMobileTo(page, projectId = null) {
    if (page === 'inicio') {

        removeMobileHomeLetters();
        

        document.querySelectorAll('.mobile-proyectos-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-proyecto-item, .mobile-categoria-item, .mobile-flecha, .mobile-page-indicator, .mobile-sobremi-content, .mobile-home-content, .mobile-proyecto-detalle-content, .mobile-contacto-content, .mobile-contacto-social-item, .mobile-contacto-info, .mobile-contacto-text, .mobile-contacto-email, .mobile-contacto-social, .mobile-proyectos-container, .mobile-proyecto-card, .mobile-categoria-item, .mobile-proyecto-titulo, .mobile-proyecto-descripcion, .mobile-proyecto-imagen, .mobile-proyecto-detalle-container, .mobile-proyecto-detalle-imagen, .mobile-proyecto-detalle-info, .mobile-proyecto-detalle-titulo, .mobile-proyecto-detalle-descripcion, .mobile-proyecto-detalle-tecnologias, .mobile-proyecto-detalle-enlace, .mobile-proyecto-detalle-volver, .mobile-sobremi-container, .mobile-sobremi-texto, .mobile-sobremi-imagen, .mobile-sobremi-titulo').forEach(el => {
            if (el) el.remove();
        });
        

        const container = document.getElementById('grid-container');
        if (container) {
            const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
            allCells.forEach(cell => {
                const children = Array.from(cell.children);
                children.forEach(child => {
                    if (!child.classList.contains('grid-cell') && 
                        !child.classList.contains('logo-cell') && 
                        !child.classList.contains('sidebar-cell') &&
                        child.id !== 'mobile-letters-image' &&
                        !child.classList.contains('mobile-nav-btn')) {
                        child.remove();
                    }
                });
            });
        }
        

        currentMobilePage = 'inicio';
        currentProjectId = null;
        

        window.history.pushState({}, '', window.location.pathname);
        

        renderMobileHome();
        return;
    }
    

    if (page !== 'inicio') {
        removeMobileHomeLetters();
    }
    
    if (projectId) {
        currentProjectId = projectId;
    }
    

    document.querySelectorAll('.mobile-proyectos-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-proyecto-item, .mobile-categoria-item, .mobile-flecha, .mobile-page-indicator, .mobile-sobremi-content, .mobile-home-content, .mobile-proyecto-detalle-content, .mobile-contacto-content, .mobile-contacto-social-item, .mobile-contacto-info, .mobile-contacto-text, .mobile-contacto-email, .mobile-contacto-social, .mobile-proyectos-container, .mobile-proyecto-card, .mobile-categoria-item, .mobile-proyecto-titulo, .mobile-proyecto-descripcion, .mobile-proyecto-imagen, .mobile-proyecto-detalle-container, .mobile-proyecto-detalle-imagen, .mobile-proyecto-detalle-info, .mobile-proyecto-detalle-titulo, .mobile-proyecto-detalle-descripcion, .mobile-proyecto-detalle-tecnologias, .mobile-proyecto-detalle-enlace, .mobile-proyecto-detalle-volver, .mobile-sobremi-container, .mobile-sobremi-texto, .mobile-sobremi-imagen, .mobile-sobremi-titulo').forEach(el => {
        if (el) el.remove();
    });
    
    const container = document.getElementById('grid-container');
    if (container) {
        const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
        allCells.forEach(cell => {
            const children = Array.from(cell.children);
            children.forEach(child => {
                if (!child.classList.contains('grid-cell') && 
                    !child.classList.contains('logo-cell') && 
                    !child.classList.contains('sidebar-cell') &&
                    child.id !== 'mobile-letters-image' &&
                    !child.classList.contains('mobile-nav-btn')) {
                    child.remove();
                }
            });
        });
    }
    
    currentMobilePage = page;
    

    if (page === 'proyecto-detalle' && projectId) {
        window.history.pushState({}, '', `#${projectId}`);
    } else {
        window.history.pushState({}, '', `#${page}`);
    }
    
    const renderFn = MOBILE_PAGES[page];
    if (!renderFn) {
        currentMobilePage = 'inicio';
        window.history.pushState({}, '', window.location.pathname);
        renderMobileHome();
        return;
    }
    
    renderFn();
}

export function updateMobileNavButtons(activePage) {
    const buttons = document.querySelectorAll('.mobile-nav-btn');
    
    buttons.forEach(btn => {
        const action = btn.dataset.action;
        const isActive = action === activePage;
        
        const borderColor = isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary;
        const textColor = isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary;
        const bgColor = isActive ? `rgba(${CONFIG.COLORS.secondaryRGB}, 0.08)` : 'rgba(0, 0, 0, 0.4)';
        const shadow = isActive ? `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.15)` : 'none';
        
        btn.style.borderColor = borderColor;
        btn.style.background = bgColor;
        btn.style.boxShadow = shadow;
        
        const icon = btn.querySelector('.btn-icon');
        if (icon) {
            icon.style.color = textColor;
            icon.style.textShadow = `0 0 20px rgba(${isActive ? CONFIG.COLORS.secondaryRGB : CONFIG.COLORS.primaryRGB}, ${isActive ? '0.4' : '0.2'})`;
        }
        
        const text = btn.querySelector('.btn-text');
        if (text) {
            text.style.color = textColor;
            text.style.textShadow = `0 0 20px rgba(${isActive ? CONFIG.COLORS.secondaryRGB : CONFIG.COLORS.primaryRGB}, ${isActive ? '0.3' : '0.1'})`;
            text.style.fontWeight = isActive ? 'bold' : 'normal';
        }
        
        const line = btn.querySelector('.linesito');
        if (line) {
            line.style.background = textColor;
            line.style.opacity = isActive ? '0.8' : '0.3';
        }
    });
}

export function createMobileNavButtons(activePage = 'inicio') {

    const existingButtons = document.querySelectorAll('.mobile-nav-btn');
    if (existingButtons.length > 0) {
        updateMobileNavButtons(activePage);
        return;
    }
    
    loadDicc().then(() => {
        document.querySelectorAll('.mobile-nav-btn').forEach(el => el.remove());
        navButtonsCreated = false;
        
        const container = document.getElementById('grid-container');
        if (!container) return;
        
        fetch('./modules/mobile/sidebar-movil.json')
            .then(response => {
                if (!response.ok) throw new Error('No se pudo cargar sidebar-movil.json');
                return response.json();
            })
            .then(sidebarDesign => {
                const existingCells = container.querySelectorAll('.grid-cell, .logo-cell');
                let hasSidebarCells = false;
                
                existingCells.forEach(cell => {
                    if (cell.dataset.combined === 'true') {
                        const row = parseInt(cell.dataset.designRow);
                        if (row === 30) hasSidebarCells = true;
                    }
                });
                
                if (!hasSidebarCells) {
                    importDesignFromJSON(sidebarDesign, () => {
                        createButtonsFromCells(activePage);
                    }, false);
                } else {
                    createButtonsFromCells(activePage);
                }
            })
            .catch(() => {
                createButtonsFromCells(activePage);
            });
    });
}

function createButtonsFromCells(activePage) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    const d = dicc || { mobile: { nav: {} } };
    const mobileTexts = d.mobile.nav || {};
    const mobileIcons = d.mobile.icons || {};
    
    const displayPage = activePage === 'proyecto-detalle' ? 'proyectos' : activePage;
    
    const buttons = [
        { action: 'sobre-mi', text: mobileTexts.sobreMi, icon: mobileIcons.sobreMi || '◍', row: 30, col: 0 },
        { action: 'proyectos', text: mobileTexts.proyectos, icon: mobileIcons.proyectos || '◈', row: 30, col: 6 },
        { action: 'contacto', text: mobileTexts.contacto, icon: mobileIcons.contacto || '△', row: 30, col: 14 }
    ];
    
    buttons.forEach(btnConfig => {
        let targetCell = null;
        
        allCells.forEach(cell => {
            if (cell.dataset.combined === 'true') {
                const row = parseInt(cell.dataset.designRow);
                const col = parseInt(cell.dataset.designCol);
                if (row === btnConfig.row && col === btnConfig.col) {
                    targetCell = cell;
                }
            }
        });
        
        if (!targetCell) return;
        
        targetCell.style.pointerEvents = 'none';
        targetCell.style.cursor = 'default';
        targetCell.dataset.locked = 'true';
        targetCell.style.userSelect = 'none';
        targetCell.style.webkitUserSelect = 'none';
        targetCell.style.touchAction = 'none';
        
        const isActive = btnConfig.action === displayPage;
        const displayText = isActive ? (mobileTexts.inicioActive || '') : btnConfig.text;
        
        const borderColor = isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary;
        const textColor = isActive ? CONFIG.COLORS.secondary : CONFIG.COLORS.primary;
        const bgColor = isActive ? `rgba(${CONFIG.COLORS.secondaryRGB}, 0.08)` : 'rgba(0, 0, 0, 0.4)';
        const shadow = isActive ? `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.15)` : 'none';
        
        const btn = document.createElement('div');
        btn.className = 'mobile-nav-btn';
        btn.dataset.action = btnConfig.action;
        btn.dataset.locked = 'true';
        btn.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            pointer-events: auto !important;
            cursor: pointer !important;
            z-index: 999 !important;
            font-family: 'Courier New', monospace;
            background: ${bgColor};
            border: 3px solid ${borderColor};
            border-radius: 2px;
            transition: all 0.3s ease;
            gap: 2px;
            user-select: none;
            -webkit-user-select: none;
            -webkit-tap-highlight-color: transparent;
            touch-action: manipulation;
            box-shadow: ${isActive ? `inset 0 0 20px rgba(${CONFIG.COLORS.secondaryRGB}, 0.5)` : `inset 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.5)`};
        `;
        
        const icon = document.createElement('span');
        icon.className = 'btn-icon';
        icon.textContent = btnConfig.icon;
        icon.style.cssText = `
            font-size: 28px;
            color: ${textColor};
            text-shadow: 0 0 20px rgba(${isActive ? CONFIG.COLORS.secondaryRGB : CONFIG.COLORS.primaryRGB}, ${isActive ? '0.4' : '0.2'});
            transition: all 0.3s ease;
            pointer-events: none;
        `;
        btn.appendChild(icon);
        
        const line = document.createElement('div');
        line.className = 'btn-line';
        line.style.cssText = `
            width: 35%;
            height: 0.5px;
            background: #ffffff;
            opacity: 1 !important;
            transition: all 0.3s ease;
            pointer-events: none;
            flex-shrink: 0;
            align-self: center;
            margin-top: -4px;
            margin-bottom: 2px;
        `;
        btn.appendChild(line);
        
        const text = document.createElement('span');
        text.className = 'btn-text';
        text.textContent = displayText;
        text.style.cssText = `
            font-size: 10px;
            letter-spacing: 2px;
            color: ${textColor};
            text-shadow: 0 0 20px rgba(${isActive ? CONFIG.COLORS.secondaryRGB : CONFIG.COLORS.primaryRGB}, ${isActive ? '0.3' : '0.1'});
            transition: all 0.3s ease;
            font-weight: ${isActive ? 'bold' : 'normal'};
            pointer-events: none;
        `;
        btn.appendChild(text);
        
        targetCell.appendChild(btn);
        
        function doNavigate() {
            const action = btn.dataset.action;
            const target = isActive ? 'inicio' : action;
            if (typeof window.navigateMobileTo === 'function') {
                window.navigateMobileTo(target);
            } else {
                import('./mobile-nav.js').then(module => {
                    module.navigateMobileTo(target);
                });
            }
        }
        
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            doNavigate();
        });
        
        btn.addEventListener('touchend', function(e) {
            e.stopPropagation();
            e.preventDefault();
            const action = this.dataset.action;
            if (!isActive) {
                this.style.borderColor = CONFIG.COLORS.primary;
                this.style.background = 'rgba(0, 0, 0, 0.4)';
                this.style.transform = 'scale(1)';
                const iconEl = this.querySelector('.btn-icon');
                const textEl = this.querySelector('.btn-text');
                if (iconEl) iconEl.style.color = CONFIG.COLORS.primary;
                if (textEl) textEl.style.color = CONFIG.COLORS.primary;
            }
            doNavigate();
        }, { passive: false });
        
        btn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            if (!isActive) {
                this.style.borderColor = CONFIG.COLORS.secondary;
                this.style.background = `rgba(${CONFIG.COLORS.secondaryRGB}, 0.1)`;
                this.style.transform = 'scale(0.97)';
                const iconEl = this.querySelector('.btn-icon');
                const textEl = this.querySelector('.btn-text');
                if (iconEl) iconEl.style.color = CONFIG.COLORS.secondary;
                if (textEl) textEl.style.color = CONFIG.COLORS.secondary;
            }
        }, { passive: false });
        
        if (!isActive) {
            btn.addEventListener('mouseenter', function() {
                this.style.borderColor = CONFIG.COLORS.secondary;
                this.style.background = `rgba(${CONFIG.COLORS.secondaryRGB}, 0.06)`;
                this.style.boxShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.08)`;
                const iconEl = this.querySelector('.btn-icon');
                const textEl = this.querySelector('.btn-text');
                if (iconEl) {
                    iconEl.style.color = CONFIG.COLORS.secondary;
                    iconEl.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.3)`;
                }
                if (textEl) {
                    textEl.style.color = CONFIG.COLORS.secondary;
                    textEl.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.2)`;
                }
            });
            
            btn.addEventListener('mouseleave', function() {
                this.style.borderColor = CONFIG.COLORS.primary;
                this.style.background = 'rgba(0, 0, 0, 0.4)';
                this.style.boxShadow = 'none';
                const iconEl = this.querySelector('.btn-icon');
                const textEl = this.querySelector('.btn-text');
                if (iconEl) {
                    iconEl.style.color = CONFIG.COLORS.primary;
                    iconEl.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
                }
                if (textEl) {
                    textEl.style.color = CONFIG.COLORS.primary;
                    textEl.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
                }
            });
        }
    });
    
    navButtonsCreated = true;
}

window.navigateMobileTo = navigateMobileTo;
window.openProyectoDetalle = openProyectoDetalle;
window.volverAProyectos = volverAProyectos;

export function getCurrentMobilePage() {
    return currentMobilePage;
}