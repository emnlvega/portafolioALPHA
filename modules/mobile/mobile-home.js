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
        tiny: 8,
        extraTiny: 6
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

function toggleMobileSimpleMode() {
    const currentState = localStorage.getItem('simple_mode_state') === 'true';
    const newState = !currentState;
    
    localStorage.setItem('simple_mode_state', newState ? 'true' : 'false');
    
    import('../simpleMode.js').then(module => {
        if (newState) {
            module.applySimpleModeMobile();
        } else {
            module.applyArtisticModeMobile();
        }
    });
    
    setTimeout(() => {
        window.location.reload();
    }, 200);
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
    let modeButtonCell = null;
    let projectCells = [];
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) {
                titleCell = cell;
            }
            else if (row === 22 && col === 0) {
                modeButtonCell = cell;
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
    

    if (modeButtonCell) {
        modeButtonCell.dataset.isSidebar = 'true';
        const oldContent = modeButtonCell.querySelector('.mobile-home-content');
        if (oldContent) oldContent.remove();
        
        const isSimpleMode = localStorage.getItem('simple_mode_state') === 'true';
        const mobileHomeTexts = d.mobile?.home || {};
        
        const mainText = isSimpleMode ? mobileHomeTexts.modoArtistico : mobileHomeTexts.modoSimple;
        const helpText = isSimpleMode ? mobileHomeTexts.altoRendimiento : mobileHomeTexts.bajoRendimiento;
        
        const btn = document.createElement('div');
        btn.className = 'mobile-home-content';
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
                cursor: pointer;
                pointer-events: auto;
                z-index: 25;
                font-family: 'Courier New', monospace;
                color: ${secondaryColor};
                font-size: ${textSizes.small + 2}px;

                text-transform: uppercase;
                text-shadow: 0 0 20px rgba(${secondaryRGB}, 1),
                            0 0 40px rgba(${secondaryRGB}, 0.6),
                            0 0 80px rgba(${secondaryRGB}, 0.3);
                transition: all 0.3s ease;
                background: rgba(0,0,0,0.2);
                border: 1px solid rgba(${secondaryRGB}, 0.2);
                border-radius: 4px;
                padding: 4px 8px;
                user-select: none;
            `;
            
            const mainTextEl = document.createElement('span');
            mainTextEl.textContent = mainText;
            mainTextEl.style.cssText = `
                font-size: ${textSizes.subTitle}px;
                letter-spacing: (${textSizes.medium})px;
                font-weight: bold;
            `;
            btn.appendChild(mainTextEl);
            
            const helpTextEl = document.createElement('span');
            helpTextEl.textContent = helpText;
            helpTextEl.style.cssText = `
                font-size: ${textSizes.small}px;
                color: ${primaryColor};
                opacity: 1;
                margin-top: 0px;
            `;
            btn.appendChild(helpTextEl);
        
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            
            const overlay = document.getElementById('overlay-container');
            if (overlay) overlay.style.display = 'none';
            
            toggleMobileSimpleMode();
        });
        
        modeButtonCell.appendChild(btn);
    }

    const menuButtonCell = Array.from(allCells).find(cell => {
    if (cell.dataset.combined === 'true') {
        const row = parseInt(cell.dataset.designRow);
        const col = parseInt(cell.dataset.designCol);
        return row === 22 && col === 10;
    }
    return false;
});

if (menuButtonCell) {
    menuButtonCell.dataset.isSidebar = 'true';
    const oldContent = menuButtonCell.querySelector('.mobile-home-content');
    if (oldContent) oldContent.remove();

    const mobileHomeTexts = d.mobile?.home || {};
    const helpText = mobileHomeTexts.helpTextMENU || '';
    
    const btn = document.createElement('div');
    btn.className = 'mobile-home-content';
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
        cursor: pointer;
        pointer-events: auto;
        z-index: 25;
        font-family: 'Courier New', monospace;
        color: ${secondaryColor};
        font-size: ${textSizes.small + 2}px;

        text-transform: uppercase;
        text-shadow: 0 0 20px rgba(${secondaryRGB}, 1),
                    0 0 40px rgba(${secondaryRGB}, 0.6),
                    0 0 80px rgba(${secondaryRGB}, 0.3);
        transition: all 0.3s ease;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(${secondaryRGB}, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        user-select: none;
    `;
    
    const mainText = document.createElement('span');
    mainText.textContent = 'MENÚ';
    mainText.style.cssText = `
        font-size: ${textSizes.subTitle}px;
        letter-spacing: (${textSizes.medium})px;
        font-weight: bold;
    `;
    btn.appendChild(mainText);

    if (helpText) {
        const helpTextSpan = document.createElement('span');
        helpTextSpan.textContent = helpText;
        helpTextSpan.style.cssText = `
            font-size: ${textSizes.small}px;
            color: ${primaryColor};
            opacity: 1;
            margin-top: 0px;
        `;
        btn.appendChild(helpTextSpan);
    }
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const overlay = document.getElementById('overlay-container');
        if (overlay) overlay.style.display = 'none';
        
        import('../settings.js').then(module => {
            if (typeof module.openSettingsMobile === 'function') {
                module.openSettingsMobile();
            } else {
                module.toggleSettings();
                setTimeout(() => {
                    const commandsPanel = document.querySelector('#settings-dialog > div:last-child');
                    if (commandsPanel) {
                        commandsPanel.style.display = 'none';
                    }
                }, 50);
            }
        });
    });
    
    menuButtonCell.appendChild(btn);
}

