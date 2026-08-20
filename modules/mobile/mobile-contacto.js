
import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

const CONTACTO_DESIGN = {
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
    "width": 14,
    "height": 508,
    "combined": true
  },
  "3,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 183.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,7": {
    "type": "combined_normal",
    "left": 905.5,
    "top": 183.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,13": {
    "type": "combined_normal",
    "left": 1019.5,
    "top": 183.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "3,19": {
    "type": "combined_normal",
    "left": 1133.5,
    "top": 183.5,
    "width": 14,
    "height": 508,
    "combined": true
  },
  "9,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,7": {
    "type": "combined_normal",
    "left": 905.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "9,13": {
    "type": "combined_normal",
    "left": 1019.5,
    "top": 297.5,
    "width": 109,
    "height": 109,
    "combined": true
  },
  "16,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 430.5,
    "width": 337,
    "height": 147,
    "combined": true
  },
  "25,1": {
    "type": "combined_normal",
    "left": 791.5,
    "top": 601.5,
    "width": 337,
    "height": 71,
    "combined": true
  }
};

let contactoData = null;
let gridReady = false;

async function loadContactoData() {
    try {
        const response = await fetch('./modules/sidebar/data/contacto.json');
        if (!response.ok) throw new Error('No se pudo cargar');
        contactoData = await response.json();
        return true;
    } catch (err) {
        contactoData = {
            title: "CONTACTO",
            content: {
                social: [
                    { id: 'gmail', name: 'GMAIL', value: 'hola@emnlvega.com', link: 'mailto:hola@emnlvega.com' },
                    { id: 'phone', name: 'TELÉFONO', value: '+52 664 123 4567', link: 'tel:+526641234567' },
                    { id: 'github', name: 'GITHUB', value: '@emnlvega', link: 'https://github.com/emnlvega' },
                    { id: 'facebook', name: 'FACEBOOK', value: '/emnlvega', link: 'https://facebook.com/emnlvega' },
                    { id: 'instagram', name: 'INSTAGRAM', value: '@emnlvega', link: 'https://instagram.com/emnlvega' },
                    { id: 'steam', name: 'STEAM', value: 'emnlvega', link: 'https://steamcommunity.com/id/emnlvega' }
                ],
                availability: "DISPONIBLE PARA PROYECTOS REMOTOS",
                availabilitySub: "EN CUALQUIER HORARIO, ME ADAPTO AL QUE NECESITE",
                location: "TIJUANA, BAJA CALIFORNIA, MÉXICO",
                quote: "RESPONDO MÁS RÁPIDO POR GMAIL Y WHATSAPP"
            }
        };
        return false;
    }
}

