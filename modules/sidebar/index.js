// modules/sidebar/index.js

import { CONFIG, LOGO_DESIGN, updateColors } from '../config.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations, restartRandomAnimations } from '../animations.js';
import { importDesignFromJSON } from '../logo.js';
import { toggleSettings } from '../settings.js';
import { showDialog } from '../dialogs.js';
import { getProyectosDesign, renderProyectosContent } from './pages/proyectos.js';
import { getSobreMiDesign, renderSobreMiContent } from './pages/sobre-mi.js';
import { getContactoDesign, renderContactoContent } from './pages/contacto.js';
import { clearProjectSelection } from './pages/proyectos.js';

// ===== ESTADO =====
let isSpecialPageActive = false;
let currentPage = null;
let isProgrammaticLoad = false;

// ===== MAPA DE PÁGINAS =====
const PAGE_HANDLERS = {
    'proyectos': { getDesign: getProyectosDesign, render: renderProyectosContent },
    'sobre-mi': { getDesign: getSobreMiDesign, render: renderSobreMiContent },
    'contacto': { getDesign: getContactoDesign, render: renderContactoContent }
};

// ===== SVG HARDCODEADOS =====
const SVG_OUTLINE = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="100%" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(3.358338,0,0,3.358338,-551.525321,-628.195427)">
        <path d="M205,194.1L205,223.9C205,226.3 203.1,228.3 200.7,228.3L170.8,228.3C168.4,228.3 166.5,226.3 166.5,223.9L166.5,194.1C166.5,191.7 168.4,189.7 170.8,189.7L200.7,189.7C203.1,189.7 205,191.7 205,194.1ZM200.7,194.1L170.8,194.1L170.8,223.9L200.7,223.9L200.7,194.1Z" style="fill:#fff;"/>
    </g>
    <g transform="matrix(3.358338,0,0,3.358338,-551.525321,-275.648571)">
        <path d="M205,194.1L205,223.9C205,226.3 203.1,228.3 200.7,228.3L170.8,228.3C168.4,228.3 166.5,226.3 166.5,223.9L166.5,194.1C166.5,191.7 168.4,189.7 170.8,189.7L200.7,189.7C203.1,189.7 205,191.7 205,194.1ZM200.7,194.1L170.8,194.1L170.8,223.9L200.7,223.9L200.7,194.1Z" style="fill:#fff;"/>
    </g>
</svg>`;

const SVG_COMBINED = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="100%" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(9.262319,0,0,3.358338,-1380.948563,-628.195427)">
        <path d="M202.3,194.1L202.3,223.9C202.3,226.3 201.6,228.3 200.7,228.3L170.8,228.3C170,228.3 169.2,226.3 169.2,223.9L169.2,194.1C169.2,191.7 170,189.7 170.8,189.7L200.7,189.7C201.6,189.7 202.3,191.7 202.3,194.1ZM202.3,299.1L202.3,328.9C202.3,331.3 201.6,333.3 200.7,333.3L170.8,333.3C170,333.3 169.2,331.3 169.2,328.9L169.2,299.1C169.2,296.7 170,294.7 170.8,294.7L200.7,294.7C201.6,294.7 202.3,296.7 202.3,299.1ZM182.9,246.6L182.9,276.4C182.9,278.8 182.2,280.8 181.3,280.8L151.5,280.8C150.6,280.8 149.9,278.8 149.9,276.4L149.9,246.6C149.9,244.2 150.6,242.2 151.5,242.2L181.3,242.2C182.2,242.2 182.9,244.2 182.9,246.6Z" style="fill:#fff;"/>
    </g>
</svg>`;

