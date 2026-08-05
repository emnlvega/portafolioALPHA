

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

export async function loadSobreMiData() {
    if (sobreMiData) return sobreMiData;
    const response = await fetch(new URL('../data/sobre-mi.json', import.meta.url));
    sobreMiData = await response.json();
    return sobreMiData;
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
        const container = document.getElementById('grid-container');
        if (!container) {
            isRendering = false;
            return;
        }
        
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
        
        const primaryColor = CONFIG.COLORS.primary;
        const secondaryColor = CONFIG.COLORS.secondary;
        const primaryRGB = CONFIG.COLORS.primaryRGB;
        const secondaryRGB = CONFIG.COLORS.secondaryRGB;
        

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
                font-size: 32px;
                letter-spacing: 12px;
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
            let initialGlitchIndex = 0;
            

            function doInitialGlitchTransition() {

                const blinks = 5 + Math.floor(Math.random() * 8); // 5-13 parpadeos
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
            
            let initialGlitchTimeout = null;
            

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
            bioTitle.textContent = 'BIOGRAFIA';
            bioTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: 14px;
                letter-spacing: 6px;
                font-weight: bold;
                margin-bottom: 6px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            bio.appendChild(bioTitle);
            
            const age = calculateAge('1999-07-29');
            const nameLine = document.createElement('div');
            nameLine.textContent = `EMANUEL VEGA · ${age} AÑOS`;
            nameLine.style.cssText = `
                color: ${secondaryColor};
                font-size: 16px;
                letter-spacing: 3px;
                font-weight: bold;
                margin-bottom: 12px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            bio.appendChild(nameLine);
            
            const bioText = document.createElement('div');
            bioText.style.cssText = `
                font-size: 15px;
                line-height: 1.8;
                letter-spacing: 0.5px;
                max-width: 90%;
                text-align: justify;
                color: ${primaryColor};
                text-shadow: ${LIGHT_TEXT_SHADOW};
            `;
            bioText.textContent = `Desde los 6 años, cuando tuve mi primera computadora, supe que la tecnología sería lo mío, la usaba, la desarmaba, la entendía, la personalizaba, mis padres me bloqueaban la computadora y yo encontraba la forma de desbloquearla.

A los 12 años me harté de los fondos de pantalla genéricos, así que descargué Photoshop e Illustrator y empecé a crear los míos, Daft Punk y TRON: El Legado fueron mis mayores inspiraciones.

En la preparatoria, mientras otros hacían calculadoras en Visual Basic 6.0, yo recreé Space Invaders, sin IA, sin tutoriales, puro escribir mi lógica y con mi obsesión por entender cómo funcionan las cosas, curiosamente, la IA de los enemigos la programé con una barra invisible que cambiaba de tamaño y velocidad aleatoriamente.

He sido diseñador, programador, editor de video, y todo lo que se necesite, he trabajado en proyectos de branding, desarrollo web completo, sistemas internos y material promocional, soy un One Man Army.

Hoy, después de años de aprendizaje autodidacta y una carrera en Ingeniería de Desarrollo de Software, sigo teniendo el deseo y la curiosidad de entender todo y poder responder el "Por qué?" de las cosas.

Tengo la idea de que mientras algo sea posible, si depende de mí, lo conseguiré, No importa el obstáculo, siempre encuentro la forma. Mis mayores inspiraciones: Daft Punk, TRON y Gundam.`;

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
    skillsTitle.textContent = 'HABILIDADES';
    skillsTitle.style.cssText = `
        color: ${secondaryColor};
        font-size: 15px;
        letter-spacing: 5px;
        font-weight: bold;
        margin-bottom: 10px;
        text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
    `;
    skills.appendChild(skillsTitle);
    
    const skillsGrid = document.createElement('div');
    skillsGrid.style.cssText = `
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 6px 12px;
        max-width: 95%;
    `;
    
    const habilidades = [
        { icon: '◆', name: 'DISEÑO GRAFICO' },
        { icon: '◈', name: 'ILUSTRACION DIGITAL' },
        { icon: '◉', name: 'DESARROLLO WEB' },
        { icon: '◊', name: 'FOTOGRAFIA' },
        { icon: '◇', name: 'UI/UX' },
        { icon: '○', name: 'EDICION DE VIDEO' },
        { icon: '□', name: 'FRONTEND' },
        { icon: '△', name: 'BRANDING' },
        { icon: '▽', name: 'BACKEND' },
        { icon: '◍', name: 'CREATIVIDAD' },
        { icon: '●', name: 'RESOLUCION' },
        { icon: '◆', name: 'ADAPTABILIDAD' },
        { icon: '◈', name: 'PENSAMIENTO' },
        { icon: '◉', name: 'AUTODIDACTA' },
        { icon: '◊', name: 'RESOLUCIÓN DE PROBLEMAS' }
    ];
    
    habilidades.forEach(h => {
        const item = document.createElement('div');
        item.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            font-size: 12px;
            letter-spacing: 1.5px;
            padding: 3px 3px;
            color: ${primaryColor};
            text-shadow: ${LIGHT_TEXT_SHADOW};
            border: 1px solid ${primaryColor};
            border-radius: 5px;
            transition: all 0.3s ease;
            cursor: default;
            background: rgba(${primaryRGB}, 0.03);
            box-shadow: 0 0 15px rgba(${primaryRGB}, 0.08),
                        0 0 30px rgba(${primaryRGB}, 0.04),
                        inset 0 0 20px rgba(${primaryRGB}, 0.03);
        `;
        item.innerHTML = `<span style="font-size:11px;color:${primaryColor};">${h.icon}</span> ${h.name}`;
        
        item.addEventListener('mouseenter', () => {
            item.style.borderColor = secondaryColor;
            item.style.color = secondaryColor;
            item.style.textShadow = LIGHT_TEXT_SHADOW_HOVER;
            item.style.background = `rgba(${secondaryRGB}, 0.05)`;
            item.style.boxShadow = `0 0 5px rgba(${secondaryRGB}, 1),
                                    0 0 30px rgba(${secondaryRGB}, 0.2),
                                    0 0 60px rgba(${secondaryRGB}, 0.08),
                                    inset 0 0 30px rgba(${secondaryRGB}, 0.05)`;
            item.style.transform = 'scale(1.05)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.borderColor = primaryColor;
            item.style.color = primaryColor;
            item.style.textShadow = LIGHT_TEXT_SHADOW;
            item.style.background = `rgba(${primaryRGB}, 0.03)`;
            item.style.boxShadow = `0 0 15px rgba(${primaryRGB}, 0.08),
                                    0 0 30px rgba(${primaryRGB}, 0.04),
                                    inset 0 0 20px rgba(${primaryRGB}, 0.03)`;
            item.style.transform = 'scale(1)';
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
            toolsTitle.textContent = 'HERRAMIENTAS Y TECNOLOGIAS';
            toolsTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: 15px;
                letter-spacing: 5px;
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            tools.appendChild(toolsTitle);
            
            const toolsContent = document.createElement('div');
            toolsContent.style.cssText = `
                font-size: 12px;
                line-height: 2;
                letter-spacing: 0.5px;
                color: ${primaryColor};
                text-shadow: ${LIGHT_TEXT_SHADOW};
                max-width: 90%;
                text-align: center;
            `;
            
            toolsContent.innerHTML = `
                <div>
                    <span style="color:${secondaryColor};">DISEÑO:</span> Photoshop · Illustrator · Lightroom
                </div>
                <div>
                    <span style="color:${secondaryColor};">DESARROLLO:</span> HTML · CSS · JavaScript · React · Node.js · Python · SQL
                </div>
                <div>
                    <span style="color:${secondaryColor};">OTROS:</span> Wix · Wix Velo · Visual Basic 6.0 · Git
                </div>
                <div style="margin-top:4px; padding-top:6px; border-top:1px solid ${secondaryColor}; font-style:italic; font-size:12px; color:${primaryColor}; text-shadow:${LIGHT_TEXT_SHADOW};">
                    Tengo excelente intuicion para aprender cualquier herramienta o tecnologia, incluso las mas complejas y avanzadas.
                </div>
                <div style="margin-top:2px; font-size:9px; letter-spacing:2px; color:${secondaryColor}; text-shadow:${LIGHT_TEXT_SHADOW_ACTIVE};">
                    INGLES Y ESPAÑOL · HABLADO Y ESCRITO
                </div>
            `;
            
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
            defineTitle.textContent = 'LO QUE ME DEFINE';
            defineTitle.style.cssText = `
                color: ${secondaryColor};
                font-size: 14px;
                letter-spacing: 6px;
                font-weight: bold;
                margin-bottom: 6px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
            `;
            define.appendChild(defineTitle);
            
            const items = [
                '◆ Autodidacta desde los 6 años',
                '◆ Creativo por naturaleza',
                '◆ Resuelvo problemas que otros evitan',
                '◆ Aprendo cualquier cosa y tema en poco tiempo',
                '◆ Humilde pero consciente de mi valor',
                '◆ Siempre en busca de mejorar',
                '◆ Si algo es posible y depende de mí, lo conseguiré',
                '◆ Mi necesidad de proveer momentos y cosas buenas al mundo',
                '◆ Mi genial gusto musical, checa mi playlist'
            ];
            
            const defineGrid = document.createElement('div');
            defineGrid.style.cssText = `
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 2px 25px;
                width: 100%;
                max-width: 90%;
            `;
            
            items.forEach(item => {
                const el = document.createElement('div');
                el.style.cssText = `
                    font-size: 12px;
                    letter-spacing: 0.5px;
                    padding: 1px 0;
                    color: ${primaryColor};
                    text-shadow: ${LIGHT_TEXT_SHADOW};
                    text-align: center;
                `;
                
                if (item.includes('checa mi playlist')) {
                    el.innerHTML = `◆ Mi genial gusto musical, <a href="https://open.spotify.com/playlist/6rjGBL7CWlpC2FXOZhTAQE?si=151b3d02bb00400e" target="_blank" style="color:${primaryColor}; text-shadow:${LIGHT_TEXT_SHADOW}; text-decoration:underline; text-underline-offset:2px; transition:all 0.3s ease; cursor:pointer; pointer-events:auto;" onmouseenter="this.style.color='${secondaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW_HOVER}';" onmouseleave="this.style.color='${primaryColor}'; this.style.textShadow='${LIGHT_TEXT_SHADOW}';">checa mi playlist</a>`;
                } else {
                    el.textContent = item;
                }
                
                defineGrid.appendChild(el);
            });
            
            define.appendChild(defineGrid);
            
            const frase = document.createElement('div');
            frase.textContent = 'IF LOVE IS THE ANSWER YOU\'RE HOME';
            frase.style.cssText = `
                color: ${secondaryColor};
                font-size: 14px;
                letter-spacing: 6px;
                margin-top: 6px;
                text-shadow: ${LIGHT_TEXT_SHADOW_ACTIVE};
                border-top: 1px solid ${secondaryColor};
                padding-top: 8px;
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