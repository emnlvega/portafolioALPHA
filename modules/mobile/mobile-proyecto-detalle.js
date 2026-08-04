// modules/mobile/mobile-proyecto-detalle.js
import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons, volverAProyectos } from './mobile-nav.js';

const PROYECTO_DETALLE_DESIGN = {
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
    "width": 375,
    "height": 394,
    "combined": true
  },
  "24,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 582.5,
    "width": 185,
    "height": 52,
    "combined": true
  },
  "24,10": {
    "type": "combined_normal",
    "left": 962.5,
    "top": 582.5,
    "width": 185,
    "height": 52,
    "combined": true
  },
  "27,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 639.5,
    "width": 375,
    "height": 52,
    "combined": true
  }
};

let proyectoActual = null;
let paginaActual = 0;
let proyectoData = [];
let gridReady = false;

async function loadProyectoData(projectId) {
    try {
        const response = await fetch('./modules/sidebar/data/proyectos.json');
        if (!response.ok) throw new Error('No se pudo cargar');
        const data = await response.json();
        proyectoData = data.projects || [];
        const project = proyectoData.find(p => p.id === projectId);
        if (project) {
            proyectoActual = project;
            paginaActual = 0;
            return true;
        }
        return false;
    } catch (err) {
        return false;
    }
}

export async function renderMobileProyectoDetalle(projectId) {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    const loaded = await loadProyectoData(projectId);
    if (!loaded || !proyectoActual) return;
    
    // Limpiar TODO
    document.querySelectorAll('.mobile-proyectos-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-proyecto-item, .mobile-categoria-item, .mobile-flecha, .mobile-sobremi-content, .mobile-home-content, .mobile-proyecto-detalle-content').forEach(el => el.remove());
    
    // Limpiar celdas
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('div:not(.grid-cell):not(.logo-cell):not(.sidebar-cell)');
        children.forEach(child => {
            if (!child.classList.contains('grid-cell') && 
                !child.classList.contains('logo-cell') && 
                !child.classList.contains('sidebar-cell')) {
                child.remove();
            }
        });
    });
    
    stopRandomAnimations();
    resetGrid(false);
    
    importDesignFromJSON(PROYECTO_DETALLE_DESIGN, () => {
        gridReady = true;
        createDetalleContent();
        // 🔥 CREAR BOTONES DE NAVEGACIÓN MÓVIL
        createMobileNavButtons('proyectos');
        disableInteractions();
    }, true);
}

