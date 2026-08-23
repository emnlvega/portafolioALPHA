import { CONFIG, updateColors, createColors } from './config.js';
import { restartRandomAnimations, stopRandomAnimations } from './animations.js';

let dicc = null;

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

function getTextSizes() {
    if (CONFIG.TEXT_SIZES && typeof CONFIG.TEXT_SIZES === 'object') {
        return CONFIG.TEXT_SIZES;
    }
    return {
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
    if (CONFIG.LETTER_SPACING && typeof CONFIG.LETTER_SPACING === 'object') {
        return CONFIG.LETTER_SPACING;
    }
    return {
        title: 12,
        subTitle: 6,
        medium: 0.5,
        small: 1.5,
        tiny: 2
    };
}

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
    

    let overlay = document.getElementById(ELEMENTS.overlay);
    
    if (settings.textura) {
        if (!overlay) {

            import('./overlay.js').then(module => {
                module.initOverlays();
                setTimeout(() => {
                    const newOverlay = document.getElementById('overlay-container');
                    if (newOverlay) {
                        newOverlay.classList.remove('overlay-hidden');
                        newOverlay.classList.add('overlay-visible');
                        newOverlay.style.display = 'block';
                    }
                }, 100);
            });
        } else {

            overlay.classList.remove('overlay-hidden');
            overlay.classList.add('overlay-visible');
            overlay.style.display = 'block';
            overlay.style.setProperty('display', 'block', 'important');
        }
    } else {

        if (overlay) {
            overlay.classList.remove('overlay-visible');
            overlay.classList.add('overlay-hidden');
            overlay.style.display = 'none';
            overlay.style.setProperty('display', 'none', 'important');
        }
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

export function updateAllSwitches(value) {
    const switchKeys = ['grain', 'gaussianBlur', 'bloom', 'textura', 'animations', 'vignette', 'flicker', 'glow'];
    
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
    
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    const d = dicc || { settings: {}, script: {} };
    const scriptTexts = d.script || {};
    const settingsTexts = d.settings || {};
    

    const isMobileDevice = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    
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
        padding: ${isMobileDevice ? '20px 20px' : '30px 35px'};
        max-width: ${isMobileDevice ? '320px' : '360px'};
        width: 100%;
        box-shadow: var(--dialog-shadow), var(--dialog-inset);
        position: relative;
        min-height: ${isMobileDevice ? 'auto' : '630px'};
        display: flex;
        flex-direction: column;
    `;
    
    const configTitle = document.createElement('h2');
    configTitle.textContent = scriptTexts.settingsTitle || ' ';
    configTitle.style.cssText = `
        color: var(--color-primary);
        font-size: ${textSizes.subTitle + 2}px;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
        letter-spacing: ${letterSpacing.subTitle}px;
        text-transform: uppercase;
        text-align: center;
        text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
        border-bottom: 2px solid rgba(var(--color-secondary-rgb), 1);
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
        border-bottom: 2px solid rgba(var(--color-secondary-rgb), 1);
        flex-wrap: wrap;
        gap: 8px;
    `;
    
    const colorLabel = document.createElement('span');
    colorLabel.textContent = scriptTexts.colorPickerLabel || ' ';
    colorLabel.style.cssText = `
        color: var(--color-secondary);
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.small + 1}px;
        letter-spacing: ${letterSpacing.small + 0.5}px;
        text-transform: uppercase;
        font-weight: bold;
    `;
    
    const colorWrap = document.createElement('div');
    colorWrap.style.cssText = `
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
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
    colorHex.textContent = CONFIG.COLORS.secondary.toUpperCase();
    colorHex.style.cssText = `
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.small + 1}px;
        letter-spacing: ${letterSpacing.small + 0.5}px;
        color: var(--color-secondary);
        min-width: 50px;
        font-weight: bold;
    `;
    
    const applyColorBtn = document.createElement('button');
    applyColorBtn.textContent = scriptTexts.colorPickerApply || ' ';
    applyColorBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 1);
        color: var(--color-secondary);
        padding: 4px 14px;
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.small}px;
        letter-spacing: ${letterSpacing.small + 0.5}px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 4px;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
    `;
    
    const resetColorBtn = document.createElement('button');
    resetColorBtn.textContent = scriptTexts.colorPickerReset || '⟳';
    resetColorBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 1);
        color: var(--color-primary);
        padding: 4px 8px;
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.small + 2}px;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 4px;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        line-height: 1;
    `;
    resetColorBtn.title = scriptTexts.colorPickerResetTitle || ' ';
    
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
        

        const overlay = document.getElementById('overlay-container');
        if (overlay) {
            overlay.style.display = currentSettings.textura ? 'block' : 'none';
        }
        
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
    enableAllBtn.textContent = scriptTexts.enableAll || ' ';
    enableAllBtn.style.cssText = `
        background: var(--color-primary);
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-background);
        padding: 6px 10px;
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.tiny + 1}px;
        letter-spacing: ${letterSpacing.tiny}px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        flex: 1;
        text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
        font-weight: bold;
    `;
    
    const disableAllBtn = document.createElement('button');
    disableAllBtn.textContent = scriptTexts.disableAll || ' ';
    disableAllBtn.style.cssText = `
        background: transparent;
        border: 1px solid rgba(var(--color-primary-rgb), 0.4);
        color: var(--color-primary);
        padding: 6px 10px;
        font-family: 'Courier New', monospace;
        font-size: ${textSizes.tiny + 1}px;
        letter-spacing: ${letterSpacing.tiny}px;
        text-transform: uppercase;
        cursor: pointer;
        transition: all 0.3s ease;
        border-radius: 6px;
        flex: 1;
        text-shadow: 0 0 10px rgba(var(--color-background-rgb), 0.2);
        font-weight: bold;
    `;
    
    [enableAllBtn, disableAllBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.borderColor = 'var(--color-secondary)';
            btn.style.boxShadow = '0 0 30px rgba(var(--color-primary-rgb), 0.2)';
            btn.style.textShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.4)';
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.borderColor = `rgba(var(--color-primary-rgb), 0.4)`;
            btn.style.boxShadow = 'none';
            btn.style.textShadow = '0 0 10px rgba(var(--color-background-rgb), 0.2)';
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
        { id: 'setting-grain', label: 'grain', key: 'grain', icon: '◈' },
        { id: 'setting-bloom', label: 'bloom', key: 'bloom', icon: '◊' },
        { id: 'setting-textura', label: 'textura', key: 'textura', icon: '▣' },
        { id: 'setting-animations', label: 'animations', key: 'animations', icon: '◍' },
        { id: 'setting-vignette', label: 'vignette', key: 'vignette', icon: '▥' },
        { id: 'setting-flicker', label: 'flicker', key: 'flicker', icon: '▦' },
        { id: 'setting-glow', label: 'glow', key: 'glow', icon: '◐' }
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
        
        const labelText = scriptTexts.switchLabels ? scriptTexts.switchLabels[sw.key] : sw.label;
        const iconText = scriptTexts.switchIcons ? scriptTexts.switchIcons[sw.key] : sw.icon;
        
        const label = document.createElement('label');
        label.htmlFor = sw.id;
        label.innerHTML = `<span style="font-size:${textSizes.projectIcon - 8}px;margin-right:5px;display:inline-block;">${iconText}</span> ${labelText}`;
        label.style.cssText = `
            color: var(--color-secondary);
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 1}px;
            letter-spacing: ${letterSpacing.small + 0.5}px;
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
            const key = this.id.replace('setting-', '');
            

            if (checked) {
                slider.style.background = `rgba(var(--color-primary-rgb), 0.4)`;
                knob.style.transform = 'translateX(20px)';
            } else {
                slider.style.background = `rgba(var(--color-primary-rgb), 0.15)`;
                knob.style.transform = 'translateX(0)';
            }
            
            currentSettings[key] = checked;
            

            applySettings(currentSettings);
            saveSettings(currentSettings);
            

            if (key === 'textura') {
                const overlay = document.getElementById('overlay-container');
                if (overlay) {
                    if (checked) {
                        overlay.classList.remove('overlay-hidden');
                        overlay.classList.add('overlay-visible');
                        overlay.style.display = 'block';
                        overlay.style.setProperty('display', 'block', 'important');
                    } else {
                        overlay.classList.remove('overlay-visible');
                        overlay.classList.add('overlay-hidden');
                        overlay.style.display = 'none';
                        overlay.style.setProperty('display', 'none', 'important');
                    }
                }
            }
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
        min-height: ${isMobileDevice ? '0' : '630px'};
        display: ${isMobileDevice ? 'none' : 'flex'};
        flex-direction: column;
    `;
    
    const commandsTitle = document.createElement('h2');
    commandsTitle.textContent = scriptTexts.commandsTitle || ' ';
    commandsTitle.style.cssText = `
        color: var(--color-primary);
        font-size: ${textSizes.subTitle + 2}px;
        margin-bottom: 20px;
        font-family: 'Courier New', monospace;
        letter-spacing: ${letterSpacing.subTitle}px;
        text-transform: uppercase;
        text-align: center;
        text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
        border-bottom: 2px solid rgba(var(--color-secondary-rgb), 1);
        padding-bottom: 12px;
    `;
    commandsPanel.appendChild(commandsTitle);
    
    const cmdTexts = scriptTexts.commands || {};
    const commandList = [
        { key: 'E', desc: cmdTexts.export || ' ' },
        { key: 'I', desc: cmdTexts.import || ' ' },
        { key: 'P', desc: cmdTexts.proyectos || ' ' },
        { key: 'S', desc: cmdTexts.sobreMi || '   ' },
        { key: 'C', desc: cmdTexts.contacto || ' ' },
        { key: 'M', desc: cmdTexts.menu || ' ' },
        { key: '␣', desc: cmdTexts.reset || ' ' },
        { key: 'A', desc: cmdTexts.coordenadas || ' ' },
        { key: 'ESC', desc: cmdTexts.cerrar || ' ' }
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
            border: 1px solid rgba(var(--color-primary-rgb), 0.7);
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 1}px;
            font-weight: bold;
            color: var(--color-secondary);
            background: rgba(var(--color-background-rgb), 1);
            flex-shrink: 0;
            text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 1);
        `;
        
        const desc = document.createElement('span');
        desc.textContent = cmd.desc;
        desc.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small}px;
            letter-spacing: ${letterSpacing.small + 0.5}px;
            opacity: 0.7;
            white-space: nowrap;
        `;
        
        row.appendChild(keyIcon);
        row.appendChild(desc);
        commandsContainer.appendChild(row);
    });
    commandsPanel.appendChild(commandsContainer);
    

