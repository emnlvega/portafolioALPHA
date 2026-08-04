// modules/mobile-sobremi.js
import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

// 🔥 DISEÑO PARA SOBRE MI EN MÓVIL - ACTUALIZADO
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

// Datos de Sobre Mi
const SOBRE_MI_DATA = {
    foto: "assets/photo/yoedit.png",
    bio: "Desde los 6 años, cuando tuve mi primera computadora, supe que la tecnología sería lo mío, la usaba, la desarmaba, la entendía, la personalizaba, mis padres me bloqueaban la computadora y yo encontraba la forma de desbloquearla.\n\nA los 12 años me harté de los fondos de pantalla genéricos, así que descargué Photoshop e Illustrator y empecé a crear los míos, Daft Punk y TRON: El Legado fueron mis mayores inspiraciones.\n\nEn la preparatoria, mientras otros hacían calculadoras en Visual Basic 6.0, yo recreé Space Invaders, sin IA, sin tutoriales, puro escribir mi lógica y con mi obsesión por entender cómo funcionan las cosas.",
    habilidades: [
        "DISEÑO GRAFICO", "ILUSTRACION DIGITAL", "DESARROLLO WEB",
        "FOTOGRAFIA", "UI/UX", "EDICION DE VIDEO",
        "FRONTEND", "BRANDING", "BACKEND",
        "CREATIVIDAD", "RESOLUCION", "ADAPTABILIDAD",
        "PENSAMIENTO", "AUTODIDACTA", "RESOLUCIÓN DE PROBLEMAS"
    ],
    herramientas: "Photoshop · Illustrator · Lightroom · HTML · CSS · JavaScript · React · Node.js · Python · SQL · Wix · Wix Velo · Git",
    frase: "IF LOVE IS THE ANSWER YOU'RE HOME"
};

export function renderMobileSobreMi() {

    const container = document.getElementById('grid-container');
    if (!container) {
        console.error('Container no encontrado');
        return;
    }
    
    // Limpiar contenido anterior
    document.querySelectorAll('.mobile-sobremi-content, .mobile-nav-btn, .mobile-btn-overlay').forEach(el => el.remove());
    

    
    // Detener animaciones
    stopRandomAnimations();
    
    // Resetear grid SIN mantener combinadas
    resetGrid(false);
    
    // 🔥 IMPORTAR CON reset = false (no resetear el grid)
    importDesignFromJSON(SOBRE_MI_DESIGN, () => {

        // Crear contenido de Sobre Mi
        createSobreMiContent();
        // 🔥 CREAR BOTONES DE NAVEGACIÓN MÓVIL

        createMobileNavButtons('sobre-mi');
        
        // 🔥 DESACTIVAR INTERACCIONES EN SOBRE MI
        disableInteractions();
    }, true); // 🔥 reset = false
}

// 🔥 DESACTIVAR INTERACCIONES (no se pueden modificar celdas)
function disableInteractions() {
    const container = document.getElementById('grid-container');
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell, .sidebar-cell');
    
    allCells.forEach(cell => {
        // Bloquear todas las celdas
        cell.style.pointerEvents = 'none';
        cell.style.cursor = 'default';
        cell.dataset.locked = 'true';
        
        // Remover cualquier evento de click/mousedown que pueda haber
        cell.onclick = null;
        cell.onmousedown = null;
        cell.oncontextmenu = null;
    });
    

}

