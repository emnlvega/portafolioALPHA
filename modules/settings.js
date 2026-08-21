

import { CONFIG, updateColors, createColors } from './config.js';
import { restartRandomAnimations, stopRandomAnimations } from './animations.js';


const DEFAULT_SETTINGS = {
    grain: true,
    gaussianBlur: true,
    bloom: true,
    burnBlur: false,
    textura: true,
    animations: true,
    scanlines: false,
    vignette: true,
    flicker: true,
    glow: true
};

let currentSettings = { ...DEFAULT_SETTINGS };
let settingsDialog = null;
let isInitialized = false;


const ELEMENTS = {
    grain: 'grain-overlay',
    gaussianBlur: 'gaussian-blur',
    bloom: 'bloom-overlay',
    burnBlur: 'burn-blur',
    overlay: 'overlay-container'
};

export function loadSettings() {
    try {
        const saved = localStorage.getItem('edesign_settings');
        if (saved) {
            const parsed = JSON.parse(saved);
            currentSettings = { ...DEFAULT_SETTINGS, ...parsed };
            
            if (parsed.primaryColor) {
                const newColors = createColors(parsed.primaryColor, '#ffffff', '#000000');
                CONFIG.COLORS = newColors;
                
                const event = new CustomEvent('colorsUpdated', { 
                    detail: { colors: newColors } 
                });
                document.dispatchEvent(event);
                
                const sidebarPicker = document.getElementById('colorPicker');
                if (sidebarPicker) sidebarPicker.value = parsed.primaryColor;
                const sidebarHex = document.getElementById('colorHexLabel');
                if (sidebarHex) sidebarHex.textContent = parsed.primaryColor.toUpperCase();
            }
        } else {
            currentSettings = { ...DEFAULT_SETTINGS };
        }
    } catch (e) {
        currentSettings = { ...DEFAULT_SETTINGS };
    }
    return currentSettings;
}

export function saveSettings(settings) {
    try {
        const dataToSave = { ...settings };
        dataToSave.primaryColor = CONFIG.COLORS.primary;
        localStorage.setItem('edesign_settings', JSON.stringify(dataToSave));
        currentSettings = { ...settings };
    } catch (e) {}
}

function resetAllAndRefresh() {

    const defaultColor = '#00FF9B';
    

    updateColors(defaultColor);
    

    const dataToSave = { ...currentSettings };
    dataToSave.primaryColor = defaultColor;
    try {
        localStorage.setItem('edesign_settings', JSON.stringify(dataToSave));
    } catch (e) {}
    

    const colorInputEl = settingsDialog?.querySelector('input[type="color"]');
    if (colorInputEl) {
        colorInputEl.value = defaultColor;
        colorInputEl.dispatchEvent(new Event('input'));
    }
    

    const sidebarPicker = document.getElementById('colorPicker');
    if (sidebarPicker) sidebarPicker.value = defaultColor;
    const sidebarHex = document.getElementById('colorHexLabel');
    if (sidebarHex) sidebarHex.textContent = '#00FF9B';
    

    closeSettings();
    

    window.location.reload();
}




