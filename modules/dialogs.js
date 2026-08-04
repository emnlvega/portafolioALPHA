// modules/dialogs.js

import { CONFIG } from './config.js';
import { importDesignFromJSON } from './logo.js';

// ===== DIÁLOGO GENÉRICO (custom-dialog) =====
export function showDialog(title, message) {
    const dialog = document.getElementById('custom-dialog');
    document.getElementById('dialog-title').textContent = title;
    document.getElementById('dialog-message').textContent = message;
    dialog.classList.add('active');
}

// Cerrar con botón
document.getElementById('dialog-close')?.addEventListener('click', () => {
    document.getElementById('custom-dialog').classList.remove('active');
});

// Cerrar click fuera
document.getElementById('custom-dialog')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
});

// ===== DIÁLOGO DE PROYECTOS =====
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

// ===== DIÁLOGO DE IMPORTACIÓN =====
export function showImportDialog() {
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
        
        // Título
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
        
        // Descripción
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
        
        // Textarea
        const textarea = document.createElement('textarea');
        textarea.id = 'import-textarea';
        textarea.placeholder = 'Pega aquí el JSON...';
        textarea.style.cssText = `
            width: 100%;
            height: 200px;
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
            margin-bottom: 20px;
            line-height: 1.5;
        `;
        textarea.addEventListener('focus', () => {
            textarea.style.borderColor = 'var(--color-secondary)';
        });
        textarea.addEventListener('blur', () => {
            textarea.style.borderColor = `rgba(var(--color-primary-rgb), 0.3)`;
        });
        content.appendChild(textarea);
        
        // Botones
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
        
        importBtn.addEventListener('click', () => {
            const jsonText = textarea.value.trim();
            if (!jsonText) {
                showDialog('ERROR', 'El campo está vacío. Pega un JSON válido.');
                return;
            }
            try {
                const json = JSON.parse(jsonText);
                importDesignFromJSON(json);
                dialog.classList.remove('active');
                // ← Eliminado showDialog de éxito
            } catch (err) {
                showDialog('ERROR', 'JSON inválido. Verifica el formato.\n\n' + err.message);
            }
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
        
        // Cerrar al hacer click fuera
        dialog.addEventListener('click', (e) => {
            if (e.target === dialog) {
                dialog.classList.remove('active');
            }
        });
        
        // Cerrar con Escape
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                dialog.classList.remove('active');
            }
        });
    }
    
    // Limpiar textarea y mostrar
    const textarea = document.getElementById('import-textarea');
    if (textarea) textarea.value = '';
    dialog.classList.add('active');
    // Enfocar el textarea
    setTimeout(() => {
        if (textarea) textarea.focus();
    }, 100);
}