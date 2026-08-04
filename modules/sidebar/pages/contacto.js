// modules/sidebar/pages/contacto.js

import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';
import { importDesignFromJSON } from '../../logo.js';
import { resetGrid } from '../../interactions.js';
import { stopRandomAnimations, restartRandomAnimations } from '../../animations.js';
import { isTransitioningCheck } from '../index.js';

let contactoData = null;
let retryCountContacto = 0;
const MAX_RETRIES_CONTACTO = 5;
let textureWasVisibleBefore = true;

// ===== SVG ICONS =====
function getSocialSVG(id, color) {
    const svgs = {
        'gmail': `<svg viewBox="30 35 130 90" style="width:100px;height:100px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M52,102L52,51C52,43.58 60.46,39.35 66.4,43.8L96,66L125.6,43.8C131.53,39.35 140,43.58 140,51L140,102C140,105.31 137.32,108 134,108L120,108L120,74L96,92L72,74L72,108L58,108C54.69,108 52,105.32 52,102Z"/>
        </svg>`,
        
        'phone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 100 125" style="width:100px;height:100px;">
            <path fill="${color}" d="M69.3,0.5h-38c-5.5,0-10,4.5-10,10v78c0,5.5,4.5,10,10,10h38c5.5,0,10-4.5,10-10v-78C79.3,5,74.8,0.5,69.3,0.5z M50,93.2c-2.7,0-5-2.2-5-5c0-2.7,2.2-5,5-5s5,2.2,5,5C55,91,52.7,93.2,50,93.2z M71.3,79.5h-42v-66h42V79.5z"/>
        </svg>`,
        
        'github': `<svg viewBox="0 0 98 96" style="width:80px;height:80px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"/>
        </svg>`,
        
        'facebook': `<svg viewBox="0 0 667 665" style="width:80px;height:80px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M252.658,656.821C107.611,620.711 0,489.49 0,333.334C0,149.362 149.362,0 333.334,0C517.305,0 666.667,149.362 666.667,333.334C666.667,503.689 538.597,644.368 373.567,664.259L373.567,435.195L463.741,435.195L482.446,333.334L373.567,333.334L373.567,297.309C373.567,243.479 394.685,222.777 449.342,222.777C466.319,222.777 479.983,223.19 487.851,224.018L487.851,131.681C472.945,127.539 436.506,123.398 415.389,123.398C304.003,123.398 252.658,175.986 252.658,289.442L252.658,333.334L183.922,333.334L183.922,435.195L252.658,435.195L252.658,656.821Z"/>
        </svg>`,
        
        'instagram': `<svg viewBox="0 0 256 259" style="width:80px;height:80px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M160,128a32,32,0,1,1-32-32A32.03667,32.03667,0,0,1,160,128Zm68-44v88a56.06353,56.06353,0,0,1-56,56H84a56.06353,56.06353,0,0,1-56-56V84A56.06353,56.06353,0,0,1,84,28h88A56.06353,56.06353,0,0,1,228,84Zm-52,44a48,48,0,1,0-48,48A48.05436,48.05436,0,0,0,176,128Zm16-52a12,12,0,1,0-12,12A12,12,0,0,0,192,76Z"/>
        </svg>`,
        
        'steam': `<svg viewBox="0 0 256 259" style="width:80px;height:80px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M127.779 0C60.42 0 5.24 52.412 0 119.014l68.724 28.674a35.812 35.812 0 0 1 20.426-6.366c.682 0 1.356.019 2.02.056l30.566-44.71v-.626c0-26.903 21.69-48.796 48.353-48.796 26.662 0 48.352 21.893 48.352 48.796 0 26.902-21.69 48.804-48.352 48.804-.37 0-.73-.009-1.098-.018l-43.593 31.377c.028.582.046 1.163.046 1.735 0 20.204-16.283 36.636-36.294 36.636-17.566 0-32.263-12.658-35.584-29.412L4.41 164.654c15.223 54.313 64.673 94.132 123.369 94.132 70.818 0 128.221-57.938 128.221-129.393C256 57.93 198.597 0 127.779 0zM80.352 196.332l-15.749-6.568c2.787 5.867 7.621 10.775 14.033 13.47 13.857 5.83 29.836-.803 35.612-14.799a27.555 27.555 0 0 0 .046-21.035c-2.768-6.79-7.999-12.086-14.706-14.909-6.67-2.795-13.811-2.694-20.085-.304l16.275 6.79c10.222 4.3 15.056 16.145 10.794 26.46-4.253 10.314-15.998 15.195-26.22 10.895zm121.957-100.29c0-17.925-14.457-32.52-32.217-32.52-17.769 0-32.226 14.595-32.226 32.52 0 17.926 14.457 32.512 32.226 32.512 17.76 0 32.217-14.586 32.217-32.512zm-56.37-.055c0-13.488 10.84-24.42 24.2-24.42 13.368 0 24.208 10.932 24.208 24.42 0 13.488-10.84 24.421-24.209 24.421-13.359 0-24.2-10.933-24.2-24.42z"/>
        </svg>`
    };
    
    return svgs[id] || '';
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

export async function loadContactoData() {
    if (contactoData) return contactoData;
    const response = await fetch(new URL('../data/contacto.json', import.meta.url));
    contactoData = await response.json();
    return contactoData;
}

async function loadContactoDataInternal() {
    return loadContactoData();
}

export function getContactoDesign() {
    return loadContactoData().then(data => data.design);
}

export function clearContactoState() {
    const textureEnabled = getTextureVisibilityFromSettings();
    if (textureEnabled) {
        toggleTextureOverlay(true);
    } else {
        toggleTextureOverlay(false);
    }
}

export async function renderContactoContent() {
    const data = await loadContactoData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // Guardar estado de textura ANTES de ocultarla
    textureWasVisibleBefore = getTextureVisibilityFromSettings();
    
    // Ocultar textura SIEMPRE en Contacto
    toggleTextureOverlay(false);
    
    document.querySelectorAll('.contacto-content').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.contacto-content');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let socialCells = [];
    let availabilityCell = null;
    let infoCell = null;
    
    // 🔥 Buscar las coordenadas EXACTAS del JSON (sin restar el sidebar)
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            // Título: 0,0
            if (row === 0 && col === 0) {
                titleCell = cell;
            }
            // Redes sociales: fila 2, columnas 1, 6, 11, 16, 21, 26
            else if (row === 2 && col === 1) {
                socialCells.push({ cell, index: 0 });
            }
            else if (row === 2 && col === 6) {
                socialCells.push({ cell, index: 1 });
            }
            else if (row === 2 && col === 11) {
                socialCells.push({ cell, index: 2 });
            }
            else if (row === 2 && col === 16) {
                socialCells.push({ cell, index: 3 });
            }
            else if (row === 2 && col === 21) {
                socialCells.push({ cell, index: 4 });
            }
            else if (row === 2 && col === 26) {
                socialCells.push({ cell, index: 5 });
            }
            // Disponibilidad: 7,1
            else if (row === 7 && col === 1) {
                availabilityCell = cell;
            }
            // Info: 11,1
            else if (row === 11 && col === 1) {
                infoCell = cell;
            }
        }
    });
    
    // Ordenar por índice
    socialCells.sort((a, b) => a.index - b.index);
    
    if (!titleCell || socialCells.length === 0 || !availabilityCell || !infoCell) {
        if (retryCountContacto < MAX_RETRIES_CONTACTO) {
            retryCountContacto++;
            setTimeout(() => renderContactoContent(), 300);
            return;
        }
        retryCountContacto = 0;
        return;
    }
    retryCountContacto = 0;
    
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    // ===== TÍTULO =====
    if (titleCell) {
        const title = document.createElement('div');
        title.className = 'contacto-content';
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
            text-shadow: 0 0 40px rgba(${primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
            user-select: none;
        `;
        title.textContent = data.title;
        titleCell.appendChild(title);
    }
    
    // ===== REDES SOCIALES =====
    const socialData = data.content.social;

    socialCells.forEach(({ cell }, index) => {
        if (index >= socialData.length) return;
        const item = socialData[index];
        
        const wrapper = document.createElement('div');
        wrapper.className = 'contacto-content';
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
            padding: 15px 10px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: auto;
            cursor: pointer;
            z-index: 20;
            transition: all 0.3s ease;
            border: 1px solid rgba(${primaryRGB}, 0.05);
            border-radius: 8px;
            background: rgba(${primaryRGB}, 0.02);
            gap: 4px;
        `;
        
        // Nombre de la red (estilo sidebar - outline por defecto)
        const name = document.createElement('div');
        name.textContent = item.name;
        name.style.cssText = `
            font-size: 20px;
            letter-spacing: 4px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            color: ${primaryColor};
            text-shadow: var(--text-shadow-normal);
        `;
        wrapper.appendChild(name);
        
        // SVG Icon (estilo outline por defecto, como celdas combinadas)
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100px;
            height: 100px;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 10px rgba(${primaryRGB}, 0.3));
        `;
        // El SVG ya se renderiza con el color primary
        iconContainer.innerHTML = getSocialSVG(item.id, primaryColor);
        wrapper.appendChild(iconContainer);
        
        // Valor/dato de la red (estilo sidebar - outline por defecto)
        const value = document.createElement('div');
        value.textContent = item.value;
        value.style.cssText = `
            font-size: 15px;
            letter-spacing: 1px;
            transition: all 0.3s ease;
            text-align: center;
            word-break: break-all;
            max-width: 95%;
            color: ${primaryColor};
            text-shadow: var(--text-shadow-normal);
            opacity: 0.8;
        `;
        wrapper.appendChild(value);
        
        // Hover effect
        wrapper.addEventListener('mouseenter', () => {
            // Fondo y borde del wrapper
            wrapper.style.borderColor = secondaryColor;
            wrapper.style.background = `rgba(${secondaryRGB}, 0.05)`;
            wrapper.style.boxShadow = `0 0 40px rgba(${primaryRGB}, 0.1)`;
            
            // Nombre cambia a estilo active (fill)
            name.style.color = secondaryColor;
            name.style.textShadow = 'var(--text-shadow-active)';
            
            // Valor cambia a estilo active (fill)
            value.style.color = secondaryColor;
            value.style.textShadow = 'var(--text-shadow-active)';
            value.style.opacity = '1';
            
            // SVG cambia a estilo fill (como celda red/combined)
            iconContainer.innerHTML = getSocialSVG(item.id, secondaryColor);
            iconContainer.style.filter = `drop-shadow(0 0 20px rgba(${secondaryRGB}, 0.4))`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.borderColor = `rgba(${primaryRGB}, 0.05)`;
            wrapper.style.background = `rgba(${primaryRGB}, 0.02)`;
            wrapper.style.boxShadow = 'none';
            
            // Nombre vuelve a outline
            name.style.color = primaryColor;
            name.style.textShadow = 'var(--text-shadow-normal)';
            
            // Valor vuelve a outline
            value.style.color = primaryColor;
            value.style.textShadow = 'var(--text-shadow-normal)';
            value.style.opacity = '0.8';
            
            // SVG vuelve a outline
            iconContainer.innerHTML = getSocialSVG(item.id, primaryColor);
            iconContainer.style.filter = `drop-shadow(0 0 10px rgba(${primaryRGB}, 0.3))`;
        });
        
        // Click: abrir link o mostrar diálogo
        wrapper.addEventListener('click', (e) => {
            e.stopPropagation();
            if (item.link) {
                if (item.id === 'gmail') {
                    window.location.href = item.link;
                } else if (item.id === 'phone') {
                    window.location.href = item.link;
                } else {
                    window.open(item.link, '_blank');
                }
            } else {
                showDialog(item.name, `${item.value}`);
            }
        });
        
        cell.appendChild(wrapper);
    });
    
    // ===== DISPONIBILIDAD (celda 7,1) =====
    if (availabilityCell) {
        const availability = document.createElement('div');
        availability.className = 'contacto-content';
        availability.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 30px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            gap: 4px;
            border: 1px solid rgba(${secondaryRGB}, 0.15);
            border-radius: 8px;
            background: rgba(${secondaryRGB}, 0.03);
        `;
        
        // Icono grande
        const icon = document.createElement('div');
        icon.textContent = '◆';
        icon.style.cssText = `
            font-size: 32px;
            color: ${secondaryColor};
            text-shadow: 0 0 40px rgba(${secondaryRGB}, 0.3);
            margin-bottom: 4px;
        `;
        availability.appendChild(icon);
        
        // Texto principal
        const mainText = document.createElement('div');
        mainText.textContent = data.content.availability;
        mainText.style.cssText = `
            font-size: 22px;
            letter-spacing: 8px;
            font-weight: bold;
            color: ${secondaryColor};
            text-shadow: 0 0 30px rgba(${secondaryRGB}, 0.2);
        `;
        availability.appendChild(mainText);

        const sepa = document.createElement('div');
        sepa.style.cssText = `
            width: 30%;
            height: 1px;
            background: ${secondaryColor};
            margin: 4px 0;
            opacity: 1;
        `;
        availability.appendChild(sepa);
        
        // Texto secundario
        const subText = document.createElement('div');
        subText.textContent = data.content.availabilitySub;
        subText.style.cssText = `
            font-size: 11px;
            letter-spacing: 2px;
            opacity: 1;
            margin-top: 2px;
        `;
        availability.appendChild(subText);
        
        // Línea decorativa
        
        
        availabilityCell.appendChild(availability);
    }
    
    // ===== INFORMACIÓN ADICIONAL (celda 11,1) =====
    if (infoCell) {
        const info = document.createElement('div');
        info.className = 'contacto-content';
        info.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 20px 40px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            gap: 6px;
        `;
        
        // Frase principal
        const quote = document.createElement('div');
        quote.textContent = data.content.quote;
        quote.style.cssText = `
            font-size: 20px;
            letter-spacing: 6px;
            font-weight: bold;
            color: ${secondaryColor};
            text-shadow: 0 0 30px rgba(${secondaryRGB}, 0.15);
            opacity: 1;
            margin-bottom: 4px;
        `;
        info.appendChild(quote);
        
        // Separador
        const sep = document.createElement('div');
        sep.style.cssText = `
            width: 30%;
            height: 1px;
            background: ${secondaryColor};
            margin: 4px 0;
            opacity: 1;
        `;
        info.appendChild(sep);
        
        // Ubicación
        const location = document.createElement('div');
        location.textContent = data.content.location;
        location.style.cssText = `
            font-size: 12px;
            letter-spacing: 3px;
            opacity: 1;
            text-transform: uppercase;
        `;
        info.appendChild(location);
        

        
        infoCell.appendChild(info);
    }
}