export function applySettings(settings) {
    const grain = document.getElementById(ELEMENTS.grain);
    if (grain) grain.style.display = settings.grain ? 'block' : 'none';
    
    const gaussian = document.getElementById(ELEMENTS.gaussianBlur);
    if (gaussian) gaussian.style.display = settings.gaussianBlur ? 'block' : 'none';
    
    const bloom = document.getElementById(ELEMENTS.bloom);
    if (bloom) bloom.style.display = settings.bloom ? 'block' : 'none';
    
    const burnBlur = document.getElementById(ELEMENTS.burnBlur);
    if (burnBlur) burnBlur.style.display = settings.burnBlur ? 'block' : 'none';
    

    const overlay = document.getElementById(ELEMENTS.overlay);
    if (overlay) {
        overlay.style.display = settings.textura ? 'block' : 'none';
    }
    
    if (settings.scanlines) {
        document.body.classList.remove('no-scanlines');
    } else {
        document.body.classList.add('no-scanlines');
    }
    
    if (settings.vignette) {
        document.body.classList.remove('no-vignette');
    } else {
        document.body.classList.add('no-vignette');
    }
    
    const gridContainer = document.getElementById('grid-container');
    if (gridContainer) {
        if (settings.flicker) {
            gridContainer.classList.remove('no-flicker');
        } else {
            gridContainer.classList.add('no-flicker');
        }
    }
    
    if (settings.glow) {
        document.body.classList.remove('no-glow');
    } else {
        document.body.classList.add('no-glow');
    }
    
    if (settings.animations) {
        CONFIG.ANIMATIONS.SCALE.ENABLED = true;
        CONFIG.ANIMATIONS.GLOW.ENABLED = false;
        CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED = true;
        CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED = true;
        CONFIG.ANIMATIONS.COLOR.ENABLED = false;
        CONFIG.ANIMATIONS.ROTATE.ENABLED = false;
        restartRandomAnimations();
    } else {
        CONFIG.ANIMATIONS.SCALE.ENABLED = false;
        CONFIG.ANIMATIONS.GLOW.ENABLED = false;
        CONFIG.ANIMATIONS.BORDER_SHIFT.ENABLED = false;
        CONFIG.ANIMATIONS.OPACITY_WAVE.ENABLED = false;
        CONFIG.ANIMATIONS.COLOR.ENABLED = false;
        CONFIG.ANIMATIONS.ROTATE.ENABLED = false;
        stopRandomAnimations();
    }
}


function updateSwitchVisualAndFunction(id, checked) {
    const input = document.getElementById(id);
    if (!input) return;
    
    input.checked = checked;
    
    const switchWrap = input.parentElement;
    const children = switchWrap.children;
    let slider = null;
    let knob = null;
    
    for (let child of children) {
        if (child.tagName === 'DIV' && child.style.borderRadius === '13px') {
            slider = child;
        }
        if (child.tagName === 'DIV' && child.style.borderRadius === '50%') {
            knob = child;
        }
    }
    
    if (slider && knob) {
        if (checked) {
            slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
            knob.style.transform = 'translateX(22px)';
        } else {
            slider.style.background = `rgba(var(--color-primary-rgb), 0.15)`;
            knob.style.transform = 'translateX(0)';
        }
    }
    
    const key = id.replace('setting-', '');
    currentSettings[key] = checked;
}


function updateAllSwitches(value) {
    const switchKeys = ['grain', 'gaussianBlur', 'bloom', 'burnBlur', 'textura', 'animations', 'scanlines', 'vignette', 'flicker', 'glow'];
    
    switchKeys.forEach(key => {
        currentSettings[key] = value;
        const id = `setting-${key}`;
        const input = document.getElementById(id);
        if (input) {
            input.checked = value;
            const switchWrap = input.parentElement;
            const children = switchWrap.children;
            let slider = null;
            let knob = null;
            
            for (let child of children) {
                if (child.tagName === 'DIV' && child.style.borderRadius === '12px') {
                    slider = child;
                }
                if (child.tagName === 'DIV' && child.style.borderRadius === '50%') {
                    knob = child;
                }
            }
            
            if (slider && knob) {
                if (value) {
                    slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
                    knob.style.transform = 'translateX(20px)';
                    knob.style.top = '4px';
                } else {
                    slider.style.background = `rgba(var(--color-primary-rgb), 0.15)`;
                    knob.style.transform = 'translateX(0)';
                    knob.style.top = '4px';
                }
            }
        }
    });
    
    applySettings(currentSettings);
    saveSettings(currentSettings);
}


