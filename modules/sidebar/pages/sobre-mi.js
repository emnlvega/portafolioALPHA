import { CONFIG } from '../../config.js';
import { importDesignFromJSON } from '../../logo.js';
import { resetGrid } from '../../interactions.js';
import { stopRandomAnimations, restartRandomAnimations } from '../../animations.js';
import { isTransitioningCheck } from '../index.js';

let sobreMiData = null;
let retryCountSobreMi = 0;
const MAX_RETRIES = 3;
let photoTimeout = null;
let textureWasVisibleBefore = true;
let isRendering = false;

const LIGHT_TEXT_SHADOW = `0 0 7px rgba(var(--color-primary-rgb), 1)`;
const LIGHT_TEXT_SHADOW_ACTIVE = `0 0 15px rgba(var(--color-secondary-rgb), 1)`;
const LIGHT_TEXT_SHADOW_HOVER = `0 0 15px rgba(var(--color-secondary-rgb), 1)`;

function getTextSizes() {
    return CONFIG.TEXT_SIZES || {
        title: 32,
        arrows: 28,
        projectIcon: 24,
        normalTitle: 20,
        subTitle: 16,
        medium: 12,
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
        medium: 1.8,
        small: 1.6,
        tiny: 1.4
    };
}

export async function loadSobreMiData() {
    if (sobreMiData) return sobreMiData;
    try {
        const response = await fetch(new URL('../data/sobre-mi.json', import.meta.url));
        const data = await response.json();
        sobreMiData = data;
        return data;
    } catch (e) {
        console.error('Error loading sobre-mi data:', e);
        return null;
    }
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

function toggleTextureOverlay(show) {
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

export function getSobreMiDesign() {
    return loadSobreMiData().then(data => data.design);
}

export function clearSobreMiState() {
    const textureEnabled = getTextureVisibilityFromSettings();
    if (textureEnabled) {
        toggleTextureOverlay(true);
    } else {
        toggleTextureOverlay(false);
    }
    
    const photoCell = document.querySelector('.sobre-mi-content')?.closest?.('.grid-cell, .logo-cell');
    if (photoCell && photoCell._cleanupGlitch) {
        photoCell._cleanupGlitch();
    }
    
    if (photoTimeout) {
        clearTimeout(photoTimeout);
        photoTimeout = null;
    }
}

export async function renderSobreMiContent() {
    if (isRendering) return;
    isRendering = true;
    
    try {
        const data = await loadSobreMiData();
        if (!data) {
            isRendering = false;
            return;
        }
        
        const container = document.getElementById('grid-container');
        if (!container) {
            isRendering = false;
            return;
        }
        
        const textSizes = getTextSizes();
        const letterSpacing = getLetterSpacing();
        const lineHeight = getLineHeight();
        const primaryColor = CONFIG.COLORS.primary;
        const secondaryColor = CONFIG.COLORS.secondary;
        const primaryRGB = CONFIG.COLORS.primaryRGB;
        const secondaryRGB = CONFIG.COLORS.secondaryRGB;
        
        textureWasVisibleBefore = getTextureVisibilityFromSettings();
        toggleTextureOverlay(false);
        
        document.querySelectorAll('.sobre-mi-content').forEach(el => el.remove());
        
        const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
        allCells.forEach(cell => {
            const children = cell.querySelectorAll('.sobre-mi-content');
            children.forEach(child => child.remove());
        });
        
        const cells = container.querySelectorAll('.grid-cell, .logo-cell');
        
        let titleCell = null;
        let photoCell = null;
        let bioCell = null;
        let skillsCell = null;
        let toolsCell = null;
        let defineCell = null;
        
        for (const cell of cells) {
            if (cell.dataset.combined === 'true') {
                const row = parseInt(cell.dataset.designRow);
                const col = parseInt(cell.dataset.designCol);
                if (row === 0 && col === 0) titleCell = cell;
                else if (row === 2 && col === 0) photoCell = cell;
                else if (row === 2 && col === 5) bioCell = cell;
                else if (row === 10 && col === 0) skillsCell = cell;
                else if (row === 10 && col === 16) toolsCell = cell;
                else if (row === 14 && col === 0) defineCell = cell;
            }
        }
        
        if (!titleCell || !photoCell || !bioCell || !skillsCell || !toolsCell || !defineCell) {
            if (retryCountSobreMi < MAX_RETRIES) {
                retryCountSobreMi++;
                isRendering = false;
                setTimeout(() => renderSobreMiContent(), 100);
                return;
            }
            isRendering = false;
            return;
        }
        retryCountSobreMi = 0;
        
        if (titleCell) {
            const title = document.createElement('div');
            title.className = 'sobre-mi-content';
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
            title.textContent = data.title;
            titleCell.appendChild(title);
        }
        
        if (photoCell) {
            if (photoTimeout) {
                clearTimeout(photoTimeout);
                photoTimeout = null;
            }
            
            const photoWrapper = document.createElement('div');
            photoWrapper.className = 'sobre-mi-content';
            photoWrapper.style.cssText = `
                position: absolute;
                top: 1%;
                left: 2%;
                width: 96%;
                height: 98%;
                opacity: 100;
                display: flex;
                z-index: 20;
                overflow: hidden;
                background: rgba(0,0,0,0.3);
            `;
            
            const imgContainer = document.createElement('div');
            imgContainer.style.cssText = `
                position: relative;
                width: 100%;
                height: 100%;
            `;
            
            const img1 = document.createElement('img');
            img1.src = data.content.photo1;
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
            
            const img2 = document.createElement('img');
            img2.src = data.content.photo2;
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
            
            imgContainer.appendChild(img1);
            imgContainer.appendChild(colorOverlay);
            imgContainer.appendChild(img2);
            photoWrapper.appendChild(imgContainer);
            photoCell.appendChild(photoWrapper);
            
            let glitchTimeout = null;
            let isGlitching = false;
            let isFirstTransitionDone = false;
            let initialGlitchTimeout = null;
            
            function doInitialGlitchTransition() {
                const blinks = 5 + Math.floor(Math.random() * 8);
                let currentBlink = 0;
                
                function blink() {
                    if (currentBlink >= blinks) {
                        img1.style.opacity = '0';
                        colorOverlay.style.opacity = '0';
                        img2.style.opacity = '1';
                        isFirstTransitionDone = true;
                        initialGlitchTimeout = null;
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
                    initialGlitchTimeout = setTimeout(blink, delay);
                }
                
                setTimeout(blink, 200);
            }
            
            function doGlitch() {
                if (isGlitching || !isFirstTransitionDone) return;
                isGlitching = true;
                
                img1.style.opacity = '1';
                colorOverlay.style.opacity = '1';
                img2.style.opacity = '0';
                
                const glitchDuration = 300 + Math.random() * 4700;
                setTimeout(() => {
                    img1.style.opacity = '0';
                    colorOverlay.style.opacity = '0';
                    img2.style.opacity = '1';
                    isGlitching = false;
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
            
            photoTimeout = setTimeout(() => {
                doInitialGlitchTransition();
                photoTimeout = null;
            }, 2000);
            
            const cleanupGlitch = () => {
                if (glitchTimeout) {
                    clearTimeout(glitchTimeout);
                    glitchTimeout = null;
                }
                if (initialGlitchTimeout) {
                    clearTimeout(initialGlitchTimeout);
                    initialGlitchTimeout = null;
                }
            };
            
            photoCell._cleanupGlitch = cleanupGlitch;
        }
        
        if (bioCell) {
            const bio = document.createElement('div');
            bio.className = 'sobre-mi-content';
            bio.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 25px 40px;
                color: ${primaryColor};
                font-family: 'Courier New', monospace;
                pointer-events: none;
                z-index: 20;
                overflow-y: auto;
                text-align: center;
            `;
            
            const bioTitle = document.createElement('div');
            bioTitle.textContent = data.content.bioTitle;
            bioTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle}px;
                font-weight: bold;
                margin-bottom: 6px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            bio.appendChild(bioTitle);
            
            const age = calculateAge('1999-07-29');
            const nameLine = document.createElement('div');
            nameLine.textContent = data.content.bioName.replace('%age%', age);
            nameLine.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle * 0.5}px;
                font-weight: bold;
                margin-bottom: 12px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            bio.appendChild(nameLine);
            
            const bioText = document.createElement('div');
            bioText.style.cssText = `
                font-size: ${textSizes.big}px;
                line-height: ${lineHeight.medium};
                letter-spacing: ${letterSpacing.big}px;
                max-width: 90%;
                text-align: justify;
                color: ${primaryColor};
                text-shadow: ${LIGHT_TEXT_SHADOW};
            `;
            bioText.textContent = data.content.bioText;
            bio.appendChild(bioText);
            
            const styleScroll = document.createElement('style');
            styleScroll.textContent = `
                .sobre-mi-content::-webkit-scrollbar {
                    width: 4px;
                }
                .sobre-mi-content::-webkit-scrollbar-track {
                    background: transparent;
                }
                .sobre-mi-content::-webkit-scrollbar-thumb {
                    background: rgba(${primaryRGB}, 0.3);
                    border-radius: 2px;
                }
                .sobre-mi-content::-webkit-scrollbar-thumb:hover {
                    background: rgba(${primaryRGB}, 0.6);
                }
            `;
            document.head.appendChild(styleScroll);
            
            bioCell.appendChild(bio);
        }
        
        if (skillsCell) {
            const skills = document.createElement('div');
            skills.className = 'sobre-mi-content';
            skills.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 15px 25px;
                pointer-events: none;
                z-index: 20;
            `;
            
            const skillsTitle = document.createElement('div');
            skillsTitle.textContent = data.content.skillsTitle;
            skillsTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle}px;
                font-weight: bold;
                margin-bottom: 10px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            skills.appendChild(skillsTitle);
            
            const skillsGrid = document.createElement('div');
            skillsGrid.style.cssText = `
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 5px 12px;
                max-width: 95%;
            `;
            
            data.content.skills.forEach(h => {
                const item = document.createElement('div');
                item.style.cssText = `
                    display: flex;
                    align-items: center;
                    gap: 0;
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    color: ${secondaryColor};
                    text-shadow: ${LIGHT_TEXT_SHADOW};
                    transition: all 0.2s ease;
                    cursor: default;
                    font-family: 'Courier New', monospace;
                    text-transform: uppercase;
                    position: relative;
                `;
                
                const iconBox = document.createElement('div');
                iconBox.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 35px;
                    height: 25px;
                    background: rgba(${primaryRGB}, 1);
                    border-radius: 4px 0 0 4px;
                    color: ${CONFIG.COLORS.background};
                    text-shadow: none;
                    font-size: ${textSizes.projectIcon}px;
                    flex-shrink: 0;
                    transition: all 0.2s ease;
                    border: 1px solid rgba(${primaryRGB}, 0.5);
                    box-shadow: 0 0 20px rgba(${primaryRGB}, 0.5);
                `;
                iconBox.textContent = h.icon;

                const nameBox = document.createElement('div');
                nameBox.style.cssText = `
                    display: flex;
                    align-items: center;
                    padding: 0 10px;
                    height: 25px;
                    background: rgba(${primaryRGB}, 0.1);
                    border-radius: 0 4px 4px 0;
                    color: ${secondaryColor};
                    text-shadow: ${LIGHT_TEXT_SHADOW};
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    flex-grow: 1;
                    transition: all 0.2s ease;
                    white-space: nowrap;
                    border: 1px solid rgba(${primaryRGB}, 0.5);
                    box-shadow: 0 0 20px rgba(${primaryRGB}, 0.2);
                `;
                nameBox.textContent = h.name;
                item.appendChild(iconBox);
                item.appendChild(nameBox);
                
                item.addEventListener('mouseenter', () => {
                    iconBox.style.background = `rgba(${secondaryRGB}, 0.7)`;
                    iconBox.style.borderColor = secondaryColor;
                    iconBox.style.color = CONFIG.COLORS.background;
                    iconBox.style.textShadow = `0 0 10px ${secondaryColor}`;
                    nameBox.style.background = `rgba(${secondaryRGB}, 0.1)`;
                    nameBox.style.borderColor = secondaryColor;
                    nameBox.style.color = secondaryColor;
                    nameBox.style.textShadow = LIGHT_TEXT_SHADOW_HOVER;
                });

                item.addEventListener('mouseleave', () => {
                    iconBox.style.background = `rgba(${primaryRGB}, 0.7)`;
                    iconBox.style.borderColor = primaryColor;
                    iconBox.style.color = CONFIG.COLORS.background;
                    iconBox.style.textShadow = 'none';
                    nameBox.style.background = `rgba(${primaryRGB}, 0.1)`;
                    nameBox.style.borderColor = primaryColor;
                    nameBox.style.color = primaryColor;
                    nameBox.style.textShadow = LIGHT_TEXT_SHADOW;
                });
                
                skillsGrid.appendChild(item);
            });
            
            skills.appendChild(skillsGrid);
            skillsCell.appendChild(skills);
        }
        
        if (toolsCell) {
            const tools = document.createElement('div');
            tools.className = 'sobre-mi-content';
            tools.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 15px 25px;
                pointer-events: none;
                z-index: 20;
            `;
            
            const toolsTitle = document.createElement('div');
            toolsTitle.textContent = data.content.toolsTitle;
            toolsTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle}px;
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            tools.appendChild(toolsTitle);
            
            const toolsContent = document.createElement('div');
            toolsContent.style.cssText = `
                font-size: ${textSizes.medium}px;
                line-height: ${lineHeight.medium};
                letter-spacing: ${letterSpacing.medium}px;
                color: ${primaryColor};
                text-shadow: ${LIGHT_TEXT_SHADOW};
                max-width: 90%;
                text-align: center;
            `;
            
            let toolsHTML = '';
            data.content.toolsContent.forEach(item => {
                if (item.label) {
                    toolsHTML += `<div><span style="color:${secondaryColor};">${item.label}</span> ${item.items}</div>`;
                } else if (item.note) {
                    toolsHTML += `<div style="margin-top:4px; padding-top:6px; border-top:1px solid ${secondaryColor}; font-style:italic; font-size:${textSizes.small}px; letter-spacing:${letterSpacing.small}px; line-height:${lineHeight.small}; color:${primaryColor}; text-shadow:${LIGHT_TEXT_SHADOW};">${item.note}</div>`;
                }
            });
            toolsContent.innerHTML = toolsHTML;
            
            tools.appendChild(toolsContent);
            toolsCell.appendChild(tools);
        }
        
        if (defineCell) {
            const define = document.createElement('div');
            define.className = 'sobre-mi-content';
            define.style.cssText = `
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                padding: 15px 35px;
                pointer-events: none;
                z-index: 20;
                gap: 2px;
            `;
            
            const defineTitle = document.createElement('div');
            defineTitle.textContent = data.content.defineTitle;
            defineTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle}px;
                font-weight: bold;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            define.appendChild(defineTitle);
            
            const defineGrid = document.createElement('div');
            defineGrid.style.cssText = `
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                width: 100%;
                max-width: 90%;
            `;
            
            const playlistItem = data.content.defineItems.findIndex(item => item === "◆ Mi genial gusto musical");
            
            data.content.defineItems.forEach((item, index) => {
                const el = document.createElement('div');
                el.style.cssText = `
                    font-size: ${textSizes.small}px;
                    letter-spacing: ${letterSpacing.small}px;
                    line-height: ${lineHeight.small};
                    padding: 1px 0;
                    color: ${primaryColor};
                    text-shadow: ${LIGHT_TEXT_SHADOW};
                    text-align: center;
                `;
                
                if (index === playlistItem) {
                    el.innerHTML = `${data.content.playlistPrefix}<a href="${data.content.playlistLink}" target="_blank" style="color:${primaryColor}; text-shadow:${LIGHT_TEXT_SHADOW}; text-decoration:underline; text-underline-offset:2px; transition:all 0.3s ease; cursor:pointer; pointer-events:auto;" onmouseenter="this.style.color='${secondaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW_HOVER}';" onmouseleave="this.style.color='${primaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW}';">${data.content.playlistText}</a>`;
                } else {
                    el.textContent = item;
                }
                
                defineGrid.appendChild(el);
            });
            
            define.appendChild(defineGrid);
            
            const frase = document.createElement('div');
            frase.textContent = data.content.frase;
            frase.style.cssText = `
                color: ${secondaryColor};
                font-size: ${textSizes.subTitle}px;
                letter-spacing: ${letterSpacing.subTitle}px;

                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};


                width: 80%;
                text-align: center;
                font-weight: bold;
            `;
            define.appendChild(frase);
            
            defineCell.appendChild(define);
        }
        
    } finally {
        isRendering = false;
    }
}