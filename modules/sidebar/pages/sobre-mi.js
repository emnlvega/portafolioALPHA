// modules/sidebar/pages/sobre-mi.js

import { CONFIG } from '../../config.js';
import { importDesignFromJSON } from '../../logo.js';
import { resetGrid } from '../../interactions.js';
import { stopRandomAnimations, restartRandomAnimations } from '../../animations.js';
import { isTransitioningCheck } from '../index.js';

let sobreMiData = null;
let retryCountSobreMi = 0;
const MAX_RETRIES = 5;
let photoTimeout = null;
let textureWasVisibleBefore = true;

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

async function loadSobreMiData() {
    if (sobreMiData) return sobreMiData;
    const response = await fetch(new URL('../data/sobre-mi.json', import.meta.url));
    sobreMiData = await response.json();
    return sobreMiData;
}

export function getSobreMiDesign() {
    return loadSobreMiData().then(data => data.design);
}

export function clearSobreMiState() {
    // 🔥 Leer el estado REAL de la textura desde settings (localStorage)
    const textureEnabled = getTextureVisibilityFromSettings();
    
    // Solo restaurar si estaba habilitada en settings
    if (textureEnabled) {
        toggleTextureOverlay(true);
    } else {
        toggleTextureOverlay(false);
    }
}

