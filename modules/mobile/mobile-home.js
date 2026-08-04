import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

export function renderMobileHome() {

    const container = document.getElementById('grid-container');
    if (!container) {
        console.error('Container no encontrado');
        return;
    }
    
    // Limpiar contenido anterior
    document.querySelectorAll('.mobile-home-content, .mobile-nav-btn, .mobile-btn-overlay').forEach(el => el.remove());
    
    // 🔥 CARGAR LOGO DESDE JSON
    fetch('./modules/mobile/logo-movil.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: No se pudo cargar logo-movil.json`);
            return response.json();
        })
        .then(design => {
            
            // Detener animaciones
            stopRandomAnimations();
            
            // Resetear grid y aplicar diseño
            resetGrid(false);
            
            importDesignFromJSON(design, () => {

                // 🔥 CREAR BOTONES DE NAVEGACIÓN MÓVIL
                createMobileNavButtons('inicio');
            }, true);
        })
        .catch(err => {
            console.error('Error cargando logo-movil.json:', err);
            // Fallback: diseño vacío
            stopRandomAnimations();
            resetGrid(false);
            importDesignFromJSON({}, () => {
                createMobileNavButtons('inicio');
            }, true);
        });
}