function createSettingsDialog() {
    if (settingsDialog) return settingsDialog;
    
    const dialog = document.createElement('div');
    dialog.id = 'settings-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.92);
        z-index: 999;
        display: none;
        justify-content: center;
        align-items: center;
        gap: 30px;
        backdrop-filter: blur(10px);
        isolation: isolate;
        padding: 20px;
        flex-wrap: wrap;
    `;
    

    const configPanel = document.createElement('div');
    configPanel.style.cssText = `
        background: var(--color-bg);
        border: var(--dialog-border);
        border-radius: 20px;
        padding: 30px 35px;
        max-width: 360px;
        width: 100%;
        box-shadow: var(--dialog-shadow), var(--dialog-inset);
        position: relative;
        min-height: 630px;
        display: flex;
        flex-direction: column;
    `;
    
    const configTitle = document.createElement('h2');
    configTitle.textContent = '◆ CONFIGURACIÓN';
    configTitle.style.cssText = `
        color: var(--color-primary);
        font-size: 18px;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
        letter-spacing: 6px;
        text-transform: uppercase;
        text-align: center;
        text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
        border-bottom: 2px solid rgba(var(--color-primary-rgb), 0.15);
        padding-bottom: 12px;
    `;
    configPanel.appendChild(configTitle);
    

    const colorRow = document.createElement('div');
    colorRow.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 0;
        margin-bottom: 16px;
        border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.12);
    `;
    
    const colorLabel = document.createElement('span');
    colorLabel.textContent = 'COLOR';
    colorLabel.style.cssText = `
        color: var(--color-primary);
        font-family: 'Courier New', monospace;
        font-size: 11px;
        letter-spacing: 2px;
        text-transform: uppercase;
        font-weight: bold;
    `;
    
    const colorWrap = document.createElement('div');
    colorWrap.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
    `;
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = CONFIG.COLORS.primary;
    colorInput.style.cssText = `
        width: 34px;
        height: 34px;
        padding: 0;
        border: 2px solid rgba(var(--color-primary-rgb), 0.3);
        border-radius: 6px;
        background: transparent;
        cursor: pointer;
    `;
    
    const colorHex = document.createElement('span');
    colorHex.textContent = CONFIG.COLORS.primary.toUpperCase();
    colorHex.style.cssText = `
        font-family: 'Courier New', monospace;
        font-size: 11px;
        letter-spacing: 1px;
        color: var(--color-primary);
        min-width: 50px;
        font-weight: bold;
    `;
    
    const applyColorBtn = document.createElement('button');
    applyColorBtn.textContent = 'APLICAR';
    applyColorBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-primary);
        padding: 4px 14px;
        font-family: 'Courier New', monospace;
        font-size: 10px;
        letter-spacing: 2px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 4px;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
    `;
    

    const resetColorBtn = document.createElement('button');
    resetColorBtn.textContent = '⟳';
    resetColorBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.3);
        color: var(--color-primary);
        padding: 4px 8px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 4px;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        line-height: 1;
    `;
    resetColorBtn.title = 'Resetear color a #00FF9B';
    
    resetColorBtn.addEventListener('mouseenter', () => {
        resetColorBtn.style.borderColor = 'var(--color-secondary)';
        resetColorBtn.style.color = 'var(--color-secondary)';
        resetColorBtn.style.boxShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.2)';
    });
    resetColorBtn.addEventListener('mouseleave', () => {
        resetColorBtn.style.borderColor = `rgba(var(--color-primary-rgb), 0.3)`;
        resetColorBtn.style.color = 'var(--color-primary)';
        resetColorBtn.style.boxShadow = 'none';
    });
    
    resetColorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        resetAllAndRefresh();
    });
    
    let tempColor = CONFIG.COLORS.primary;
    
    colorInput.addEventListener('input', function(e) {
        tempColor = e.target.value;
        colorHex.textContent = tempColor.toUpperCase();
        colorHex.style.color = tempColor;
        applyColorBtn.style.borderColor = tempColor;
        applyColorBtn.style.color = tempColor;
        resetColorBtn.style.borderColor = tempColor;
        resetColorBtn.style.color = tempColor;
    });
    
    applyColorBtn.addEventListener('click', function() {
        updateColors(tempColor);
        
        const sidebarPicker = document.getElementById('colorPicker');
        if (sidebarPicker) sidebarPicker.value = tempColor;
        const sidebarHex = document.getElementById('colorHexLabel');
        if (sidebarHex) sidebarHex.textContent = tempColor.toUpperCase();
        
        const dataToSave = { ...currentSettings };
        dataToSave.primaryColor = tempColor;
        try {
            localStorage.setItem('edesign_settings', JSON.stringify(dataToSave));
        } catch (e) {}
        
        currentSettings.primaryColor = tempColor;
        saveSettings(currentSettings);
        

        closeSettings();
        window.location.reload();
    });
    
    colorWrap.appendChild(colorInput);
    colorWrap.appendChild(colorHex);
    colorWrap.appendChild(applyColorBtn);
    colorWrap.appendChild(resetColorBtn);
    colorRow.appendChild(colorLabel);
    colorRow.appendChild(colorWrap);
    configPanel.appendChild(colorRow);
    

    const btnRow = document.createElement('div');
    btnRow.style.cssText = `
        display: flex;
        gap: 10px;
        margin-bottom: 16px;
    `;
    
    const enableAllBtn = document.createElement('button');
    enableAllBtn.textContent = '◈ HABILITAR TODO';
    enableAllBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-primary);
        padding: 6px 10px;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        flex: 1;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        font-weight: bold;
    `;
    
    const disableAllBtn = document.createElement('button');
    disableAllBtn.textContent = '◈ DESHABILITAR TODO';
    disableAllBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-primary);
        padding: 6px 10px;
        font-family: 'Courier New', monospace;
        font-size: 9px;
        letter-spacing: 2px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        flex: 1;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        font-weight: bold;
    `;
    
    [enableAllBtn, disableAllBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = 'var(--color-secondary)';
            btn.style.color = 'var(--color-secondary)';
            btn.style.boxShadow = '0 0 30px rgba(var(--color-primary-rgb), 0.2)';
            btn.style.textShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = `rgba(var(--color-primary-rgb), 0.4)`;
            btn.style.color = 'var(--color-primary)';
            btn.style.boxShadow = 'none';
            btn.style.textShadow = '0 0 10px rgba(var(--color-primary-rgb), 0.2)';
        });
    });
    
    enableAllBtn.addEventListener('click', () => {
        updateAllSwitches(true);
    });
    
    disableAllBtn.addEventListener('click', () => {
        updateAllSwitches(false);
    });
    
    btnRow.appendChild(enableAllBtn);
    btnRow.appendChild(disableAllBtn);
    configPanel.appendChild(btnRow);
    

    const switches = [
        { id: 'setting-grain', label: 'GRANO', key: 'grain', icon: '◈' },
        { id: 'setting-bloom', label: 'BLOOM', key: 'bloom', icon: '◊' },
        { id: 'setting-burnBlur', label: 'BURN BLUR', key: 'burnBlur', icon: '◆' },
        { id: 'setting-textura', label: 'TEXTURA', key: 'textura', icon: '▣' },
        { id: 'setting-animations', label: 'ANIMACIONES', key: 'animations', icon: '◍' },
        { id: 'setting-scanlines', label: 'SCANLINES', key: 'scanlines', icon: '▤' },
        { id: 'setting-vignette', label: 'VIGNETTE', key: 'vignette', icon: '▥' },
        { id: 'setting-flicker', label: 'FLICKER', key: 'flicker', icon: '▦' },
        { id: 'setting-glow', label: 'GLOW', key: 'glow', icon: '◐' }
    ];
    
    const switchContainer = document.createElement('div');
    switchContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-bottom: 16px;
    `;
    
    switches.forEach((sw) => {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 5px 0;
            border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.04);
            gap: 8px;
        `;
        
        const label = document.createElement('label');
        label.htmlFor = sw.id;
        label.innerHTML = `<span style="font-size:16px;margin-right:5px;display:inline-block;">${sw.icon}</span> ${sw.label}`;
        label.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: 11px;
            letter-spacing: 1px;
            cursor: pointer;
            text-transform: uppercase;
            white-space: nowrap;
            font-weight: bold;
            display: flex;
            align-items: center;
        `;
        
        const switchWrap = document.createElement('div');
        switchWrap.style.cssText = `
            position: relative;
            width: 44px;
            height: 24px;
            flex-shrink: 0;
            cursor: pointer;
        `;
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.id = sw.id;
        input.checked = currentSettings[sw.key];
        input.style.cssText = `
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;
            pointer-events: none;
        `;
        
        const slider = document.createElement('div');
        slider.style.cssText = `
            position: absolute;
            inset: 0;
            background: rgba(var(--color-primary-rgb), 0.15);
            border: 2px solid rgba(var(--color-primary-rgb), 0.25);
            border-radius: 12px;
            transition: all 0.3s ease;
            cursor: pointer;
        `;
        
        const knob = document.createElement('div');
        knob.style.cssText = `
            position: absolute;
            top: 4px;
            left: 2px;
            width: 16px;
            height: 16px;
            background: var(--color-primary);
            border-radius: 50%;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.3);
        `;
        
        if (input.checked) {
            slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
            knob.style.transform = 'translateX(20px)';
        }
        
        input.addEventListener('change', function(e) {
            e.stopPropagation();
            const checked = this.checked;
            
            if (checked) {
                slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
                knob.style.transform = 'translateX(20px)';
            } else {
                slider.style.background = `rgba(var(--color-primary-rgb), 0.15)`;
                knob.style.transform = 'translateX(0)';
            }
            
            currentSettings[sw.key] = checked;
            applySettings(currentSettings);
            saveSettings(currentSettings);
        });
        
        switchWrap.addEventListener('click', function(e) {
            e.stopPropagation();
            input.click();
        });
        
        switchWrap.appendChild(input);
        switchWrap.appendChild(slider);
        switchWrap.appendChild(knob);
        row.appendChild(label);
        row.appendChild(switchWrap);
        switchContainer.appendChild(row);
    });
    configPanel.appendChild(switchContainer);
    

    const commandsPanel = document.createElement('div');
    commandsPanel.style.cssText = `
        background: var(--color-bg);
        border: var(--dialog-border);
        border-radius: 20px;
        padding: 30px 35px;
        max-width: 300px;
        width: 100%;
        box-shadow: var(--dialog-shadow), var(--dialog-inset);
        position: relative;
        min-height: 630px;
        display: flex;
        flex-direction: column;
    `;
    
    const commandsTitle = document.createElement('h2');
    commandsTitle.textContent = '◆ COMANDOS';
    commandsTitle.style.cssText = `
        color: var(--color-primary);
        font-size: 18px;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
        letter-spacing: 6px;
        text-transform: uppercase;
        text-align: center;
        text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
        border-bottom: 2px solid rgba(var(--color-primary-rgb), 0.15);
        padding-bottom: 12px;
    `;
    commandsPanel.appendChild(commandsTitle);
    
    const commandList = [
        { key: 'E', desc: 'EXPORTAR' },
        { key: 'I', desc: 'IMPORTAR' },
        { key: 'P', desc: 'PROYECTOS' },
        { key: 'S', desc: 'SOBRE MI' },
        { key: 'C', desc: 'CONTACTO' },
        { key: 'M', desc: 'MENU' },
        { key: '␣', desc: 'RESET' },
        { key: 'A', desc: 'COORDENADAS' },
        { key: 'ESC', desc: 'CERRAR / INICIO' }
    ];
    
    const commandsContainer = document.createElement('div');
    commandsContainer.style.cssText = `
        display: flex;
        flex-direction: column;
        gap: 4px;
        flex: 1;
    `;
    
    commandList.forEach(cmd => {
        const row = document.createElement('div');
        row.style.cssText = `
            display: flex;
            align-items: center;
            gap: 10px;
            padding: 5px 0;
            border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.04);
        `;
        
        const keyIcon = document.createElement('span');
        keyIcon.textContent = cmd.key;
        keyIcon.style.cssText = `
            display: inline-flex;
            align-items: center;
            justify-content: center;
            min-width: 28px;
            height: 26px;
            padding: 0 6px;
            border: 1px solid rgba(var(--color-primary-rgb), 0.25);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 11px;
            font-weight: bold;
            color: var(--color-primary);
            background: rgba(var(--color-primary-rgb), 0.05);
            flex-shrink: 0;
            text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.15);
        `;
        
        const desc = document.createElement('span');
        desc.textContent = cmd.desc;
        desc.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: 10px;
            letter-spacing: 1px;
            opacity: 0.7;
            white-space: nowrap;
        `;
        
        row.appendChild(keyIcon);
        row.appendChild(desc);
        commandsContainer.appendChild(row);
    });
    commandsPanel.appendChild(commandsContainer);
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '[ CERRAR ]';
    closeBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-primary);
        padding: 8px 16px;
        font-family: 'Courier New', monospace;
        font-size: 11px;
        letter-spacing: 4px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        width: 100%;
        margin-top: auto;
        font-weight: bold;
    `;
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.borderColor = 'var(--color-secondary)';
        closeBtn.style.color = 'var(--color-secondary)';
        closeBtn.style.boxShadow = '0 0 30px rgba(var(--color-primary-rgb), 0.2)';
        closeBtn.style.textShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.4)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.borderColor = `rgba(var(--color-primary-rgb), 0.4)`;
        closeBtn.style.color = 'var(--color-primary)';
        closeBtn.style.boxShadow = 'none';
        closeBtn.style.textShadow = '0 0 10px rgba(var(--color-primary-rgb), 0.2)';
    });
    
    closeBtn.addEventListener('click', closeSettings);
    commandsPanel.appendChild(closeBtn);
    
    dialog.appendChild(configPanel);
    dialog.appendChild(commandsPanel);
    document.body.appendChild(dialog);
    
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) closeSettings();
    });
    
    dialog.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSettings();
    });
    
    settingsDialog = dialog;
    return settingsDialog;
}