function createSobreMiContent() {

    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
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
            else if (row === 17 && col === 0) infoCell = cell; // 🔥 CAMBIADO A 17,0
        }
    });
    

    // ===== TÍTULO =====
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
            font-size: 20px;
            letter-spacing: 8px;
            text-transform: uppercase;
            text-shadow: 0 0 20px rgba(${primaryRGB}, 1),
                        0 0 40px rgba(${primaryRGB}, 0.6),
                        0 0 80px rgba(${primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = 'SOBRE MI';
        titleCell.appendChild(title);
    }
    
    // ===== FOTO CON EFECTO DECOLOR (como en PC) =====
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
        
        // Contenedor de la imagen
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
        `;
        
        // Imagen 1 (base - decolorada - yoedit.png)
        const img1 = document.createElement('img');
        img1.src = SOBRE_MI_DATA.foto;
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
        
        // Overlay de color (efecto decolor como en PC)
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
        
        // Imagen 2 (color - yo.png)
        const img2 = document.createElement('img');
        img2.src = 'assets/photo/yo.png';
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
        
        // 🔥 EFECTO GLITCH CON CAMBIO DE IMAGEN
        let glitchTimeout = null;
        let isFirstTransitionDone = false;
        let isUsingYoEdit = true;
        let imageSwitchTimeout = null;
        
        // Función para cambiar la imagen base (yoedit.png <-> yo.png)
        function switchBaseImage() {
            if (isUsingYoEdit) {
                // Cambiar a yo.png
                img1.src = 'assets/photo/yo.png';
                isUsingYoEdit = false;

            } else {
                // Cambiar a yoedit.png
                img1.src = SOBRE_MI_DATA.foto;
                isUsingYoEdit = true;

            }
            // Resetear estado para que la transición se vea
            img1.style.opacity = '1';
            colorOverlay.style.opacity = '1';
            img2.style.opacity = '0';
            isFirstTransitionDone = false;
            
            // Después de 1 segundo, hacer la transición a la imagen color
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
        
        // Iniciar el efecto después de 2 segundos
        setTimeout(() => {
            doInitialGlitchTransition();
        }, 10000);
        
        // 🔥 CAMBIAR LA IMAGEN BASE DESPUÉS DE 10 SEGUNDOS
        imageSwitchTimeout = setTimeout(() => {
            switchBaseImage();
        }, 10000);
        
        // 🔥 Y LUEGO CADA 20-40 SEGUNDOS CAMBIAR DE NUEVO
        function scheduleImageSwitch() {
            if (imageSwitchTimeout) {
                clearTimeout(imageSwitchTimeout);
                imageSwitchTimeout = null;
            }
            const delay = 15000 + Math.random() * 25000; // 15-40 segundos
            imageSwitchTimeout = setTimeout(() => {
                switchBaseImage();
                scheduleImageSwitch(); // Programar el siguiente
            }, delay);
        }
        
        // Programar el siguiente cambio después del primero
        setTimeout(() => {
            scheduleImageSwitch();
        }, 12000);
    }
    
    // ===== BIOGRAFÍA (con scroll) =====
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
        
        const bioContent = document.createElement('div');
        bioContent.style.cssText = `
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.3;
            letter-spacing: 0.3px;
            text-align: justify;
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
            padding-right: 4px;
        `;
        bioContent.textContent = SOBRE_MI_DATA.bio;
        
        bioWrapper.appendChild(bioContent);
        bioCell.appendChild(bioWrapper);
    }
    
    // ===== INFO COMPLETA (con scroll) - AHORA EN 17,0 =====
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
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.6;
            letter-spacing: 0.5px;
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
            padding-right: 4px;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        // HABILIDADES
        const habilidadesTitle = document.createElement('div');
        habilidadesTitle.textContent = '◆ HABILIDADES';
        habilidadesTitle.style.cssText = `
            color: ${secondaryColor};
            font-size: 13px;
            letter-spacing: 4px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.15);
            text-align: center;
            border-bottom: 1px solid rgba(${secondaryRGB}, 0.15);
            padding-bottom: 4px;
        `;
        infoContent.appendChild(habilidadesTitle);

        const habilidadesGrid = document.createElement('div');
        habilidadesGrid.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 4px 6px;
            margin-bottom: 4px;
        `;

        SOBRE_MI_DATA.habilidades.forEach(h => {
            const item = document.createElement('div');
            item.style.cssText = `
                font-size: 11px;
                letter-spacing: 1px;
                padding: 4px 2px;
                color: ${primaryColor};
                text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
                border: 1px solid rgba(${primaryRGB}, 0.15);
                border-radius: 2px;
                text-align: center;
                background: rgba(${primaryRGB}, 0.03);
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 24px;
                word-break: break-word;
                line-height: 1.2;
            `;
            item.textContent = h;
            habilidadesGrid.appendChild(item);
        });
        infoContent.appendChild(habilidadesGrid);
        
        // HERRAMIENTAS
        const herramientasTitle = document.createElement('div');
        herramientasTitle.textContent = '◆ HERRAMIENTAS Y TECNOLOGIAS';
        herramientasTitle.style.cssText = `
            color: ${secondaryColor};
            font-size: 13px;
            letter-spacing: 4px;
            font-weight: bold;
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.15);
            text-align: center;
            border-bottom: 1px solid rgba(${secondaryRGB}, 0.15);
            padding-bottom: 4px;
            margin-top: 4px;
        `;
        infoContent.appendChild(herramientasTitle);
        
        const herramientasText = document.createElement('div');
        herramientasText.style.cssText = `
            font-size: 12px;
            letter-spacing: 0.5px;
            text-align: center;
            padding: 4px 0;
            color: ${primaryColor};
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
            line-height: 1.8;
        `;
        herramientasText.textContent = SOBRE_MI_DATA.herramientas;
        infoContent.appendChild(herramientasText);
        
        // FRASE
        const fraseDiv = document.createElement('div');
        fraseDiv.style.cssText = `
            color: ${secondaryColor};
            font-size: 11px;
            letter-spacing: 4px;
            font-weight: bold;
            text-align: center;
            text-shadow: 0 0 30px rgba(${secondaryRGB}, 0.15);
            border-top: 1px solid rgba(${secondaryRGB}, 0.15);
            padding-top: 6px;
            margin-top: 4px;
        `;
        fraseDiv.textContent = SOBRE_MI_DATA.frase;
        infoContent.appendChild(fraseDiv);
        
        infoWrapper.appendChild(infoContent);
        infoCell.appendChild(infoWrapper);
    }
    

}

// 🔥 EXPONER PARA QUE PUEDA SER LLAMADO DESDE NAVEGACIÓN
export function getMobileSobreMiDesign() {
    return SOBRE_MI_DESIGN;
}