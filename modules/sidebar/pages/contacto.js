import { CONFIG } from '../../config.js';
import { showDialog } from '../../dialogs.js';

let contactoData = null;
let retryCountContacto = 0;
const MAX_RETRIES_CONTACTO = 5;

async function loadContactoData() {
    if (contactoData) return contactoData;
    const response = await fetch(new URL('../data/contacto.json', import.meta.url));
    contactoData = await response.json();
    return contactoData;
}

export function getContactoDesign() {
    return loadContactoData().then(data => data.design);
}

export async function renderContactoContent() {
    const data = await loadContactoData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // 🔥 LIMPIEZA COMPLETA
    document.querySelectorAll('.contacto-content').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.contacto-content');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let emailCell = null;
    let socialCell = null;
    let infoCell = null;
    let footerCell = null;
    
    // Buscar por designRow y designCol
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            if (row === 2 && col === 2) emailCell = cell;
            else if (row === 2 && col === 10) socialCell = cell; // Cambiado de 8 a 10
            else if (row === 6 && col === 2) infoCell = cell;
            else if (row === 10 && col === 2) footerCell = cell;
        }
    });
    
    // Reintentar si no se encuentran todas
    if (!emailCell || !socialCell || !infoCell || !footerCell) {
        if (retryCountContacto < MAX_RETRIES_CONTACTO) {
            retryCountContacto++;
            setTimeout(() => renderContactoContent(), 300);
            return;
        } else {
            console.error('Contacto: no se pudieron encontrar las celdas combinadas.');
            retryCountContacto = 0;
            return;
        }
    }
    retryCountContacto = 0;
    
    // --- EMAIL ---
    if (emailCell) {
        const email = document.createElement('div');
        email.className = 'contacto-content';
        email.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            pointer-events: none;
            z-index: 20;
            gap: 4px;
        `;
        const label = document.createElement('span');
        label.textContent = 'EMAIL';
        label.style.cssText = `font-size: 10px; letter-spacing: 4px; opacity: 0.4; text-transform: uppercase;`;
        const value = document.createElement('span');
        value.textContent = data.content.email;
        value.style.cssText = `font-size: 22px; letter-spacing: 2px; text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);`;
        email.appendChild(label);
        email.appendChild(value);
        emailCell.appendChild(email);
    }
    
    // --- SOCIAL ---
    if (socialCell) {
        const social = document.createElement('div');
        social.className = 'contacto-content';
        social.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 20px;
            padding: 20px;
            pointer-events: none;
            z-index: 20;
        `;
        const socialData = [
            { icon: 'T', name: 'TWITTER', value: data.content.social.twitter },
            { icon: 'I', name: 'INSTAGRAM', value: data.content.social.instagram },
            { icon: 'G', name: 'GITHUB', value: data.content.social.github },
            { icon: 'L', name: 'LINKEDIN', value: data.content.social.linkedin },
            { icon: 'B', name: 'BEHANCE', value: data.content.social.behance }
        ];
        socialData.forEach(item => {
            const el = document.createElement('div');
            el.style.cssText = `
                display: flex; flex-direction: column; align-items: center; gap: 2px;
                color: ${CONFIG.COLORS.primary}; font-family: 'Courier New', monospace;
                cursor: pointer; pointer-events: auto;
                transition: all 0.3s ease; padding: 8px 16px;
                border: 1px solid transparent; border-radius: 4px;
            `;
            const icon = document.createElement('span');
            icon.textContent = item.icon;
            icon.style.cssText = `font-size: 28px; color: ${CONFIG.COLORS.primary}; text-shadow: 0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2); transition: all 0.3s ease;`;
            const name = document.createElement('span');
            name.textContent = item.name;
            name.style.cssText = `font-size: 8px; letter-spacing: 2px; opacity: 0.5; text-transform: uppercase;`;
            el.appendChild(icon);
            el.appendChild(name);
            el.addEventListener('mouseenter', () => {
                el.style.borderColor = CONFIG.COLORS.secondary;
                el.style.color = CONFIG.COLORS.secondary;
                icon.style.color = CONFIG.COLORS.secondary;
                icon.style.textShadow = `0 0 30px rgba(${CONFIG.COLORS.secondaryRGB}, 0.4)`;
            });
            el.addEventListener('mouseleave', () => {
                el.style.borderColor = 'transparent';
                el.style.color = CONFIG.COLORS.primary;
                icon.style.color = CONFIG.COLORS.primary;
                icon.style.textShadow = `0 0 20px rgba(${CONFIG.COLORS.primaryRGB}, 0.2)`;
            });
            el.addEventListener('click', () => {
                showDialog('CONTACTO', `${item.name}: ${item.value}`);
            });
            social.appendChild(el);
        });
        socialCell.appendChild(social);
    }
    
    // --- INFO ---
    if (infoCell) {
        const info = document.createElement('div');
        info.className = 'contacto-content';
        info.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            color: ${CONFIG.COLORS.primary}; font-family: 'Courier New', monospace;
            font-size: 20px; letter-spacing: 6px; text-shadow: 0 0 30px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            pointer-events: none; z-index: 20; gap: 20px;
        `;
        const phone = document.createElement('span');
        phone.textContent = 'T: ' + data.content.phone;
        phone.style.cssText = `font-size: 18px; letter-spacing: 2px;`;
        const location = document.createElement('span');
        location.textContent = 'L: ' + data.content.location;
        location.style.cssText = `font-size: 18px; letter-spacing: 2px;`;
        info.appendChild(phone);
        info.appendChild(location);
        infoCell.appendChild(info);
    }
    
    // --- FOOTER ---
    if (footerCell) {
        const footer = document.createElement('div');
        footer.className = 'contacto-content';
        footer.style.cssText = `
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center;
            color: ${CONFIG.COLORS.primary}; font-family: 'Courier New', monospace;
            font-size: 18px; letter-spacing: 8px; text-transform: uppercase;
            text-shadow: var(--text-shadow-normal); opacity: 1;
            pointer-events: none; z-index: 20;
        `;
        footer.textContent = data.content.availability;
        footerCell.appendChild(footer);
    }
}