if (menuButtonCell) {
    const oldContent = menuButtonCell.querySelector('.mobile-home-content');
    if (oldContent) oldContent.remove();

    const mobileHomeTexts = d.mobile?.home || {};
    const helpText = mobileHomeTexts.helpTextMENU || '';
    
    const btn = document.createElement('div');
    btn.className = 'mobile-home-content';
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
        cursor: pointer;
        pointer-events: auto;
        z-index: 25;
        font-family: 'Courier New', monospace;
        color: ${secondaryColor};
        font-size: ${textSizes.small + 2}px;

        text-transform: uppercase;
        text-shadow: 0 0 20px rgba(${secondaryRGB}, 1),
                    0 0 40px rgba(${secondaryRGB}, 0.6),
                    0 0 80px rgba(${secondaryRGB}, 0.3);
        transition: all 0.3s ease;
        background: rgba(0,0,0,0.2);
        border: 1px solid rgba(${secondaryRGB}, 0.2);
        border-radius: 4px;
        padding: 4px 8px;
        user-select: none;
    `;
    
    const mainText = document.createElement('span');
    mainText.textContent = 'MENÚ';
    mainText.style.cssText = `
        font-size: ${textSizes.subTitle}px;
        letter-spacing: (${textSizes.subTitle})px;
        font-weight: bold;
    `;
    btn.appendChild(mainText);

    if (helpText) {
        const helpTextSpan = document.createElement('span');
        helpTextSpan.textContent = helpText;
        helpTextSpan.style.cssText = `
            font-size: ${textSizes.small}px;
            color: ${primaryColor};
            opacity: 1;
            margin-top: 0px;
        `;
        btn.appendChild(helpTextSpan);
    }

    
    btn.addEventListener('mouseenter', () => {
        btn.style.borderColor = secondaryColor;
        btn.style.background = `rgba(${secondaryRGB}, 0.08)`;
        btn.style.boxShadow = `0 0 30px rgba(${secondaryRGB}, 0.1)`;
    });
    
    btn.addEventListener('mouseleave', () => {
        btn.style.borderColor = `rgba(${secondaryRGB}, 0.2)`;
        btn.style.background = `rgba(0,0,0,0.2)`;
        btn.style.boxShadow = 'none';
    });
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        e.preventDefault();
        
        const overlay = document.getElementById('overlay-container');
        if (overlay) overlay.style.display = 'none';
        
        import('../settings.js').then(module => {
            if (typeof module.openSettingsMobile === 'function') {
                module.openSettingsMobile();
            } else {
                module.toggleSettings();
                setTimeout(() => {
                    const commandsPanel = document.querySelector('#settings-dialog > div:last-child');
                    if (commandsPanel) {
                        commandsPanel.style.display = 'none';
                    }
                }, 50);
            }
        });
    });
    
    menuButtonCell.appendChild(btn);
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