const SVG_HOVER = `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg width="100%" height="100%" viewBox="0 0 500 500" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" xmlns:serif="http://www.serif.com/" style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;">
    <g transform="matrix(3.358338,0,0,3.358338,-551.525321,-628.195427)">
        <path d="M205,194.1L205,223.9C205,226.3 203.1,228.3 200.7,228.3L170.8,228.3C168.4,228.3 166.5,226.3 166.5,223.9L166.5,194.1C166.5,191.7 168.4,189.7 170.8,189.7L200.7,189.7C203.1,189.7 205,191.7 205,194.1ZM200.7,194.1L170.8,194.1L170.8,223.9L200.7,223.9L200.7,194.1Z" style="fill:#fff;"/>
        <g transform="matrix(2.758007,0,0,1,-246.97435,0)">
            <path d="M202.3,194.1L202.3,223.9C202.3,226.3 201.6,228.3 200.7,228.3L170.8,228.3C170,228.3 169.2,226.3 169.2,223.9L169.2,194.1C169.2,191.7 170,189.7 170.8,189.7L200.7,189.7C201.6,189.7 202.3,191.7 202.3,194.1ZM202.3,299.1L202.3,328.9C202.3,331.3 201.6,333.3 200.7,333.3L170.8,333.3C170,333.3 169.2,331.3 169.2,328.9L169.2,299.1C169.2,296.7 170,294.7 170.8,294.7L200.7,294.7C201.6,294.7 202.3,296.7 202.3,299.1ZM182.9,246.6L182.9,276.4C182.9,278.8 182.2,280.8 181.3,280.8L151.5,280.8C150.6,280.8 149.9,278.8 149.9,276.4L149.9,246.6C149.9,244.2 150.6,242.2 151.5,242.2L181.3,242.2C182.2,242.2 182.9,244.2 182.9,246.6Z" style="fill:#fff;"/>
        </g>
        <g transform="matrix(1,0,0,1,0,104.976599)">
            <path d="M205,194.1L205,223.9C205,226.3 203.1,228.3 200.7,228.3L170.8,228.3C168.4,228.3 166.5,226.3 166.5,223.9L166.5,194.1C166.5,191.7 168.4,189.7 170.8,189.7L200.7,189.7C203.1,189.7 205,191.7 205,194.1ZM200.7,194.1L170.8,194.1L170.8,223.9L200.7,223.9L200.7,194.1Z" style="fill:#fff;"/>
        </g>
    </g>
</svg>`;

// ===== ANIMATE SIDEBAR =====
export function animateSidebar(sidebarCells, rows, cellSize, offsetX, offsetY) {
    if (!sidebarCells?.length) return;
    
    const container = document.getElementById('grid-container');
    const sidebarWidth = CONFIG.SIDEBAR_WIDTH * (cellSize + CONFIG.GAP) - CONFIG.GAP;
    const sidebarHeight = rows * (cellSize + CONFIG.GAP) - CONFIG.GAP;
    
    const existingOverlay = document.querySelector('.sidebar-overlay');
    if (existingOverlay) existingOverlay.remove();
    
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.style.cssText = `
        left: ${offsetX}px; top: ${offsetY}px;
        width: ${sidebarWidth}px; height: ${sidebarHeight}px;
        border-radius: ${CONFIG.BORDER_RADIUS}px;
        background-color: ${CONFIG.COLORS.background};
        border: 1px solid ${CONFIG.COLORS.primary};
        opacity: 0;
        transition: opacity 0.5s ease;
        z-index: 15;
        pointer-events: none;
    `;
    container.appendChild(overlay);
    
    sidebarCells.forEach(cell => {
        cell.style.zIndex = '5';
        cell.style.opacity = '1';
        cell.style.pointerEvents = 'none';
    });
    
    const firstCell = sidebarCells.find(c => 
        parseInt(c.dataset.sidebarRow) === 0 && 
        parseInt(c.dataset.sidebarCol) === 0
    );
    
    if (!firstCell) {
        overlay.style.opacity = '1';
        setupSidebarTexts(rows, cellSize, offsetX, offsetY, sidebarWidth, sidebarHeight, container);
        return;
    }
    
    const origX = parseFloat(firstCell.dataset.originalX) || parseFloat(firstCell.style.left);
    const origY = parseFloat(firstCell.dataset.originalY) || parseFloat(firstCell.style.top);
    
    firstCell.dataset.originalX = origX;
    firstCell.dataset.originalY = origY;
    firstCell.style.opacity = '1';
    firstCell.style.pointerEvents = 'none';
    firstCell.style.zIndex = '10';
    firstCell.style.backgroundColor = CONFIG.COLORS.background;
    firstCell.style.border = `1px solid ${CONFIG.COLORS.primary}`;
    
    setTimeout(() => {
        firstCell.style.transition = `all ${CONFIG.ANIMATION_DURATION}ms cubic-bezier(0.25, 0.46, 0.45, 0.94)`;
        firstCell.style.left = `${origX}px`;
        firstCell.style.top = `${origY}px`;
        firstCell.style.width = `${sidebarWidth}px`;
        firstCell.style.height = `${cellSize}px`;
        firstCell.style.zIndex = '10';
    }, 50);
    
    setTimeout(() => {
        firstCell.style.height = `${sidebarHeight}px`;
        firstCell.style.top = `${offsetY}px`;
        firstCell.style.zIndex = '10';
        
        setTimeout(() => {
            overlay.style.opacity = '1';
            setTimeout(() => {
                sidebarCells.forEach(cell => {
                    cell.style.transition = 'opacity 0.5s ease';
                    cell.style.opacity = '0';
                    cell.style.pointerEvents = 'none';
                });
                setupSidebarTexts(rows, cellSize, offsetX, offsetY, sidebarWidth, sidebarHeight, container);
            }, 400);
        }, 300);
    }, CONFIG.ANIMATION_DURATION + 100);
}

