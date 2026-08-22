import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';
import { designCells } from '../interactions.js';

let dicc = null;
let proyectosData = null;
let mobileLettersImage = null;

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

function applyColorToMobileImage(img, color) {
    const r = parseInt(color.substr(1, 2), 16);
    const g = parseInt(color.substr(3, 2), 16);
    const b = parseInt(color.substr(5, 2), 16);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const tempImg = new Image();
    tempImg.crossOrigin = 'anonymous';
    tempImg.onload = function() {
        canvas.width = tempImg.width;
        canvas.height = tempImg.height;
        
        ctx.drawImage(tempImg, 0, 0);
        
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        img.src = canvas.toDataURL();
    };
    tempImg.src = img.src;
}

function createMobileLettersImage() {
    const container = document.getElementById('grid-container');
    if (!container) return null;
    
    removeMobileLettersImage();
    
    const img = document.createElement('img');
    img.src = './assets/images/lettersM.png';
    img.style.position = 'absolute';
    img.style.width = 'auto';
    img.style.height = 'auto';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.zIndex = '99999';
    img.style.opacity = '1';
    img.style.pointerEvents = 'none';
    img.id = 'mobile-letters-image';
    
    const cell = designCells.find(c => 
        parseInt(c.dataset.designRow) === 10 && 
        parseInt(c.dataset.designCol) === 4
    );
    
    if (cell) {
        const x = parseFloat(cell.dataset.originalX) || parseFloat(cell.style.left);
        const y = parseFloat(cell.dataset.originalY) || parseFloat(cell.style.top);
        img.style.left = `${x}px`;
        img.style.top = `${y}px`;
        img.style.transform = 'none';
    } else {
        img.style.left = '0';
        img.style.top = '0';
        img.style.transform = 'none';
    }
    
    container.appendChild(img);
    
    applyColorToMobileImage(img, CONFIG.COLORS.secondary);
    
    return img;
}

function removeMobileLettersImage() {
    const existingImage = document.getElementById('mobile-letters-image');
    if (existingImage) {
        existingImage.remove();
    }
    mobileLettersImage = null;
}

export async function renderMobileHome() {
    await loadDicc();
    await loadProyectosData();
    
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    document.querySelectorAll('.mobile-home-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-home-proyecto').forEach(el => el.remove());
    
    mobileLettersImage = createMobileLettersImage();
    
    fetch('./modules/mobile/logo-movil.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return response.json();
        })
        .then(design => {
            stopRandomAnimations();
            resetGrid(false);
            
            importDesignFromJSON(design, () => {
                createHomeContent();
                createMobileNavButtons('inicio');
            }, true);
        })
        .catch(() => {
            stopRandomAnimations();
            resetGrid(false);
            importDesignFromJSON({}, () => {
                createHomeContent();
                createMobileNavButtons('inicio');
            }, true);
        });
}

