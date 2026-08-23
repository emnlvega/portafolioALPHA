import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

let dicc = null;
let sobreMiData = null;

const SOBRE_MI_DESIGN = {
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
    "width": 109,
    "height": 261,
    "combined": true
  },
  "3,6": {
    "type": "combined_normal",
    "left": 886.5,
    "top": 183.5,
    "width": 261,
    "height": 261,
    "combined": true
  },
  "17,0": {
    "type": "combined_normal",
    "left": 772.5,
    "top": 449.5,
    "width": 375,
    "height": 242,
    "combined": true
  }
};

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

async function loadSobreMiData() {
    if (sobreMiData) return sobreMiData;
    try {
        const response = await fetch('./modules/sidebar/data/sobre-mi.json');
        sobreMiData = await response.json();
        return sobreMiData;
    } catch (e) {
        console.error('Error loading sobre-mi data:', e);
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

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

export async function renderMobileSobreMi() {
    await loadDicc();
    await loadSobreMiData();
    
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    document.querySelectorAll('.mobile-sobremi-content, .mobile-nav-btn, .mobile-btn-overlay').forEach(el => el.remove());
    
    stopRandomAnimations();
    resetGrid(false);
    
    importDesignFromJSON(SOBRE_MI_DESIGN, () => {
        createSobreMiContent();
        createMobileNavButtons('sobre-mi');
        disableInteractions();
    }, true);
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

function createSobreMiContent() {
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    const content = sobreMiData.content;
    const d = dicc || { mobile: { sobremi: {} } };
    const sobremiTexts = d.mobile.sobremi || {};
    
    const LIGHT_TEXT_SHADOW = `0 0 7px rgba(${primaryRGB}, 1)`;
    const LIGHT_TEXT_SHADOW_ACTIVE = `0 0 15px rgba(${primaryRGB}, 1)`;
    const LIGHT_TEXT_SHADOW_HOVER = `0 0 15px rgba(${primaryRGB}, 1)`;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let photoCell = null;
    let bioCell = null;
    let infoCell = null;
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            if (row === 0 && col === 0) titleCell = cell;
            else if (row === 3 && col === 0) photoCell = cell;
            else if (row === 3 && col === 6) bioCell = cell;
            else if (row === 17 && col === 0) infoCell = cell;
        }
    });
    
    if (titleCell) {
        const oldTitle = titleCell.querySelector('.mobile-sobremi-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-sobremi-content';
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
            font-size: ${textSizes.normalTitle}px;
            letter-spacing: ${letterSpacing.subTitle + 2}px;
            text-transform: uppercase;
            text-shadow: ${LIGHT_TEXT_SHADOW};
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = sobreMiData.title;
        titleCell.appendChild(title);
    }
    
    if (photoCell) {
        const photoWrapper = document.createElement('div');
        photoWrapper.className = 'mobile-sobremi-content';
        photoWrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            pointer-events: none;
            z-index: 20;
            overflow: hidden;
            background: rgba(0,0,0,0.3);
            border-radius: 4px;
            border: 1px solid rgba(${primaryRGB}, 0.1);
        `;
        
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
        `;
        
        const img1 = document.createElement('img');
        img1.src = content.photo1;
        img1.alt = 'Emanuel Vega';
        img1.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.05s ease-in-out;
            opacity: 1;
            filter: grayscale(1) brightness(1.1) contrast(1.1);
        `;
        imgContainer.appendChild(img1);
        
        const colorOverlay = document.createElement('div');
        colorOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: ${primaryColor};
            mix-blend-mode: color;
            pointer-events: none;
            transition: opacity 0.05s ease-in-out;
            opacity: 1;
        `;
        imgContainer.appendChild(colorOverlay);
        
        const img2 = document.createElement('img');
        img2.src = content.photo2;
        img2.alt = 'Emanuel Vega Color';
        img2.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: opacity 0.05s ease-in-out;
            opacity: 0;
        `;
        imgContainer.appendChild(img2);
        
        photoWrapper.appendChild(imgContainer);
        photoCell.appendChild(photoWrapper);
        
        let glitchTimeout = null;
        let isFirstTransitionDone = false;
        let isUsingYoEdit = true;
        let imageSwitchTimeout = null;
        
        function switchBaseImage() {
            if (isUsingYoEdit) {
                img1.src = content.photo2;
                isUsingYoEdit = false;
            } else {
                img1.src = content.photo1;
                isUsingYoEdit = true;
            }
            img1.style.opacity = '1';
            colorOverlay.style.opacity = '1';
            img2.style.opacity = '0';
            isFirstTransitionDone = false;
            setTimeout(() => {
                doInitialGlitchTransition();
            }, 1000);
        }
        
        function doInitialGlitchTransition() {
            const blinks = 5 + Math.floor(Math.random() * 8);
            let currentBlink = 0;
            function blink() {
                if (currentBlink >= blinks) {
                    img1.style.opacity = '0';
                    colorOverlay.style.opacity = '0';
                    img2.style.opacity = '1';
                    isFirstTransitionDone = true;
                    scheduleNextGlitch();
                    return;
                }
                if (currentBlink % 2 === 0) {
                    img1.style.opacity = '1';
                    colorOverlay.style.opacity = '1';
                    img2.style.opacity = '0';
                } else {
                    img1.style.opacity = '0';
                    colorOverlay.style.opacity = '0';
                    img2.style.opacity = '1';
                }
                currentBlink++;
                const delay = 50 + Math.random() * 250;
                glitchTimeout = setTimeout(blink, delay);
            }
            setTimeout(blink, 200);
        }
        
        function doGlitch() {
            if (!isFirstTransitionDone) return;
            img1.style.opacity = '1';
            colorOverlay.style.opacity = '1';
            img2.style.opacity = '0';
            const glitchDuration = 300 + Math.random() * 4700;
            setTimeout(() => {
                img1.style.opacity = '0';
                colorOverlay.style.opacity = '0';
                img2.style.opacity = '1';
                scheduleNextGlitch();
            }, glitchDuration);
        }
        
        function scheduleNextGlitch() {
            if (glitchTimeout) {
                clearTimeout(glitchTimeout);
                glitchTimeout = null;
            }
            const delay = 3000 + Math.random() * 17000;
            glitchTimeout = setTimeout(() => {
                doGlitch();
            }, delay);
        }
        
        setTimeout(() => {
            doInitialGlitchTransition();
        }, 10000);
        
        imageSwitchTimeout = setTimeout(() => {
            switchBaseImage();
        }, 10000);
        
        function scheduleImageSwitch() {
            if (imageSwitchTimeout) {
                clearTimeout(imageSwitchTimeout);
                imageSwitchTimeout = null;
            }
            const delay = 15000 + Math.random() * 25000;
            imageSwitchTimeout = setTimeout(() => {
                switchBaseImage();
                scheduleImageSwitch();
            }, delay);
        }
        
        setTimeout(() => {
            scheduleImageSwitch();
        }, 12000);
    }
    
    if (bioCell) {
    const bioWrapper = document.createElement('div');
    bioWrapper.className = 'mobile-sobremi-content';
    bioWrapper.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        padding: 12px 16px;
        pointer-events: auto;
        z-index: 20;
        overflow-y: auto;
        overflow-x: hidden;
        -webkit-overflow-scrolling: touch;
        scroll-behavior: smooth;
    `;

    const age = calculateAge('1999-07-29');
    const bioName = content.bioName.replace('%age%', age);

    const nameLine = document.createElement('div');
    nameLine.textContent = bioName;
    nameLine.style.cssText = `
        color: ${primaryColor};
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.medium}px;
        letter-spacing: ${letterSpacing.medium + 1}px;
        font-weight: bold;
        text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
        text-align: center;
        margin-bottom: 8px;
    `;
    bioWrapper.appendChild(nameLine);

    const bioText = document.createElement('div');
    bioText.style.cssText = `
        color: ${secondaryColor};
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.small + 2}px;
        line-height: 1;
        letter-spacing: ${letterSpacing.medium}px;
        text-align: justify;
        text-shadow: ${LIGHT_TEXT_SHADOW};
        padding-right: 0px;
    `;
    bioText.textContent = content.bioText;
    bioWrapper.appendChild(bioText);

    bioCell.appendChild(bioWrapper);
}
    
    if (infoCell) {
        const infoWrapper = document.createElement('div');
        infoWrapper.className = 'mobile-sobremi-content';
        infoWrapper.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 12px 16px;
            pointer-events: auto;
            z-index: 20;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            scroll-behavior: smooth;
        `;
        
        const infoContent = document.createElement('div');
        infoContent.style.cssText = `
            color: ${secondaryColor};
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small}px;
            line-height: 1;
            letter-spacing: ${letterSpacing.medium}px;
            text-shadow: ${LIGHT_TEXT_SHADOW};
            padding-right: 4px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        const habilidadesTitle = document.createElement('div');
        habilidadesTitle.textContent = sobremiTexts.skillsTitle || ' ';
        habilidadesTitle.style.cssText = `
            color: ${primaryColor};
            font-size: ${textSizes.small + 1}px;
            letter-spacing: ${letterSpacing.small + 1.5}px;
            font-weight: bold;
            text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            text-align: center;
            border-bottom: 1px solid rgba(${primaryRGB}, 1);
            padding-bottom: 4px;
        `;
        infoContent.appendChild(habilidadesTitle);
        
        const habilidadesGrid = document.createElement('div');
habilidadesGrid.style.cssText = `
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 6px 8px;
    margin-bottom: 6px;
    width: 100%;
`;

const skills = content.skills || [];
skills.forEach((h) => {
    const item = document.createElement('div');
    const isLong = h.name && h.name.length > 18;
    
    item.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0;
        font-size: ${isLong ? textSizes.tiny : textSizes.tiny + 1}px;
        letter-spacing: ${isLong ? letterSpacing.tiny - 0.5 : letterSpacing.tiny}px;
        color: ${secondaryColor};
        text-shadow: ${LIGHT_TEXT_SHADOW};
        transition: all 0.2s ease;
        cursor: default;
        font-family: 'Courier New', monospace;
        text-transform: uppercase;
        position: relative;
        grid-column: ${isLong ? '1 / -1' : 'auto'};
        width: 100%;
    `;
    
    const iconBox = document.createElement('div');
    iconBox.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 20px;
        background: rgba(${primaryRGB}, 1);
        border-radius: 4px 0 0 4px;
        color: ${CONFIG.COLORS.background};
        text-shadow: none;
        font-size: ${textSizes.small + 2}px;
        flex-shrink: 0;
        transition: all 0.2s ease;
        border: 1px solid rgba(${primaryRGB}, 0.5);
        box-shadow: 0 0 20px rgba(${primaryRGB}, 0.5);
    `;
    iconBox.textContent = h.icon || '◆';
    
    const nameBox = document.createElement('div');
    nameBox.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 6px;
        height: 20px;
        background: rgba(${primaryRGB}, 0.1);
        border-radius: 0 4px 4px 0;
        color: ${secondaryColor};
        text-shadow: ${LIGHT_TEXT_SHADOW};
        font-size: ${isLong ? textSizes.tiny : textSizes.tiny + 1}px;
        letter-spacing: ${letterSpacing.tiny}px;
        flex: 1;
        transition: all 0.2s ease;
        border: 1px solid rgba(${primaryRGB}, 0.5);
        box-shadow: 0 0 20px rgba(${primaryRGB}, 0.2);
        text-align: center;
    `;
    nameBox.textContent = h.name || h;
    item.appendChild(iconBox);
    item.appendChild(nameBox);
    
    item.addEventListener('mouseenter', () => {
        iconBox.style.background = `rgba(${secondaryRGB}, 0.7)`;
        iconBox.style.borderColor = secondaryColor;
        iconBox.style.color = CONFIG.COLORS.background;
        iconBox.style.textShadow = `0 0 10px ${secondaryColor}`;
        nameBox.style.background = `rgba(${secondaryRGB}, 0.1)`;
        nameBox.style.borderColor = secondaryColor;
        nameBox.style.color = primaryColor;
        nameBox.style.textShadow = LIGHT_TEXT_SHADOW_HOVER;
    });
    
    item.addEventListener('mouseleave', () => {
        iconBox.style.background = `rgba(${primaryRGB}, 0.7)`;
        iconBox.style.borderColor = primaryColor;
        iconBox.style.color = CONFIG.COLORS.background;
        iconBox.style.textShadow = 'none';
        nameBox.style.background = `rgba(${primaryRGB}, 0.1)`;
        nameBox.style.borderColor = primaryColor;
        nameBox.style.color = secondaryColor;
        nameBox.style.textShadow = LIGHT_TEXT_SHADOW;
    });
    
    habilidadesGrid.appendChild(item);
});
infoContent.appendChild(habilidadesGrid);
        
        const herramientasTitle = document.createElement('div');
        herramientasTitle.textContent = sobremiTexts.toolsTitle || ' ';
        herramientasTitle.style.cssText = `
            color: ${primaryColor};
            font-size: ${textSizes.small + 1}px;
            letter-spacing: ${letterSpacing.small + 1.5}px;
            font-weight: bold;
            text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            text-align: center;
            border-bottom: 1px solid rgba(${primaryRGB}, 1);
            padding-bottom: 4px;
            margin-top: 4px;
        `;
        infoContent.appendChild(herramientasTitle);
        
        const toolsText = document.createElement('div');
        toolsText.style.cssText = `
            font-size: ${textSizes.small + 2}px;
            letter-spacing: ${letterSpacing.medium}px;
            text-align: center;
            padding: 4px 0;
            color: ${secondaryColor};
            text-shadow: ${LIGHT_TEXT_SHADOW};
            line-height: 1.8;
        `;
        const herramientasContent = content.toolsContent || [];
        let toolsHTML = '';
        herramientasContent.forEach(item => {
            if (item.label) {
                toolsHTML += `<div><span style="color:${primaryColor};">${item.label}</span> ${item.items}</div>`;
            } else if (item.note) {
                toolsHTML += `<div style="margin-top:4px; padding-top:6px;line-height: 1; border-top:1px solid ${primaryColor}; font-size: ${textSizes.small + 2}px; letter-spacing:${letterSpacing.tiny}px; color:${secondaryColor}; text-shadow:${LIGHT_TEXT_SHADOW};">${item.note}</div>`;
            }
        });
        toolsText.innerHTML = toolsHTML;
        infoContent.appendChild(toolsText);
        
        const defineTitle = document.createElement('div');
        defineTitle.textContent = sobremiTexts.defineTitle || ' ';
        defineTitle.style.cssText = `
            color: ${primaryColor};
            font-size: ${textSizes.small + 1}px;
            letter-spacing: ${letterSpacing.small + 1.5}px;
            font-weight: bold;
            text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            text-align: center;
            border-bottom: 1px solid rgba(${primaryRGB}, 1);
            padding-bottom: 4px;
            margin-top: 4px;
        `;
        infoContent.appendChild(defineTitle);
        
        const defineItems = content.defineItems || [];
        const defineGrid = document.createElement('div');
        defineGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 2px 8px;
            padding: 4px 0;
        `;
        
        defineItems.forEach(item => {
            const el = document.createElement('div');
            el.style.cssText = `
                font-size: ${textSizes.small + 2}px;
                letter-spacing: ${letterSpacing.medium}px;
                padding: 2px 0;
                color: ${secondaryColor};
                text-shadow: ${LIGHT_TEXT_SHADOW};
                display: flex;
                align-items: center;
                justify-content: center;
                text-align: center;
            `;
            
            if (typeof item === 'string' && item.includes('gusto musical')) {
                el.style.gridColumn = '1 / -1';
                const playlistLink = content.playlistLink || ' ';
                const playlistText = content.playlistText || ' ';
                el.innerHTML = `◆ Mi genial gusto musical, <a href="${playlistLink}" target="_blank" style="color:${secondaryColor}; text-shadow:${LIGHT_TEXT_SHADOW}; text-decoration:underline; text-underline-offset:2px; transition:all 0.3s ease; cursor:pointer; pointer-events:auto;" onmouseenter="this.style.color='${primaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW_HOVER}';" onmouseleave="this.style.color='${secondaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW}';">${playlistText}</a>`;
            } else if (typeof item === 'string') {
                el.textContent = item;
            } else {
                el.textContent = item.name || item;
            }
            
            defineGrid.appendChild(el);
        });
        infoContent.appendChild(defineGrid);
        
        
        infoWrapper.appendChild(infoContent);
        infoCell.appendChild(infoWrapper);
    }
}

export function getMobileSobreMiDesign() {
    return SOBRE_MI_DESIGN;
}