const closeBtn = document.createElement('button');
closeBtn.textContent = scriptTexts.closeBtn || '   ';
closeBtn.style.cssText = `
    background: transparent;
    border: 1px solid rgba(var(--color-primary-rgb), 0.4);
    color: var(--color-secondary);
    padding: 8px 16px;
    font-family: 'Courier New', monospace;
    font-size: ${textSizes.small + 1}px;
    letter-spacing: ${letterSpacing.subTitle - 2}px;
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
    closeBtn.style.boxShadow = '0 0 30px rgba(var(--color-primary-rgb), 0.2)';
    closeBtn.style.textShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.4)';
});
closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.borderColor = `rgba(var(--color-primary-rgb), 0.4)`;
    closeBtn.style.boxShadow = 'none';
    closeBtn.style.textShadow = '0 0 10px rgba(var(--color-primary-rgb), 0.2)';
});

closeBtn.addEventListener('click', closeSettings);


if (isMobileDevice) {
    configPanel.appendChild(closeBtn);
    closeBtn.style.marginTop = '16px';
    closeBtn.style.width = '100%';
    closeBtn.style.padding = '10px';
    closeBtn.style.fontSize = '12px';
} else {
    configPanel.appendChild(closeBtn);
}
    
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


export function openSettingsMobile() {
    if (!settingsDialog) createSettingsDialog();
    

    const switchIds = ['grain', 'bloom', 'textura', 'animations', 'vignette', 'flicker', 'glow'];
    switchIds.forEach(key => {
        const el = document.getElementById(`setting-${key}`);
        if (el) {
            el.checked = currentSettings[key] || false;
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
            

            if (key === 'textura') {
                const overlay = document.getElementById('overlay-container');
                if (overlay) {
                    if (el.checked) {
                        overlay.classList.remove('overlay-hidden');
                        overlay.classList.add('overlay-visible');
                        overlay.style.display = 'block';
                        overlay.style.setProperty('display', 'block', 'important');
                    } else {
                        overlay.classList.remove('overlay-visible');
                        overlay.classList.add('overlay-hidden');
                        overlay.style.display = 'none';
                        overlay.style.setProperty('display', 'none', 'important');
                    }
                } else if (el.checked) {
                    import('./overlay.js').then(module => {
                        module.initOverlays();
                        setTimeout(() => {
                            const newOverlay = document.getElementById('overlay-container');
                            if (newOverlay) {
                                newOverlay.classList.remove('overlay-hidden');
                                newOverlay.classList.add('overlay-visible');
                                newOverlay.style.display = 'block';
                            }
                        }, 100);
                    });
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
    
    loadDicc().then(() => {
        loadSettings();
        applySettings(currentSettings);
        createSettingsDialog();
        isInitialized = true;
    });
}