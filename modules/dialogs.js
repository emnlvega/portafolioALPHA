

import { CONFIG } from './config.js';
import { importDesignFromJSON } from './logo.js';
import { isSpecialPageActiveCheck } from './sidebar/index.js';


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
    let dialog = document.getElementById('projects-dialog');
    
    if (!dialog) {
        dialog = document.createElement('div');
        dialog.id = 'projects-dialog';
        dialog.innerHTML = `
            <div id="projects-content">
                <h2>▲ PROYECTOS</h2>
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
    const projects = [
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
        item.innerHTML = `<span class="icon">${proj.icon}</span><span class="name">${proj.name}</span>`;
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            showDialog('PROYECTO', `Detalles de ${proj.name}\n\nPróximamente...`);
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
        title.textContent = '◆ IMPORTAR DISEÑO';
        title.style.cssText = `
            color: var(--color-primary);
            font-size: 20px;
            margin-bottom: 20px;
            font-family: 'Courier New', monospace;
            letter-spacing: 4px;
            text-transform: uppercase;
            text-shadow: 0 0 30px rgba(var(--color-primary-rgb), 0.3);
            border-bottom: 1px solid rgba(var(--color-primary-rgb), 0.2);
            padding-bottom: 15px;
        `;
        content.appendChild(title);
        

        const desc = document.createElement('p');
        desc.textContent = 'Pega el JSON del diseño en el área de abajo:';
        desc.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: 13px;
            letter-spacing: 1px;
            margin-bottom: 15px;
            opacity: 0.7;
        `;
        content.appendChild(desc);
        

        const textarea = document.createElement('textarea');
        textarea.id = 'import-textarea';
        textarea.placeholder = 'Pega aquí el JSON...';
        textarea.style.cssText = `
            width: 100%;
            height: 180px;
            background: rgba(0, 0, 0, 0.5);
            border: 1px solid rgba(var(--color-primary-rgb), 0.3);
            border-radius: 10px;
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: 12px;
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
        checkboxLabel.textContent = 'NO resetear grid';
        checkboxLabel.style.cssText = `
            color: var(--color-primary);
            font-family: 'Courier New', monospace;
            font-size: 11px;
            letter-spacing: 1px;
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
        importBtn.textContent = '✓ IMPORTAR';
        importBtn.style.cssText = `
            background: transparent;
            border: 1px solid rgba(var(--color-primary-rgb), 0.4);
            color: var(--color-primary);
            padding: 10px 30px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 4px;
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
        closeBtn.textContent = '[ CERRAR ]';
        closeBtn.style.cssText = `
            background: transparent;
            border: 1px solid rgba(var(--color-primary-rgb), 0.2);
            color: rgba(var(--color-primary-rgb), 0.6);
            padding: 10px 30px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            letter-spacing: 4px;
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
                showDialog('ERROR', 'El campo está vacío. Pega un JSON válido.');
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
                showDialog('ERROR', 'JSON inválido. Verifica el formato.\n\n' + err.message);
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
                    showDialog('ERROR', 'El campo está vacío. Pega un JSON válido.');
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
                    showDialog('ERROR', 'JSON inválido. Verifica el formato.\n\n' + err.message);
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