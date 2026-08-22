import { CONFIG } from './config.js';
import { importDesignFromJSON } from './logo.js';
import { isSpecialPageActiveCheck } from './sidebar/index.js';

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
    return CONFIG.TEXT_SIZES || {
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
    return CONFIG.LETTER_SPACING || {
        title: 12,
        subTitle: 6,
        medium: 0.5,
        small: 1.5,
        tiny: 2
    };
}

export function showDialog(title, message) {
    const dialog = document.getElementById('custom-dialog');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-message').textContent = message;
    dialog.classList.add('active');
}

document.getElementById('dialog-close')?.addEventListener('click', () => {
    document.getElementById('custom-dialog').classList.remove('active');
});

document.getElementById('custom-dialog')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
});

export function showProjects() {
    const d = dicc || { dialogs: {} };
    const dialogTexts = d.dialogs || {};
    
    let dialog = document.getElementById('projects-dialog');
    
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'projects-dialog';
        dialog.innerHTML = `
            <div id="projects-content">
                <h2>${dialogTexts.projectsTitle}</h2>
                <div id="projects-grid"></div>
            </div>
        `;
        document.body.appendChild(dialog);
        dialog.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) {
                e.currentTarget.classList.remove('active');
                document.querySelectorAll('.sidebar-text').forEach(el => {
                    el.classList.remove('active');
                    el.style.color = CONFIG.COLORS.primary;
                });
            }
        });
    }
    
    const grid = document.getElementById('projects-grid');
    const projects = dialogTexts.projectsList || [
        { name: 'Branding', icon: '◆' },
        { name: 'UI/UX', icon: '◈' },
        { name: 'Ilustración', icon: '◉' },
        { name: 'Motion', icon: '◊' },
        { name: 'Web Design', icon: '◇' },
        { name: 'App Design', icon: '○' },
        { name: 'Logo', icon: '□' },
        { name: 'Packaging', icon: '△' },
        { name: 'Fotografía', icon: '▽' },
        { name: '3D', icon: '◍' }
    ];
    
    grid.innerHTML = '';
    projects.forEach(proj => {
        const item = document.createElement('div');
        item.className = 'project-item';
        const projectName = proj.name || proj;
        const projectIcon = proj.icon || '◆';
        item.innerHTML = `<span class="icon">${projectIcon}</span><span class="name">${projectName}</span>`;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const dialogTitle = dialogTexts.projectDialogTitle;
            const dialogMessage = (dialogTexts.projectDialogMessage).replace('%s', projectName);
            showDialog(dialogTitle, dialogMessage);
            dialog.classList.remove('active');
        });
        grid.appendChild(item);
    });
    
    dialog.classList.add('active');
}