export function openSettings() {
    if (!settingsDialog) createSettingsDialog();
    
    const switchIds = ['grain', 'gaussianBlur', 'bloom', 'burnBlur', 'textura', 'animations', 'scanlines', 'vignette', 'flicker', 'glow'];
    switchIds.forEach(key => {
        const el = document.getElementById(`setting-${key}`);
        if (el) {
            el.checked = currentSettings[key];
            const switchWrap = el.parentElement;
            const children = switchWrap.children;
            let slider = null;
            let knob = null;
            
            for (let child of children) {
                if (child.tagName === 'DIV' && child.style.borderRadius === '12px') {
                    slider = child;
                }
                if (child.tagName === 'DIV' && child.style.borderRadius === '50%') {
                    knob = child;
                }
            }
            
            if (slider && knob) {
                if (el.checked) {
                    slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
                    knob.style.transform = 'translateX(20px)';
                    knob.style.top = '4px';
                } else {
                    slider.style.background = `rgba(var(--color-primary-rgb), 0.15)`;
                    knob.style.transform = 'translateX(0)';
                    knob.style.top = '4px';
                }
            }
        }
    });
    
    settingsDialog.style.display = 'flex';
    settingsDialog.focus();
}

export function closeSettings() {
    if (settingsDialog) settingsDialog.style.display = 'none';
}

export function toggleSettings() {
    if (settingsDialog && settingsDialog.style.display === 'flex') {
        closeSettings();
    } else {
        openSettings();
    }
}

export function initSettings() {
    if (isInitialized) return;
    
    loadSettings();
    applySettings(currentSettings);
    createSettingsDialog();
    
    isInitialized = true;
}