// ===== SETUP SIDEBAR TEXTS =====
// modules/sidebar/index.js - setupSidebarTexts

export function setupSidebarTexts(rows, cellSize, offsetX, offsetY, sidebarWidth, sidebarHeight, container) {
    // Limpiar elementos anteriores
    document.querySelectorAll('.sidebar-text, .sidebar-logo-svg, .sidebar-logo-text, #settings-cog-btn, #color-picker-container').forEach(el => el.remove());
    
    const menuItems = [
        { text: 'EMNLVEGA', action: 'inicio', isLogo: true },
        { text: 'INICIO', action: 'inicio' },
        { text: 'PROYECTOS', action: 'proyectos' },
        { text: 'SOBRE MI', action: 'sobre-mi' },
        { text: 'CONTACTO', action: 'contacto' },
        { text: 'MENÚ', action: 'configuracion' }
    ];
    
    // Distribución automática
    const totalItems = menuItems.length + 1; // +1 por el logo SVG
    const padding = 30; // Más padding arriba para bajar el logo
    const availableHeight = sidebarHeight - (padding * 2);
    const spacing = availableHeight / (totalItems + 1);
    
    const x = offsetX + sidebarWidth / 2;
    let currentY = offsetY + padding;
    
    // ===== LOGO SVG (más abajo) =====
    const logoY = currentY + 15; // Bajar el logo un poco
    const logoSVG = createLogo(container, x, logoY);
    container.appendChild(logoSVG);
    setTimeout(() => { logoSVG.style.opacity = '1'; }, 300);
    
    // ===== MENU ITEMS =====
    menuItems.forEach((item, index) => {
        currentY += spacing;
        const div = document.createElement('div');
        div.className = 'sidebar-text';
        div.dataset.action = item.action;
        div.dataset.index = index;
        div.dataset.isLogoText = item.isLogo ? 'true' : 'false';
        
        const textSpan = document.createElement('span');
        textSpan.className = 'text-content';
        textSpan.textContent = item.text;
        div.appendChild(textSpan);
        
        // EMNLVEGA siempre es "activo" (verde) pero no tiene estado active
        const isLogoText = item.isLogo;
        const isActive = !isLogoText && item.action === 'inicio' && !isSpecialPageActive;
        const isPageActive = item.action !== 'inicio' && item.action !== 'configuracion' && isSpecialPageActive && currentPage === item.action;
        
        // Color: EMNLVEGA siempre primary, los demás según estado
        let textColor = CONFIG.COLORS.primary;
        let textShadow = 'var(--text-shadow-normal)';
        
        if (isLogoText) {
            textColor = CONFIG.COLORS.primary; // Siempre verde
            textShadow = 'var(--text-shadow-normal)';
        } else if (isActive || isPageActive) {
            textColor = CONFIG.COLORS.secondary;
            textShadow = 'var(--text-shadow-active)';
        }
        
        div.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${currentY - 6}px;
            transform: translateX(-50%);
            opacity: 0;
            color: ${textColor};
            transition: opacity 0.5s ease, color 0.3s ease, text-shadow 0.3s ease;
            z-index: 21;
            font-size: ${isLogoText ? '14px' : '13px'};
            font-weight: bold;
            letter-spacing: ${isLogoText ? '6px' : '3px'};
            cursor: pointer;
            font-family: 'Courier New', monospace;
            text-transform: uppercase;
            user-select: none;
            -webkit-user-select: none;
            white-space: nowrap;
            pointer-events: auto;
            text-shadow: ${textShadow};
            isolation: isolate;
            display: flex;
            align-items: center;
        `;
        
        // EMNLVEGA NO tiene blinking
        if (isLogoText) {
            div.classList.add('logo-text-item');
            // Guardar referencia para actualizar en resize
            div.dataset.isLogoText = 'true';
        }
        
        if (isActive || isPageActive) {
            div.classList.add('active');
        }
        
        setTimeout(() => { div.style.opacity = '1'; }, 200 + (index + 1) * 100);
        
        div.addEventListener('mouseenter', () => {
            if (isLogoText) {
                // EMNLVEGA solo cambia a secondary en hover
                div.style.color = CONFIG.COLORS.secondary;
                div.style.textShadow = 'var(--text-shadow-hover)';
            } else if (!div.classList.contains('active')) {
                div.style.color = CONFIG.COLORS.secondary;
                div.style.textShadow = 'var(--text-shadow-hover)';
            }
        });
        div.addEventListener('mouseleave', () => {
            if (isLogoText) {
                // EMNLVEGA vuelve a primary
                div.style.color = CONFIG.COLORS.primary;
                div.style.textShadow = 'var(--text-shadow-normal)';
            } else if (!div.classList.contains('active')) {
                div.style.color = CONFIG.COLORS.primary;
                div.style.textShadow = 'var(--text-shadow-normal)';
            }
        });
        
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.action === 'configuracion') {
                toggleSettings();
                return;
            }
            if (item.action === 'inicio') {
                handleSidebarAction('inicio');
                return;
            }
            handleSidebarAction(item.action);
        });
        
        container.appendChild(div);
    });
}

// ===== CREAR LOGO =====
function createLogo(container, x, y) {
    const wrapper = document.createElement('div');
    wrapper.className = 'sidebar-logo-svg';
    wrapper.style.cssText = `
        position: absolute;
        left: ${x}px;
        top: ${y}px;
        transform: translateX(-50%);
        z-index: 9996;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.5s ease;
        pointer-events: auto;
        width: 50px;
        height: 50px;
        isolation: isolate;
        filter: drop-shadow(0 0 4px ${CONFIG.COLORS.primary});
    `;
    
    const svgContainer = document.createElement('div');
    svgContainer.style.cssText = `
        position: relative;
        width: 100%;
        height: 100%;
    `;
    
    function createSVGFromString(svgString, extraStyles = '') {
        const div = document.createElement('div');
        div.innerHTML = svgString;
        const svg = div.firstElementChild;
        svg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            ${extraStyles}
        `;
        return svg;
    }
    
    const outlineSVG = createSVGFromString(SVG_OUTLINE);
    svgContainer.appendChild(outlineSVG);
    
    const combinedSVG = createSVGFromString(SVG_COMBINED);
    const combinedPath = combinedSVG.querySelector('path');
    if (combinedPath) {
        combinedPath.setAttribute('fill', CONFIG.COLORS.primary);
        combinedPath.setAttribute('style', `fill:${CONFIG.COLORS.primary};`);
    }
    svgContainer.appendChild(combinedSVG);
    
    const hoverSVG = createSVGFromString(SVG_HOVER, 'opacity: 0; transition: opacity 0.3s ease;');
    svgContainer.appendChild(hoverSVG);
    
    wrapper.appendChild(svgContainer);
    
    function updateCombinedColor(color) {
        const path = combinedSVG.querySelector('path');
        if (path) {
            path.setAttribute('fill', color);
            path.setAttribute('style', `fill:${color};`);
        }
        if (!wrapper._isHovered) {
            wrapper.style.filter = `drop-shadow(0 0 4px ${color})`;
        }
    }
    
    wrapper.addEventListener('mouseenter', () => {
        wrapper._isHovered = true;
        hoverSVG.style.opacity = '1';
        wrapper.style.filter = `drop-shadow(0 0 4px ${CONFIG.COLORS.secondary})`;
    });
    
    wrapper.addEventListener('mouseleave', () => {
        wrapper._isHovered = false;
        hoverSVG.style.opacity = '0';
        wrapper.style.filter = `drop-shadow(0 0 4px ${CONFIG.COLORS.primary})`;
    });
    
    wrapper.addEventListener('click', () => {
        if (!isSpecialPageActive) return;
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
    });
    
    document.addEventListener('colorsUpdated', function(e) {
        const { colors } = e.detail;
        updateCombinedColor(colors.primary);
    });
    
    return wrapper;
}

// ===== HANDLE SIDEBAR ACTION =====
export function handleSidebarAction(action) {
    if (action === 'inicio') {
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
        return;
    }
    
    if (action === 'proyectos' || action === 'sobre-mi' || action === 'contacto') {
        document.querySelectorAll('.sidebar-text').forEach(el => {
            el.classList.remove('active');
            el.style.color = CONFIG.COLORS.primary;
            el.style.textShadow = 'var(--text-shadow-normal)';
        });
        const currentText = document.querySelector(`.sidebar-text[data-action="${action}"]`);
        if (currentText) {
            currentText.classList.add('active');
            currentText.style.color = CONFIG.COLORS.secondary;
            currentText.style.textShadow = 'var(--text-shadow-active)';
        }
        loadSidebarPage(action);
    }
}

// ===== LOAD SIDEBAR PAGE =====
function loadSidebarPage(pageKey) {
    if (pageKey !== 'proyectos') {
        clearProjectSelection();
    }
    const handler = PAGE_HANDLERS[pageKey];
    if (!handler) return;
    
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content').forEach(el => el.remove());
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content');
        children.forEach(child => child.remove());
    });
    
    setGridInteractionsEnabled(false);
    stopRandomAnimations();
    resetGrid(false);
    isProgrammaticLoad = true;
    
    setTimeout(async () => {
        try {
            const design = await handler.getDesign();
            importDesignFromJSON(design, () => {
                isSpecialPageActive = true;
                currentPage = pageKey;
                isProgrammaticLoad = false;
                setTimeout(() => {
                    handler.render();
                    setTimeout(() => {
                        restartRandomAnimations();
                    }, 500);
                }, 300);
            });
        } catch (error) {
            console.error('Error loading page:', error);
            isProgrammaticLoad = false;
            setGridInteractionsEnabled(true);
        }
    }, 200);
}