export async function renderSobreMiContent() {
    const data = await loadSobreMiData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // Guardar estado de textura ANTES de ocultarla
    textureWasVisibleBefore = getTextureVisibilityFromSettings();
    
    // Ocultar textura SIEMPRE en Sobre Mi
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
    
    cells.forEach(cell => {
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
    });
    
    if (!titleCell || !photoCell || !bioCell || !skillsCell || !toolsCell || !defineCell) {
        if (retryCountSobreMi < MAX_RETRIES) {
            retryCountSobreMi++;
            setTimeout(() => renderSobreMiContent(), 300);
        }
        return;
    }
    retryCountSobreMi = 0;
    
    // ===== TÍTULO =====
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
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 32px;
            letter-spacing: 12px;
            text-transform: uppercase;
            text-shadow: 0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = data.title;
        titleCell.appendChild(title);
    }
    
    // ===== FOTO =====
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
            transition: opacity 2s ease-in-out;
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
            transition: opacity 2s ease-in-out;
            opacity: 0;
        `;
        
        imgContainer.appendChild(img1);
        imgContainer.appendChild(img2);
        photoWrapper.appendChild(imgContainer);
        photoCell.appendChild(photoWrapper);
        
        photoTimeout = setTimeout(() => {
            img1.style.opacity = '0';
            img2.style.opacity = '1';
            photoTimeout = null;
        }, 3000);
    }
    
    // ===== BIOGRAFÍA =====
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
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            overflow-y: auto;
            text-align: center;
        `;
        
        const bioTitle = document.createElement('div');
        bioTitle.textContent = 'BIOGRAFIA';
        bioTitle.style.cssText = `
            color: ${CONFIG.COLORS.secondary};
            font-size: 14px;
            letter-spacing: 6px;
            font-weight: bold;
            margin-bottom: 6px;
            text-shadow: var(--text-shadow-active);
        `;
        bio.appendChild(bioTitle);
        
        const age = calculateAge('1999-07-29');
        const nameLine = document.createElement('div');
        nameLine.textContent = `EMANUEL VEGA · ${age} AÑOS`;
        nameLine.style.cssText = `
            color: ${CONFIG.COLORS.secondary};
            font-size: 16px;
            letter-spacing: 3px;
            font-weight: bold;
            margin-bottom: 12px;
            text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
        `;
        bio.appendChild(nameLine);
        
        const bioText = document.createElement('div');
        bioText.style.cssText = `
            font-size: 12px;
            line-height: 1.8;
            letter-spacing: 0.5px;
            opacity: 0.85;
            max-width: 90%;
            text-align: justify;
        `;
        bioText.textContent = `Desde los 6 años, cuando tuve mi primera computadora, supe que la tecnología sería mi lenguaje. No solo la usaba, la desarmaba, la entendía, la hackeaba. Mis padres me bloqueaban la computadora y yo encontraba la forma de desbloquearla.

A los 12 años me harté de los fondos de pantalla genéricos. Descargué Photoshop e Illustrator y empecé a crear los míos. Daft Punk y TRON: El Legado fueron mi combustible creativo.

En la prepa, mientras otros hacían calculadoras en Visual Basic 6.0, yo recreé Space Invaders. Sin IA, sin tutoriales. Solo yo, mi lógica y mi obsesión por entender cómo funcionan las cosas. La IA de los enemigos la programé con una barra invisible que cambiaba de tamaño y velocidad aleatoriamente. Gané el primer lugar.

He sido diseñador, programador, editor de video, y todo lo que se necesite. He trabajado en proyectos de branding, desarrollo web completo, sistemas internos y material promocional. Siempre fui el one man army.

Hoy, después de años de aprendizaje autodidacta y una carrera en Ingeniería de Desarrollo de Software, sigo siendo el mismo niño que desarmaba su computadora para entenderla. No hay lenguaje que no pueda aprender, no hay problema que no pueda resolver.`;

        bio.appendChild(bioText);
        
        const firma = document.createElement('div');
        firma.textContent = '"La limitación fomenta la creatividad."';
        firma.style.cssText = `
            color: ${CONFIG.COLORS.secondary};
            font-size: 14px;
            letter-spacing: 2px;
            font-style: italic;
            margin-top: 10px;
            opacity: 0.7;
            text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.1);
            border-top: 1px solid rgba(${CONFIG.COLORS.secondaryRGB}, 1);
            padding-top: 10px;
            width: 80%;
            text-align: center;
        `;
        bio.appendChild(firma);
        
        const styleScroll = document.createElement('style');
        styleScroll.textContent = `
            .sobre-mi-content::-webkit-scrollbar {
                width: 4px;
            }
            .sobre-mi-content::-webkit-scrollbar-track {
                background: transparent;
            }
            .sobre-mi-content::-webkit-scrollbar-thumb {
                background: rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
                border-radius: 2px;
            }
            .sobre-mi-content::-webkit-scrollbar-thumb:hover {
                background: rgba(${CONFIG.COLORS.primaryRGB}, 0.6);
            }
        `;
        document.head.appendChild(styleScroll);
        
        bioCell.appendChild(bio);
    }
    
    // ===== HABILIDADES =====
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
            color: ${CONFIG.COLORS.secondary};
            font-size: 13px;
            letter-spacing: 5px;
            font-weight: bold;
            margin-bottom: 10px;
            text-shadow: var(--text-shadow-active);
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
            { icon: '◉', name: 'AUTODIDACTA' }
        ];
        
        habilidades.forEach(h => {
            const item = document.createElement('div');
            item.style.cssText = `
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
                font-size: 9px;
                letter-spacing: 1.5px;
                padding: 4px 8px;
                color: ${CONFIG.COLORS.primary};
                border: 1px solid rgba(${CONFIG.COLORS.primaryRGB}, 0.15);
                border-radius: 4px;
                transition: all 0.3s ease;
                cursor: default;
                background: rgba(${CONFIG.COLORS.primaryRGB}, 0.03);
                text-shadow: var(--text-shadow-normal);
            `;
            item.innerHTML = `<span style="font-size:11px;color:${CONFIG.COLORS.primary};">${h.icon}</span> ${h.name}`;
            
            // Hover effect (aunque pointer-events sea none, se puede activar)
            item.addEventListener('mouseenter', () => {
                item.style.borderColor = CONFIG.COLORS.secondary;
                item.style.color = CONFIG.COLORS.secondary;
                item.style.background = `rgba(${CONFIG.COLORS.secondaryRGB}, 0.05)`;
                item.style.boxShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.1)`;
            });
            item.addEventListener('mouseleave', () => {
                item.style.borderColor = `rgba(${CONFIG.COLORS.primaryRGB}, 0.15)`;
                item.style.color = CONFIG.COLORS.primary;
                item.style.background = `rgba(${CONFIG.COLORS.primaryRGB}, 0.03)`;
                item.style.boxShadow = 'none';
            });
            
            skillsGrid.appendChild(item);
        });
        
        skills.appendChild(skillsGrid);
        skillsCell.appendChild(skills);
    }
    
    // ===== HERRAMIENTAS Y TECNOLOGIAS =====
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
            color: ${CONFIG.COLORS.secondary};
            font-size: 13px;
            letter-spacing: 5px;
            font-weight: bold;
            margin-bottom: 8px;
            text-shadow: var(--text-shadow-active);
        `;
        tools.appendChild(toolsTitle);
        
        const toolsContent = document.createElement('div');
        toolsContent.style.cssText = `
            font-size: 10px;
            line-height: 2;
            letter-spacing: 0.5px;
            opacity: 0.85;
            color: ${CONFIG.COLORS.primary};
            max-width: 90%;
            text-align: center;
        `;
        
        toolsContent.innerHTML = `
            <div>
                <span style="color:${CONFIG.COLORS.secondary};">DISEÑO:</span> Photoshop · Illustrator · Lightroom
            </div>
            <div>
                <span style="color:${CONFIG.COLORS.secondary};">DESARROLLO:</span> HTML · CSS · JavaScript · React · Node.js · Python · SQL
            </div>
            <div>
                <span style="color:${CONFIG.COLORS.secondary};">OTROS:</span> Wix · Wix Velo · Visual Basic 6.0 · Git
            </div>
            <div style="margin-top:4px; padding-top:6px; border-top:1px solid rgba(${CONFIG.COLORS.secondaryRGB},11); font-style:italic; font-size:9px; color:${CONFIG.COLORS.primary};">
                Tengo excelente intuicion para aprender cualquier herramienta o tecnologia, incluso las mas complejas.
            </div>
            <div style="margin-top:2px; font-size:9px; letter-spacing:2px; color:${CONFIG.COLORS.secondary}; opacity:1;">
                INGLES Y ESPAÑOL · HABLADO Y ESCRITO
            </div>
        `;
        
        tools.appendChild(toolsContent);
        toolsCell.appendChild(tools);
    }
    
    // ===== LO QUE ME DEFINE =====
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
            color: ${CONFIG.COLORS.secondary};
            font-size: 14px;
            letter-spacing: 6px;
            font-weight: bold;
            margin-bottom: 6px;
            text-shadow: var(--text-shadow-active);
        `;
        define.appendChild(defineTitle);
        
        const items = [
            '◆ Autodidacta desde los 6 años',
            '◆ Creativo por naturaleza',
            '◆ Resuelvo problemas que otros evitan',
            '◆ Aprendo cualquier tecnologia en poco tiempo',
            '◆ No uso IA para crear, solo para escribir codigo que ya se que debe hacer',
            '◆ Humilde pero consciente de mi valor',
            '◆ Siempre en busca de mejorar'
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
            el.textContent = item;
            el.style.cssText = `
                font-size: 10px;
                letter-spacing: 0.5px;
                opacity: 0.85;
                padding: 1px 0;
                color: ${CONFIG.COLORS.primary};
                text-align: center;
            `;
            defineGrid.appendChild(el);
        });
        
        define.appendChild(defineGrid);
        
        const frase = document.createElement('div');
        frase.textContent = 'IF LOVE IS THE ANSWER YOU\'RE HOME';
        frase.style.cssText = `
            color: ${CONFIG.COLORS.secondary};
            font-size: 14px;
            letter-spacing: 6px;
            margin-top: 6px;
            opacity: 1;
            text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.2);
            border-top: 1px solid rgba(${CONFIG.COLORS.secondaryRGB}, 1);
            padding-top: 8px;
            width: 80%;
            text-align: center;
            font-weight: bold;
        `;
        define.appendChild(frase);
        
        defineCell.appendChild(define);
    }
}