function updateDetalleContent() {
    if (!gridReady) {
        renderMobileProyectoDetalle(proyectoActual?.id);
        return;
    }
    document.querySelectorAll('.mobile-proyecto-detalle-content, .mobile-flecha').forEach(el => el.remove());
    createDetalleContent();
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

function createDetalleContent() {
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let contentCell = null;
    let leftArrow = null;
    let rightArrow = null;
    let backButton = null;
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) titleCell = cell;
            else if (row === 3 && col === 0) contentCell = cell;
            else if (row === 24 && col === 0) leftArrow = cell;
            else if (row === 24 && col === 10) rightArrow = cell;
            else if (row === 27 && col === 0) backButton = cell;
        }
    });
    
    if (titleCell) {
        const oldTitle = titleCell.querySelector('.mobile-proyecto-detalle-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-proyecto-detalle-content';
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
            font-size: 18px;
            letter-spacing: 6px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(${primaryRGB}, 1),
                         0 0 40px rgba(${primaryRGB}, 0.6),
                         0 0 80px rgba(${primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = proyectoActual.name || 'PROYECTO';
        titleCell.appendChild(title);
    }
    
    if (contentCell) {
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'mobile-proyecto-detalle-content';
        contentWrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 16px 20px;
            pointer-events: auto;
            z-index: 20;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
        `;
        
        const contentInner = document.createElement('div');
        contentInner.style.cssText = `
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            font-size: 11px;
            line-height: 1.8;
            letter-spacing: 0.5px;
            text-shadow: 0 0 10px rgba(${primaryRGB}, 1);
            padding-right: 4px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        const meta = document.createElement('div');
        meta.style.cssText = `
            text-align: center;
            font-size: 11x;
            letter-spacing: 3px;
            color: ${secondaryColor};
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 15);
            border-bottom: 1px solid rgba(${secondaryRGB}, 15);
            padding-bottom: 6px;
        `;
        meta.textContent = `${proyectoActual.category || 'CATEGORÍA'}  ·  ${proyectoActual.year || '2024'}`;
        contentInner.appendChild(meta);
        
        if (proyectoActual.description) {
            const desc = document.createElement('div');
            desc.style.cssText = `
                text-align: justify;
                font-size: 11px;
                line-height: 1.8;
                color: ${primaryColor};
                text-shadow: 0 0 10px rgba(${primaryRGB}, 1);
                padding: 4px 0;
            `;
            desc.textContent = proyectoActual.description;
            contentInner.appendChild(desc);
        }
        
        if (proyectoActual.pages && proyectoActual.pages.length > 0) {
            const currentPage = proyectoActual.pages[paginaActual] || proyectoActual.pages[0];
            
            if (currentPage) {
                if (currentPage.title) {
                    const pageTitle = document.createElement('div');
                    pageTitle.style.cssText = `
                        text-align: center;
                        font-size: 11px;
                        letter-spacing: 4px;
                        font-weight: bold;
                        color: ${secondaryColor};
                        text-shadow: 0 0 20px rgba(${secondaryRGB}, 15);
                        border-top: 1px solid rgba(${secondaryRGB}, 15);
                        padding-top: 6px;
                        margin-top: 4px;
                    `;
                    pageTitle.textContent = currentPage.title;
                    contentInner.appendChild(pageTitle);
                }
                
                if (currentPage.content) {
                    if (Array.isArray(currentPage.content)) {
                        currentPage.content.forEach(item => {
                            const itemEl = renderContentItem(item);
                            if (itemEl) contentInner.appendChild(itemEl);
                        });
                    } else if (typeof currentPage.content === 'string') {
                        const textEl = document.createElement('div');
                        textEl.style.cssText = `
                            font-size: 11px;
                            line-height: 1.8;
                            text-align: justify;
                            color: ${primaryColor};
                            text-shadow: 0 0 10px rgba(${primaryRGB}, 1);
                        `;
                        textEl.textContent = currentPage.content;
                        contentInner.appendChild(textEl);
                    }
                }
                

            }
        } else if (proyectoActual.details) {
            const details = document.createElement('div');
            details.style.cssText = `
                font-size: 11px;
                line-height: 1.8;
                text-align: justify;
                color: ${primaryColor};
                text-shadow: 0 0 10px rgba(${primaryRGB}, 1);
            `;
            details.textContent = proyectoActual.details;
            contentInner.appendChild(details);
        }
        
        contentWrapper.appendChild(contentInner);
        contentCell.appendChild(contentWrapper);
    }
    
    const hasPages = proyectoActual.pages && proyectoActual.pages.length > 0;
    createArrow(leftArrow, '◀', paginaActual > 0, () => {
        if (paginaActual > 0) {
            paginaActual--;
            updateDetalleContent();
        }
    });
    
    createArrow(rightArrow, '▶', hasPages && paginaActual < proyectoActual.pages.length - 1, () => {
        if (hasPages && paginaActual < proyectoActual.pages.length - 1) {
            paginaActual++;
            updateDetalleContent();
        }
    });
    
    if (backButton) {
        const back = document.createElement('div');
        back.className = 'mobile-proyecto-detalle-content';
        back.style.cssText = `
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
            font-size: 12px;
            letter-spacing: 4px;
            text-transform: uppercase;
            cursor: pointer;
            pointer-events: auto;
            z-index: 25;
            border: 1px solid rgba(${primaryRGB}, 0.2);
            border-radius: 4px;
            background: rgba(0, 0, 0, 0.3);
            transition: all 0.3s ease;
            text-shadow: 0 0 20px rgba(${primaryRGB}, 0.3);
        `;
        back.textContent = '◀ VOLVER';
        
        back.addEventListener('mouseenter', () => {
            back.style.borderColor = secondaryColor;
            back.style.color = secondaryColor;
            back.style.textShadow = `0 0 30px rgba(${secondaryRGB}, 0.4)`;
            back.style.background = `rgba(${secondaryRGB}, 0.05)`;
        });
        
        back.addEventListener('mouseleave', () => {
            back.style.borderColor = `rgba(${primaryRGB}, 0.2)`;
            back.style.color = primaryColor;
            back.style.textShadow = `0 0 20px rgba(${primaryRGB}, 0.3)`;
            back.style.background = 'rgba(0, 0, 0, 0.3)';
        });
        
        back.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            volverAProyectos();
        });
        
        backButton.appendChild(back);
    }
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
            textEl.style.cssText = `
                font-size: 10px;
                letter-spacing: 0.5px;
                line-height: 1.8;
                color: ${CONFIG.COLORS.primary};
                text-shadow: 0 0 10px rgba(${CONFIG.COLORS.primaryRGB}, 1);
                text-align: justify;
            `;
            textEl.textContent = item.value;
            container.appendChild(textEl);
            break;
            
        case 'link':
            const linkEl = document.createElement('a');
            linkEl.href = item.value;
            linkEl.textContent = item.label || item.value;
            linkEl.target = '_blank';
            linkEl.style.cssText = `
                color: ${CONFIG.COLORS.primary};
                font-size: 10px;
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
                border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 1);
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
                    font-size: 11px;
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
                gap: 6px;
                width: 100%;
                margin-top: 4px;
            `;
            if (Array.isArray(item.value)) {
                item.value.forEach(imgSrc => {
                    const imgContainer = document.createElement('div');
                    imgContainer.style.cssText = `
                        border-radius: 4px;
                        overflow: hidden;
                        border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 1);
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
                    imgContainer.addEventListener('click', () => {
                        showImageLightbox(imgSrc);
                    });
                    galleryWrap.appendChild(imgContainer);
                });
            }
            container.appendChild(galleryWrap);
            break;
            
        default:
            return null;
    }
    
    return container;
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
        box-shadow: 0 0 60px rgba(var(--color-primary-rgb), 1);
    `;
    
    lightbox.appendChild(img);
    lightbox.addEventListener('click', () => {
        lightbox.remove();
    });
    
    document.body.appendChild(lightbox);
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
        font-size: 32px;
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

export function getProyectoDetalleDesign() {
    return PROYECTO_DETALLE_DESIGN;
}