function createHomeContent() {
    const d = dicc || { mobile: { nav: {} } };
    const mobileNav = d.mobile.nav || {};
    const scriptTexts = d.script || {};
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let proyectosDestCell = null;
    let projectCells = [];
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) {
                titleCell = cell;
            }
            else if (row === 22 && col === 0) {
                proyectosDestCell = cell;
            }
            else if (row === 25 && (col === 0 || col === 6 || col === 14)) {
                projectCells.push({ cell, row, col, index: projectCells.length });
            }
        }
    });
    
    projectCells.sort((a, b) => a.index - b.index);
    
    if (titleCell) {
        const oldTitle = titleCell.querySelector('.mobile-home-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-home-content';
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
            font-size: ${textSizes.small + 6}px;
            letter-spacing: ${textSizes.tiny + 4}px;
            text-transform: uppercase;
            text-shadow: 0 0 30px rgba(${primaryRGB}, 1),
                        0 0 40px rgba(${primaryRGB}, 1),
                        0 0 80px rgba(${primaryRGB}, 1);
            pointer-events: none;
            z-index: 20;
            user-select: none;
            text-align: center;
            padding: 0 10px;
            word-wrap: break-word;
            line-height: 1.2;
        `;
        title.textContent = scriptTexts.bienvenido;
        titleCell.appendChild(title);
    }
    
    if (proyectosDestCell) {
        const oldTitle = proyectosDestCell.querySelector('.mobile-home-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-home-content';
        title.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${secondaryColor};
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.subTitle}px;
            letter-spacing: ${letterSpacing.subTitle}px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 1),
                         0 0 40px rgba(${secondaryRGB}, 0.6),
                         0 0 80px rgba(${secondaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = mobileNav.proyectosDest;
        proyectosDestCell.appendChild(title);
    }
    
    if (proyectosData && proyectosData.projects) {
    const shuffled = [...proyectosData.projects].sort(() => Math.random() - 0.5).slice(0, 3);
    
    projectCells.forEach(({ cell }, index) => {
        const project = shuffled[index];
        
        if (!project) {
            const empty = document.createElement('div');
            empty.className = 'mobile-home-proyecto';
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
        
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-home-proyecto';
        wrapper.dataset.projectId = project.id;
        wrapper.style.cssText = `
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
            z-index: 20;
            overflow: hidden;
            transition: all 0.3s ease;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.15);
            background: rgba(0, 0, 0, 0.3);
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
        `;
        
        const bgImg = document.createElement('img');
        bgImg.src = `https://picsum.photos/seed/${project.name.replace(/\s/g, '')}/600/400`;
        bgImg.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            opacity: 0.6;
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
            color: #ffffff;
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 2}px;
            letter-spacing: ${letterSpacing.small + 1}px;
            font-weight: bold;
            text-transform: uppercase;
            text-shadow: 0 0 10px rgba(255, 255, 255, 1),
                         0 0 20px rgba(255, 255, 255, 0.8),
                         0 0 40px rgba(255, 255, 255, 0.5),
                         0 0 60px rgba(255, 255, 255, 0.3),
                         0 0 80px rgba(0, 0, 0, 0.5);
            text-align: center;
            padding: 10px;
            pointer-events: none;
            user-select: none;
        `;
        title.textContent = project.name;
        wrapper.appendChild(title);
        
        wrapper.addEventListener('mouseenter', () => {
            wrapper.style.boxShadow = `0 0 30px rgba(${primaryRGB}, 0.3)`;
            wrapper.style.borderColor = `rgba(255, 255, 255, 0.4)`;
            bgImg.style.opacity = '0.8';
            bgImg.style.transform = 'scale(1.05)';
            title.style.textShadow = `0 0 15px rgba(255, 255, 255, 1),
                                      0 0 30px rgba(255, 255, 255, 0.8),
                                      0 0 60px rgba(255, 255, 255, 0.5),
                                      0 0 80px rgba(0, 0, 0, 0.6)`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.boxShadow = `0 0 20px rgba(0, 0, 0, 0.2)`;
            wrapper.style.borderColor = `rgba(255, 255, 255, 0.15)`;
            bgImg.style.opacity = '0.6';
            bgImg.style.transform = 'scale(1)';
            title.style.textShadow = `0 0 10px rgba(255, 255, 255, 1),
                                      0 0 20px rgba(255, 255, 255, 0.8),
                                      0 0 40px rgba(255, 255, 255, 0.5),
                                      0 0 60px rgba(255, 255, 255, 0.3),
                                      0 0 80px rgba(0, 0, 0, 0.5)`;
        });
        
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof window.openProyectoDetalle === 'function') {
                window.openProyectoDetalle(project.id);
            } else {
                import('./mobile-nav.js').then(module => {
                    module.openProyectoDetalle(project.id);
                });
            }
        });
        
        cell.appendChild(wrapper);
    });
}
}

export function removeMobileHomeLetters() {
    removeMobileLettersImage();
}

document.addEventListener('colorsUpdated', function(e) {
    const { colors } = e.detail;
    const existingImage = document.getElementById('mobile-letters-image');
    if (existingImage) {
        applyColorToMobileImage(existingImage, colors.primary);
    }
});