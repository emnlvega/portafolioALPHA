function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    if (hex.length === 3) {
        hex = hex.split('').map(c => c + c).join('');
    }
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

function createColors(primary, secondary, background = '#000000') {
    const primaryRGB = hexToRgb(primary);
    const secondaryRGB = hexToRgb(secondary);
    const backgroundRGB = hexToRgb(background);
    
    return {
        primary: primary,
        secondary: secondary,
        background: background,
        primaryRGB: primaryRGB,
        secondaryRGB: secondaryRGB,
        backgroundRGB: backgroundRGB,
        
        get primaryDim() { return `rgba(${this.primaryRGB}, 0.3)`; },
        get primaryVeryDim() { return `rgba(${this.primaryRGB}, 0.2)`; },
        get secondaryDim() { return `rgba(${this.secondaryRGB}, 1)`; },
        get scanlineColor() { return `rgba(0, 0, 0, .5)`; },
        get vignetteColor() { return `rgba(0, 0, 0, 0.7)`; },
        get bloomColor() { return `rgba(${this.primaryRGB}, 0.06)`; }
    };
}

let currentConfig = {
    GAP: 15,
    SIDEBAR_WIDTH: 3,
    COLS: 35,
    ROWS: 17,
    CELL_SIZE: 38,
    BORDER_RADIUS: 4,
    ANIMATION_DURATION: 800,
    ANIMATION_DURATION_LOGO: 800,
    LOGO_DELAY_COMBINED: 0,
    LOGO_DELAY: 0,
    ENABLE_EXPORT: true,
    ENABLE_IMPORT: true,
    BG_DOT_SIZE: 3,
    BG_DOT_OPACITY: 0.15,
    BG_MOUSE_SENSITIVITY: 0.02,
    COLORS: createColors('#00ff91', '#ffffff', '#000000'),
    
    // ===== MODO ARQUITECTO =====
    ARCHITECT_MODE: {
        ENABLED: true,          // Habilitar/deshabilitar completamente
        TOGGLE_KEY: 'KeyA',     // Tecla para activar/desactivar
        FONT_SIZE: 11,          // Tamaño de fuente de las coordenadas
        OPACITY: 0.7,           // Opacidad del fondo de las etiquetas
        SHOW_GRID: true,        // Mostrar borde de grid
        COLOR: '#00ff91'        // Color de las coordenadas
    },
    
    // ===== CONFIGURACIÓN DE ANIMACIONES ALEATORIAS (REDUCIDAS 50%) =====
    ANIMATIONS: {
        TARGET_CELLS: 'all',
        // Animación de escala (pulse)
        SCALE: {
            ENABLED: true,
            DURATION: 2000,
            SCALE_FACTOR: 1.07,
            MIN_INTERVAL: 1000,
            MAX_INTERVAL: 9000,
            MAX_SIMULTANEOUS: 5,
        },
        
        // Animación de color (fill primary)
        COLOR: {
            ENABLED: false,
            DURATION: 2000,
            MIN_INTERVAL: 8000,
            MAX_INTERVAL: 20000,
            MAX_SIMULTANEOUS: 2,
        },
        
        // Brillo sutil (glow pulse)
        GLOW: {
            ENABLED: true,
            DURATION: 3000,
            MIN_INTERVAL: 1000,
            MAX_INTERVAL: 9000,
            MAX_SIMULTANEOUS: 3,
            INTENSITY: 10
        },
        
        // Rotación sutil
        ROTATE: {
            ENABLED: false,
            DURATION: 4000,
            MIN_INTERVAL: 12000,
            MAX_INTERVAL: 30000,
            MAX_SIMULTANEOUS: 2,
            ROTATION_ANGLE: 3
        },
        
        // Desplazamiento de borde
        BORDER_SHIFT: {
            ENABLED: true,
            DURATION: 2500,
            MIN_INTERVAL: 4000,
            MAX_INTERVAL: 18000,
            MAX_SIMULTANEOUS: 4,
            SHIFT_AMOUNT: 2
        },
        
        // Oscilación de opacidad
        OPACITY_WAVE: {
            ENABLED: true,
            DURATION: 2000,
            MIN_INTERVAL: 1000,
            MAX_INTERVAL: 9000,
            MAX_SIMULTANEOUS: 3,
            MIN_OPACITY: 0.3,
            MAX_OPACITY: 1.0
        }
    }
};

export function updateColors(newPrimary, newSecondary = '#ffffff', newBackground = '#000000') {
    currentConfig.COLORS = createColors(newPrimary, newSecondary, newBackground);
    const event = new CustomEvent('colorsUpdated', { 
        detail: { colors: currentConfig.COLORS } 
    });
    document.dispatchEvent(event);
    return currentConfig.COLORS;
}

export function getCurrentColors() {
    return currentConfig.COLORS;
}

export const CONFIG = new Proxy(currentConfig, {
    get(target, prop) {
        return target[prop];
    },
    set(target, prop, value) {
        target[prop] = value;
        return true;
    }
});

export const LOGO_DESIGN = {
    "7,4": "logo",
    "7,5": "h_red",
    "7,7": "logo",
    "7,8": "v_red",
    "7,9": "logo",
    "7,10": "logo",
    "7,12": "v_red",
    "7,13": "v_red",
    "7,16": "v_red",
    "7,18": "logo",
    "7,19": "logo",
    "7,20": "h_red",
    "7,22": "logo",
    "7,23": "h_red",
    "7,25": "hh_red",
    "8,4": "h_red",
    "8,7": "v_red",
    "8,9": "v_red",
    "8,10": "v_red",
    "8,11": "logo",
    "8,18": "logo",
    "8,19": "h_red",
    "8,22": "v_red",
    "8,24": "logo",
    "8,25": "v_red",
    "8,26": "logo",
    "8,27": "v_red",
    "9,4": "logo",
    "9,5": "h_red",
    "9,12": "logo",
    "9,13": "logo",
    "9,14": "h_red",
    "9,16": "h_red",
    "9,19": "logo",
    "9,20": "h_red",
    "9,23": "h_red"
};