function getSocialSVG(id, color) {
    const svgs = {
        'gmail': `<svg viewBox="30 35 130 90" style="width:60px;height:60px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M52,102L52,51C52,43.58 60.46,39.35 66.4,43.8L96,66L125.6,43.8C131.53,39.35 140,43.58 140,51L140,102C140,105.31 137.32,108 134,108L120,108L120,74L96,92L72,74L72,108L58,108C54.69,108 52,105.32 52,102Z"/>
        </svg>`,
        
        'phone': `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -10 100 125" style="width:60px;height:60px;">
            <path fill="${color}" d="M69.3,0.5h-38c-5.5,0-10,4.5-10,10v78c0,5.5,4.5,10,10,10h38c5.5,0,10-4.5,10-10v-78C79.3,5,74.8,0.5,69.3,0.5z M50,93.2c-2.7,0-5-2.2-5-5c0-2.7,2.2-5,5-5s5,2.2,5,5C55,91,52.7,93.2,50,93.2z M71.3,79.5h-42v-66h42V79.5z"/>
        </svg>`,
        
        'github': `<svg viewBox="0 0 98 96" style="width:50px;height:50px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M41.4395 69.3848C28.8066 67.8535 19.9062 58.7617 19.9062 46.9902C19.9062 42.2051 21.6289 37.0371 24.5 33.5918C23.2559 30.4336 23.4473 23.7344 24.8828 20.959C28.7109 20.4805 33.8789 22.4902 36.9414 25.2656C40.5781 24.1172 44.4062 23.543 49.0957 23.543C53.7852 23.543 57.6133 24.1172 61.0586 25.1699C64.0254 22.4902 69.2891 20.4805 73.1172 20.959C74.457 23.543 74.6484 30.2422 73.4043 33.4961C76.4668 37.1328 78.0937 42.0137 78.0937 46.9902C78.0937 58.7617 69.1934 67.6621 56.3691 69.2891C59.623 71.3945 61.8242 75.9883 61.8242 81.252L61.8242 91.2051C61.8242 94.0762 64.2168 95.7031 67.0879 94.5547C84.4102 87.9512 98 70.6289 98 49.1914C98 22.1074 75.9883 6.69539e-07 48.9043 4.309e-07C21.8203 1.92261e-07 -1.9479e-07 22.1074 -4.3343e-07 49.1914C-6.20631e-07 70.4375 13.4941 88.0469 31.6777 94.6504C34.2617 95.6074 36.75 93.8848 36.75 91.3008L36.75 83.6445C35.4102 84.2188 33.6875 84.6016 32.1562 84.6016C25.8398 84.6016 22.1074 81.1563 19.4277 74.7441C18.375 72.1602 17.2266 70.6289 15.0254 70.3418C13.877 70.2461 13.4941 69.7676 13.4941 69.1934C13.4941 68.0449 15.4082 67.1836 17.3223 67.1836C20.0977 67.1836 22.4902 68.9063 24.9785 72.4473C26.8926 75.2227 28.9023 76.4668 31.2949 76.4668C33.6875 76.4668 35.2187 75.6055 37.4199 73.4043C39.0469 71.7773 40.291 70.3418 41.4395 69.3848Z"/>
        </svg>`,
        
        'facebook': `<svg viewBox="0 0 667 665" style="width:50px;height:50px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M252.658,656.821C107.611,620.711 0,489.49 0,333.334C0,149.362 149.362,0 333.334,0C517.305,0 666.667,149.362 666.667,333.334C666.667,503.689 538.597,644.368 373.567,664.259L373.567,435.195L463.741,435.195L482.446,333.334L373.567,333.334L373.567,297.309C373.567,243.479 394.685,222.777 449.342,222.777C466.319,222.777 479.983,223.19 487.851,224.018L487.851,131.681C472.945,127.539 436.506,123.398 415.389,123.398C304.003,123.398 252.658,175.986 252.658,289.442L252.658,333.334L183.922,333.334L183.922,435.195L252.658,435.195L252.658,656.821Z"/>
        </svg>`,
        
        'instagram': `<svg viewBox="0 0 256 259" style="width:50px;height:50px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M160,128a32,32,0,1,1-32-32A32.03667,32.03667,0,0,1,160,128Zm68-44v88a56.06353,56.06353,0,0,1-56,56H84a56.06353,56.06353,0,0,1-56-56V84A56.06353,56.06353,0,0,1,84,28h88A56.06353,56.06353,0,0,1,228,84Zm-52,44a48,48,0,1,0-48,48A48.05436,48.05436,0,0,0,176,128Zm16-52a12,12,0,1,0-12,12A12,12,0,0,0,192,76Z"/>
        </svg>`,
        
        'steam': `<svg viewBox="0 0 256 259" style="width:50px;height:50px;" xmlns="http://www.w3.org/2000/svg">
            <path fill="${color}" d="M127.779 0C60.42 0 5.24 52.412 0 119.014l68.724 28.674a35.812 35.812 0 0 1 20.426-6.366c.682 0 1.356.019 2.02.056l30.566-44.71v-.626c0-26.903 21.69-48.796 48.353-48.796 26.662 0 48.352 21.893 48.352 48.796 0 26.902-21.69 48.804-48.352 48.804-.37 0-.73-.009-1.098-.018l-43.593 31.377c.028.582.046 1.163.046 1.735 0 20.204-16.283 36.636-36.294 36.636-17.566 0-32.263-12.658-35.584-29.412L4.41 164.654c15.223 54.313 64.673 94.132 123.369 94.132 70.818 0 128.221-57.938 128.221-129.393C256 57.93 198.597 0 127.779 0zM80.352 196.332l-15.749-6.568c2.787 5.867 7.621 10.775 14.033 13.47 13.857 5.83 29.836-.803 35.612-14.799a27.555 27.555 0 0 0 .046-21.035c-2.768-6.79-7.999-12.086-14.706-14.909-6.67-2.795-13.811-2.694-20.085-.304l16.275 6.79c10.222 4.3 15.056 16.155 10.794 26.46-4.253 10.314-15.998 15.195-26.22 10.895zm121.957-100.29c0-17.925-14.457-32.52-32.217-32.52-17.769 0-32.226 14.595-32.226 32.52 0 17.926 14.457 32.512 32.226 32.512 17.76 0 32.217-14.586 32.217-32.512zm-56.37-.055c0-13.488 10.84-24.42 24.2-24.42 13.368 0 24.208 10.932 24.208 24.42 0 13.488-10.84 24.421-24.209 24.421-13.359 0-24.2-10.933-24.2-24.42z"/>
        </svg>`
    };
    return svgs[id] || '';
}

