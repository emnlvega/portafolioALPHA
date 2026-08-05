import { CONFIG } from '../config.js';
import { importDesignFromJSON } from '../logo.js';
import { resetGrid } from '../interactions.js';
import { stopRandomAnimations } from '../animations.js';
import { createMobileNavButtons } from './mobile-nav.js';

export function renderMobileHome() {

    const container = document.getElementById('grid-container');
    if (!container) {
        return;
    }
    

    document.querySelectorAll('.mobile-home-content, .mobile-nav-btn, .mobile-btn-overlay').forEach(el => el.remove());
    

    fetch('./modules/mobile/logo-movil.json')
        .then(response => {
            if (!response.ok) throw new Error(`HTTP ${response.status}: No se pudo cargar logo-movil.json`);
            return response.json();
        })
        .then(design => {
            

            stopRandomAnimations();
            

            resetGrid(false);
            
            importDesignFromJSON(design, () => {


                createMobileNavButtons('inicio');
            }, true);
        })
        .catch(err => {

            stopRandomAnimations();
            resetGrid(false);
            importDesignFromJSON({}, () => {
                createMobileNavButtons('inicio');
            }, true);
        });
}