// ===== RETURN TO MAIN =====
export function returnToMainLogo() {
    if (!isSpecialPageActive) return;

    clearProjectSelection();
    
    document.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content').forEach(el => el.remove());
    
    const allCells = document.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.proyectos-content, .proyectos-category, .proyectos-item, .proyectos-detail, .proyectos-nav, .proyectos-filter, .proyectos-select-message, .sobre-mi-content, .contacto-content');
        children.forEach(child => child.remove());
    });
    
    setGridInteractionsEnabled(false);
    stopRandomAnimations();
    resetGrid(false);
    isProgrammaticLoad = true;
    
    setTimeout(() => {
        importDesignFromJSON(LOGO_DESIGN, () => {
            isSpecialPageActive = false;
            currentPage = null;
            isProgrammaticLoad = false;
            setGridInteractionsEnabled(true);
            window.proyectosCurrentPage = 0;
            window.proyectosCurrentCategory = 'TODOS';
            setTimeout(() => {
                restartRandomAnimations();
            }, 500);
        });
    }, 200);
}

// ===== GRID INTERACTIONS =====
function setGridInteractionsEnabled(enabled) {
    const cells = document.querySelectorAll('.grid-cell, .logo-cell');
    cells.forEach(cell => {
        cell.style.pointerEvents = enabled ? 'auto' : 'none';
    });
    
    if (enabled) {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('keydown', preventSpecialKeys);
    } else {
        document.addEventListener('contextmenu', preventContextMenu);
        document.addEventListener('keydown', preventSpecialKeys);
    }
}

function preventContextMenu(e) {
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer && gridContainer.contains(e.target)) {
        e.preventDefault();
        return false;
    }
}

function preventSpecialKeys(e) {
    if (e.code === 'Space') e.preventDefault();
    if (e.code === 'KeyE' && e.ctrlKey) e.preventDefault();
    if (e.code === 'KeyI' && e.ctrlKey) e.preventDefault();
}

// ===== EXPORT =====
export function isSpecialPageActiveCheck() { return isSpecialPageActive; }
export function isProgrammaticLoadCheck() { return isProgrammaticLoad; }
export function getCurrentPage() { return currentPage; }