export function showImportDialog() {
    if (isSpecialPageActiveCheck()) {
        return;
    }
    
    const d = dicc || { dialogs: {} };
    const dialogTexts = d.dialogs || {};
    const scriptTexts = d.script || {};
    const textSizes = getTextSizes();
    const letterSpacing = getLetterSpacing();
    
    let dialog = document.getElementById('import-dialog');
    
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'import-dialog';
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
            backdrop-filter: blur(10px);
            isolation: isolate;
        `;
        
        const content = document.createElement('div');
        content.id = 'import-content';
        content.style.cssText = `
            background: var(--color-bg);
            border: var(--dialog-border);
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 90%;
            text-align: center;
            box-shadow: var(--dialog-shadow), var(--dialog-inset);
            position: relative;
        `;
        
        const title = document.createElement('h2');
        title.textContent = dialogTexts.importTitle;
        title.style.cssText = `
            color: var(--color-primary);
            font-size: ${textSizes.subTitle + 4}px;
            margin-bottom: 20px;
            font-family: 'Courier New', monospace;
            letter-spacing: ${letterSpacing.subTitle}px;
            text-transform: uppercase;
            text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
            border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
            padding-bottom: 15px;
        `;
        content.appendChild(title);
        
        const desc = document.createElement('p');
        desc.textContent = dialogTexts.importDesc;
        desc.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 3}px;
            letter-spacing: ${letterSpacing.small}px;
            margin-bottom: 15px;
            opacity: 0.7;
        `;
        content.appendChild(desc);
        
        const textarea = document.createElement('textarea');
        textarea.id = 'import-textarea';
        textarea.placeholder = dialogTexts.importPlaceholder;
        textarea.style.cssText = `
            width: 100%;
            height: 180px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(var(--color-primary-rgb), 0.3);
            border-radius: 10px;
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 2}px;
            padding: 15px;
            resize: vertical;
            outline: none;
            transition: border-color 0.3s ease;
            margin-bottom: 15px;
            line-height: 1.5;
        `;
        textarea.addEventListener('focus', () => {
            textarea.style.borderColor = 'var(--color-secondary)';
        });
        textarea.addEventListener('blur', () => {
            textarea.style.borderColor = `rgba(var(--color-primary-rgb), 0.3)`;
        });
        content.appendChild(textarea);
        
        const checkboxRow = document.createElement('div');
        checkboxRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
            padding: 8px;
            border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.1);
        `;
        
        const checkboxLabel = document.createElement('label');
        checkboxLabel.htmlFor = 'import-noreset-checkbox';
        checkboxLabel.textContent = dialogTexts.importNoReset;
        checkboxLabel.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 1}px;
            letter-spacing: ${letterSpacing.small}px;
            cursor: pointer;
            text-transform: uppercase;
            opacity: 0.7;
            transition: opacity 0.3s ease;
        `;
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = 'import-noreset-checkbox';
        checkbox.checked = false;
        checkbox.style.cssText = `
            width: 16px;
            height: 16px;
            cursor: pointer;
            accent-color: var(--color-primary);
            flex-shrink: 0;
        `;
        
        checkbox.addEventListener('change', () => {
            checkboxLabel.style.opacity = checkbox.checked ? '1' : '0.7';
        });
        
        checkboxRow.appendChild(checkbox);
        checkboxRow.appendChild(checkboxLabel);
        content.appendChild(checkboxRow);
        
        const btnContainer = document.createElement('div');
        btnContainer.style.cssText = `
            display: flex;
            gap: 15px;
            justify-content: center;
        `;
        
        const importBtn = document.createElement('button');
        importBtn.textContent = dialogTexts.importBtn;
        importBtn.style.cssText = `
            background: transparent;
            border: 1px solid rgba(var(--color-primary-rgb), 0.4);
            color: var(--color-primary);
            padding: 10px 30px;
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 2}px;
            letter-spacing: ${letterSpacing.small + 1.5}px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 10px;
            text-shadow: 0 0 10px rgba(var(--color-primary-rgb), 0.2);
            flex: 1;
        `;
        importBtn.addEventListener('mouseenter', () => {
            importBtn.style.borderColor = 'var(--color-secondary)';
            importBtn.style.color = 'var(--color-secondary)';
            importBtn.style.boxShadow = '0 0 30px rgba(var(--color-primary-rgb), 0.2)';
            importBtn.style.textShadow = '0 0 20px rgba(var(--color-primary-rgb), 0.4)';
        });
        importBtn.addEventListener('mouseleave', () => {
            importBtn.style.borderColor = `rgba(var(--color-primary-rgb), 0.4)`;
            importBtn.style.color = 'var(--color-primary)';
            importBtn.style.boxShadow = 'none';
            importBtn.style.textShadow = '0 0 10px rgba(var(--color-primary-rgb), 0.2)';
        });
        
        const closeBtn = document.createElement('button');
        closeBtn.textContent = scriptTexts.closeBtn;
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid rgba(var(--color-primary-rgb), 0.2);
            color: rgba(var(--color-primary-rgb), 0.6);
            padding: 10px 30px;
            font-family: 'Courier New', monospace;
            font-size: ${textSizes.small + 2}px;
            letter-spacing: ${letterSpacing.small + 1.5}px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.3s ease;
            border-radius: 10px;
            flex: 1;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.borderColor = 'rgba(var(--color-primary-rgb), 0.5)';
            closeBtn.style.color = 'var(--color-primary)';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.borderColor = `rgba(var(--color-primary-rgb), 0.2)`;
            closeBtn.style.color = `rgba(var(--color-primary-rgb), 0.6)`;
        });
        closeBtn.addEventListener('click', () => {
            dialog.classList.remove('active');
        });
        
        btnContainer.appendChild(importBtn);
        btnContainer.appendChild(closeBtn);
        content.appendChild(btnContainer);
        
        dialog.appendChild(content);
        document.body.appendChild(dialog);
        
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.classList.remove('active');
            }
        });
        
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dialog.classList.remove('active');
            }
        });
        
        function performImport() {
            const jsonText = textarea.value.trim();
            if (!jsonText) {
                showDialog(dialogTexts.errorTitle || 'ERROR', dialogTexts.errorEmpty);
                return;
            }
            try {
                const json = JSON.parse(jsonText);
                const skipReset = checkbox.checked;
                const shouldReset = !skipReset;
                
                dialog.classList.remove('active');
                
                setTimeout(() => {
                    importDesignFromJSON(json, () => {}, shouldReset);
                }, 150);
            } catch (err) {
                const errorMsg = (dialogTexts.errorInvalid);
                showDialog(dialogTexts.errorTitle || 'ERROR', errorMsg);
            }
        }
        
        importBtn.addEventListener('click', performImport);
        
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                performImport();
            }
        });
    }
    
    const textarea = document.getElementById('import-textarea');
    if (textarea) {
        textarea.value = '';
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                const jsonText = textarea.value.trim();
                if (!jsonText) {
                    showDialog(dialogTexts.errorTitle);
                    return;
                }
                try {
                    const json = JSON.parse(jsonText);
                    const checkbox = document.getElementById('import-noreset-checkbox');
                    const skipReset = checkbox ? checkbox.checked : false;
                    const shouldReset = !skipReset;
                    
                    document.getElementById('import-dialog').classList.remove('active');
                    
                    setTimeout(() => {
                        importDesignFromJSON(json, () => {}, shouldReset);
                    }, 150);
                } catch (err) {
                    const errorMsg = (dialogTexts.errorInvalid);
                    showDialog(dialogTexts.errorTitle || 'ERROR', errorMsg);
                }
            }
        });
    }
    
    const checkbox = document.getElementById('import-noreset-checkbox');
    if (checkbox) {
        checkbox.checked = false;
        const label = checkbox.parentElement.querySelector('label');
        if (label) label.style.opacity = '0.7';
    }
    
    dialog.classList.add('active');
    setTimeout(() => {
        if (textarea) textarea.focus();
    }, 100);
}

loadDicc();