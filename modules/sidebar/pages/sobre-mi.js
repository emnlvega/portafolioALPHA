import { CONFIG } from '../../config.js';

let sobreMiData = null;
let retryCountSobreMi = 0;
const MAX_RETRIES = 5;

async function loadSobreMiData() {
    if (sobreMiData) return sobreMiData;
    const response = await fetch(new URL('../data/sobre-mi.json', import.meta.url));
    sobreMiData = await response.json();
    return sobreMiData;
}

export function getSobreMiDesign() {
    return loadSobreMiData().then(data => data.design);
}

export async function renderSobreMiContent() {
    const data = await loadSobreMiData();
    const container = document.getElementById('grid-container');
    if (!container) return;
    
    // 🔥 LIMPIEZA COMPLETA
    document.querySelectorAll('.sobre-mi-content').forEach(el => el.remove());
    
    const allCells = container.querySelectorAll('.grid-cell, .logo-cell');
    allCells.forEach(cell => {
        const children = cell.querySelectorAll('.sobre-mi-content');
        children.forEach(child => child.remove());
    });
    
    const cells = container.querySelectorAll('.grid-cell, .logo-cell');
    
    let photoCell = null;
    let bioCell = null;
    let skillsCell = null;
    let expCell = null;
    
    // Buscar celdas combinadas por designRow/designCol
    cells.forEach(cell => {
        if (cell.dataset.combined === 'true') {
            const row = parseInt(cell.dataset.designRow);
            const col = parseInt(cell.dataset.designCol);
            if (row === 1 && col === 1) photoCell = cell;
            else if (row === 1 && col === 6) bioCell = cell;
            else if (row === 6 && col === 1) skillsCell = cell;
            else if (row === 10 && col === 1) expCell = cell;
        }
    });
    
    // Si no se encontraron todas las celdas, reintentar
    if (!photoCell || !bioCell || !skillsCell || !expCell) {
        if (retryCountSobreMi < MAX_RETRIES) {
            retryCountSobreMi++;
            console.warn(`Sobre Mi: celdas no encontradas (intento ${retryCountSobreMi}), reintentando...`);
            setTimeout(() => renderSobreMiContent(), 300);
        } else {
            console.error('Sobre Mi: no se pudieron encontrar las celdas combinadas después de varios intentos.');
        }
        return;
    }
    retryCountSobreMi = 0;
    
    // ===== FOTO =====
    if (photoCell) {
        const photo = document.createElement('div');
        photo.className = 'sobre-mi-content';
        photo.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: ${CONFIG.COLORS.primary};
            font-size: 80px;
            text-shadow: 0 0 40px rgba(${CONFIG.COLORS.primaryRGB}, 0.3);
            pointer-events: none;
            z-index: 20;
        `;
        photo.textContent = data.content.photo;
        photoCell.appendChild(photo);
    }
    
    // ===== BIO =====
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
            align-items: center;
            padding: 30px 40px;
            color: ${CONFIG.COLORS.primary};
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.8;
            letter-spacing: 1px;
            text-shadow: var(--text-shadow-normal);
            pointer-events: none;
            z-index: 20;
            text-align: justify;
        `;
        bio.textContent = data.content.bio;
        bioCell.appendChild(bio);
    }
    
    // ===== SKILLS =====
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
            align-items: center;
            justify-content: center;
            flex-wrap: wrap;
            gap: 12px;
            padding: 20px 30px;
            pointer-events: none;
            z-index: 20;
        `;
        
        data.content.skills.forEach(skill => {
            const tag = document.createElement('span');
            tag.style.cssText = `
                color: ${CONFIG.COLORS.primary};
                font-family: 'Courier New', monospace;
                font-size: 11px;
                letter-spacing: 2px;
                text-transform: uppercase;
                padding: 6px 16px;
                border: 1px solid ${CONFIG.COLORS.primary};
                border-radius: 4px;
                text-shadow: var(--text-shadow-normal);
                transition: all 0.3s ease;
                cursor: pointer;
                pointer-events: auto;
            `;
            tag.textContent = skill;
            
            tag.addEventListener('mouseenter', () => {
                tag.style.borderColor = CONFIG.COLORS.secondary;
                tag.style.color = CONFIG.COLORS.secondary;
                tag.style.textShadow = 'var(--text-shadow-hover)';
            });
            tag.addEventListener('mouseleave', () => {
                tag.style.borderColor = CONFIG.COLORS.primary;
                tag.style.color = CONFIG.COLORS.primary;
                tag.style.textShadow = 'var(--text-shadow-normal)';
            });
            
            skills.appendChild(tag);
        });
        
        skillsCell.appendChild(skills);
    }
    
    // ===== EXPERIENCIA Y EDUCACIÓN =====
    if (expCell) {
        const exp = document.createElement('div');
        exp.className = 'sobre-mi-content';
        exp.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            padding: 20px 30px;
            pointer-events: none;
            z-index: 20;
        `;
        
        const expCol = document.createElement('div');
        expCol.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
        `;
        
        const expTitle = document.createElement('div');
        expTitle.textContent = 'EXPERIENCIA';
        expTitle.style.cssText = `
            font-size: 10px;
            letter-spacing: 4px;
            opacity: 0.4;
            margin-bottom: 8px;
            text-transform: uppercase;
        `;
        expCol.appendChild(expTitle);
        
        data.content.experience.forEach(item => {
            const line = document.createElement('div');
            line.textContent = item;
            line.style.cssText = `
                font-size: 11px;
                letter-spacing: 1px;
                opacity: 0.8;
                padding: 2px 0;
            `;
            expCol.appendChild(line);
        });
        
        const eduCol = document.createElement('div');
        eduCol.style.cssText = `
            display: flex;
            flex-direction: column;
            justify-content: center;
            gap: 4px;
        `;
        
        const eduTitle = document.createElement('div');
        eduTitle.textContent = 'EDUCACION';
        eduTitle.style.cssText = `
            font-size: 10px;
            letter-spacing: 4px;
            opacity: 0.4;
            margin-bottom: 8px;
            text-transform: uppercase;
        `;
        eduCol.appendChild(eduTitle);
        
        data.content.education.forEach(item => {
            const line = document.createElement('div');
            line.textContent = item;
            line.style.cssText = `
                font-size: 11px;
                letter-spacing: 1px;
                opacity: 0.8;
                padding: 2px 0;
            `;
            eduCol.appendChild(line);
        });
        
        exp.appendChild(expCol);
        exp.appendChild(eduCol);
        expCell.appendChild(exp);
    }
}