export async function renderMobileContacto() {
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    if (!contactoData) {
        await loadContactoData();
    }
    
    document.querySelectorAll('.mobile-contacto-content, .mobile-nav-btn, .mobile-btn-overlay, .mobile-contacto-social-item, .mobile-contacto-info').forEach(el => el.remove());
    
    stopRandomAnimations();
    resetGrid(false);
    
    importDesignFromJSON(CONTACTO_DESIGN, () => {
        gridReady = true;
        createContactoContent();
        createMobileNavButtons('contacto');
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

function createContactoContent() {
    const container = document.getElementById('grid-container');
    const primaryColor = CONFIG.COLORS.primary;
    const secondaryColor = CONFIG.COLORS.secondary;
    const primaryRGB = CONFIG.COLORS.primaryRGB;
    const secondaryRGB = CONFIG.COLORS.secondaryRGB;
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let titleCell = null;
    let socialCells = [];
    let availabilityCell = null;
    let infoCell = null;
    
    allCells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            
            if (row === 0 && col === 0) titleCell = cell;
            else if (row === 3 && (col === 1 || col === 7 || col === 13)) {
                socialCells.push({ cell, index: Math.floor((col - 1) / 6) });
            }
            else if (row === 9 && (col === 1 || col === 7 || col === 13)) {
                socialCells.push({ cell, index: 3 + Math.floor((col - 1) / 6) });
            }
            else if (row === 16 && col === 1) availabilityCell = cell;
            else if (row === 25 && col === 1) infoCell = cell;
        }
    });
    
    socialCells.sort((a, b) => a.index - b.index);
    

    if (titleCell) {
        const oldTitle = titleCell.querySelector('.mobile-contacto-content');
        if (oldTitle) oldTitle.remove();
        
        const title = document.createElement('div');
        title.className = 'mobile-contacto-content';
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
        title.textContent = contactoData?.title || 'CONTACTO';
        titleCell.appendChild(title);
    }
    

    const socialData = contactoData?.content?.social || [];
    
    socialCells.forEach(({ cell }, index) => {
        if (index >= socialData.length) return;
        const item = socialData[index];
        
        const wrapper = document.createElement('div');
        wrapper.className = 'mobile-contacto-social-item';
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
            padding: 8px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: auto;
            cursor: pointer;
            z-index: 20;
            transition: all 0.3s ease;
            border: 1px solid rgba(${primaryRGB}, 0.05);
            border-radius: 4px;
            background: rgba(${primaryRGB}, 0.02);
            gap: 2px;
        `;
        
        const iconContainer = document.createElement('div');
        iconContainer.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            width: 60px;
            height: 60px;
            transition: all 0.3s ease;
            filter: drop-shadow(0 0 10px rgba(${primaryRGB}, 0.2));
        `;
        iconContainer.innerHTML = getSocialSVG(item.id, primaryColor);
        wrapper.appendChild(iconContainer);
        
        const name = document.createElement('div');
        name.textContent = item.name;
        name.style.cssText = `
            font-size: 8px;
            letter-spacing: 2px;
            text-transform: uppercase;
            transition: all 0.3s ease;
            color: ${primaryColor};
            text-shadow: 0 0 10px rgba(${primaryRGB}, 0.1);
            text-align: center;
        `;
        wrapper.appendChild(name);
        
        wrapper.addEventListener('mouseenter', () => {
            wrapper.style.borderColor = secondaryColor;
            wrapper.style.background = `rgba(${secondaryRGB}, 0.05)`;
            wrapper.style.boxShadow = `0 0 30px rgba(${primaryRGB}, 0.1)`;
            name.style.color = secondaryColor;
            name.style.textShadow = `0 0 20px rgba(${secondaryRGB}, 0.3)`;
            iconContainer.innerHTML = getSocialSVG(item.id, secondaryColor);
            iconContainer.style.filter = `drop-shadow(0 0 20px rgba(${secondaryRGB}, 0.4))`;
        });
        
        wrapper.addEventListener('mouseleave', () => {
            wrapper.style.borderColor = `rgba(${primaryRGB}, 0.05)`;
            wrapper.style.background = `rgba(${primaryRGB}, 0.02)`;
            wrapper.style.boxShadow = 'none';
            name.style.color = primaryColor;
            name.style.textShadow = `0 0 10px rgba(${primaryRGB}, 0.1)`;
            iconContainer.innerHTML = getSocialSVG(item.id, primaryColor);
            iconContainer.style.filter = `drop-shadow(0 0 10px rgba(${primaryRGB}, 0.2))`;
        });
        
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
            }
        });
        
        cell.appendChild(wrapper);
    });
    

    if (availabilityCell) {
        const availability = document.createElement('div');
        availability.className = 'mobile-contacto-info';
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
            padding: 16px 30px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            gap: 4px;
            border: 1px solid rgba(${secondaryRGB}, 0.1);
            border-radius: 4px;
            background: rgba(${secondaryRGB}, 0.02);
        `;
        
        const icon = document.createElement('div');
        icon.textContent = '◆';
        icon.style.cssText = `
            font-size: 24px;
            color: ${secondaryColor};
            text-shadow: 0 0 30px rgba(${secondaryRGB}, 0.3);
            margin-bottom: 2px;
        `;
        availability.appendChild(icon);
        
        const mainText = document.createElement('div');
        mainText.textContent = contactoData?.content?.availability || 'DISPONIBLE PARA PROYECTOS REMOTOS';
        mainText.style.cssText = `
            font-size: 16px;
            letter-spacing: 4px;
            font-weight: bold;
            color: ${secondaryColor};
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.15);
            text-align: center;
        `;
        availability.appendChild(mainText);
        
        const sep = document.createElement('div');
        sep.style.cssText = `
            width: 30%;
            height: 1px;
            background: ${secondaryColor};
            margin: 4px 0;
            opacity: 1;
        `;
        availability.appendChild(sep);
        
        const subText = document.createElement('div');
        subText.textContent = contactoData?.content?.availabilitySub || 'EN CUALQUIER HORARIO, ME ADAPTO AL QUE NECESITE';
        subText.style.cssText = `
            font-size: 9px;
            letter-spacing: 2px;
            opacity: 0.8;
            text-align: center;
        `;
        availability.appendChild(subText);
        
        availabilityCell.appendChild(availability);
    }
    

    if (infoCell) {
        const info = document.createElement('div');
        info.className = 'mobile-contacto-info';
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
            padding: 10px 30px;
            color: ${primaryColor};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            gap: 2px;
        `;
        
        const location = document.createElement('div');
        location.textContent = contactoData?.content?.location || 'TIJUANA, BAJA CALIFORNIA, MÉXICO';
        location.style.cssText = `
            font-size: 13px;
            letter-spacing: 3px;
            font-weight: bold;
            color: ${secondaryColor};
            text-shadow: 0 0 20px rgba(${secondaryRGB}, 0.15);
            text-align: center;
        `;
        info.appendChild(location);
        
        const sep2 = document.createElement('div');
        sep2.style.cssText = `
            width: 20%;
            height: 1px;
            background: ${secondaryColor};
            margin: 3px 0;
            opacity: 0.4;
        `;
        info.appendChild(sep2);
        
        const quote = document.createElement('div');
        quote.textContent = contactoData?.content?.quote || 'RESPONDO MÁS RÁPIDO POR GMAIL Y WHATSAPP';
        quote.style.cssText = `
            font-size: 9px;
            letter-spacing: 2px;
            opacity: 0.7;
            text-align: center;
        `;
        info.appendChild(quote);
        
        infoCell.appendChild(info);
    }
}

export function getMobileContactoDesign() {
    return CONTACTO_DESIGN;
}