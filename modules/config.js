import { isMobile } from './mobile.js';
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

export function createColors(primary, secondary, background = '#000000') {
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
        get scanlineColor() { return `rgba(0, 0, 0, .3)`; },
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
    ANIMATION_DURATION: 10,
    ANIMATION_DURATION_LOGO: 700,
    LOGO_DELAY_COMBINED: 0,
    LOGO_DELAY: 0,
    ENABLE_EXPORT: true,
    ENABLE_IMPORT: true,
    BG_DOT_SIZE: 3,
    BG_DOT_OPACITY: 0.15,
    BG_MOUSE_SENSITIVITY: 0.02,
    COLORS: createColors('#00FF9B', '#ffffff', '#000000'),
    

    ARCHITECT_MODE: {
        ENABLED: true,
        TOGGLE_KEY: 'KeyA',
        FONT_SIZE: 11,
        OPACITY: 1,
        SHOW_GRID: false,
        COLOR: '#ffffff'
    },
    

    ANIMATIONS: {
        TARGET_CELLS: 'all',

        SCALE: {
            ENABLED: true,//
            DURATION: 2000,
            SCALE_FACTOR: 1.07,
            MIN_INTERVAL: 1000,
            MAX_INTERVAL: 5000,
            MAX_SIMULTANEOUS: 5,
        },
        

        COLOR: {
            ENABLED: false,
            DURATION: 6000,
            MIN_INTERVAL: 600,
            MAX_INTERVAL: 1500,
            MAX_SIMULTANEOUS: 0,
        },
        

        GLOW: {
            ENABLED: false,//
            DURATION: 3000,
            MIN_INTERVAL: 100,
            MAX_INTERVAL: 100,
            MAX_SIMULTANEOUS: 3,
            INTENSITY: 10
        },
        

        ROTATE: {
            ENABLED: false,
            DURATION: 4000,
            MIN_INTERVAL: 100,
            MAX_INTERVAL: 100,
            MAX_SIMULTANEOUS: 2,
            ROTATION_ANGLE: 3
        },
        

        BORDER_SHIFT: {
            ENABLED: true,//
            DURATION: 2500,
            MIN_INTERVAL: 1500,
            MAX_INTERVAL: 11000,
            MAX_SIMULTANEOUS: 4,
            SHIFT_AMOUNT: 3
        },
        

        OPACITY_WAVE: {
            ENABLED: true,//
            DURATION: 2000,
            MIN_INTERVAL: 200,
            MAX_INTERVAL: 200,
            MAX_SIMULTANEOUS: 20,
            MIN_OPACITY: 0.3,
            MAX_OPACITY: 1.0
        }
    }
};

export function getTextSizes() {
    const width = window.innerWidth;
    
    let modifier = 0;
    
    if (width <= 1280) {
        modifier = -8;
    } else if (width <= 1440) {
        modifier = -6;
    } else if (width <= 1600) {
        modifier = -4;
    } else if (width <= 1920) {
        modifier = 0;
    } else if (width <= 2560) {
        modifier = 2;
    } else if (width <= 3840) {
        modifier = 4;
    } else {
        modifier = 6;
    }
    
    return {
        title: Math.max(12, 32 + modifier),
        arrows: Math.max(10, 28 + modifier),
        projectIcon: Math.max(10, 24 + modifier),
        normalTitle: Math.max(10, 20 + modifier),
        subTitle: Math.max(8, 16 + modifier),
        medium: Math.max(6, 12 + modifier),
        small: Math.max(6, 10 + modifier),
        tiny: Math.max(6, 8 + modifier)
    };
}

export function getResponsiveConfig() {
    const width = window.innerWidth;
    
    let cellSize = 38;
    let gap = 15;
    let textModifier = 0;
    let letterSpacingModifier = 0;
    
    if (width <= 1280) {
        cellSize = 27;
        gap = 8;
        textModifier = -4;
        letterSpacingModifier = -3;
    } else if (width <= 1440) {
        cellSize = 30;
        gap = 10;
        textModifier = -4;
        letterSpacingModifier = -1;
    } else if (width <= 1600) {
        cellSize = 33;
        gap = 12;
        textModifier = -2;
        letterSpacingModifier = 0;
    } else if (width <= 1920) {
        cellSize = 38;
        gap = 15;
        textModifier = 0;
        letterSpacingModifier = 0;
    } else if (width <= 2560) {
        cellSize = 42;
        gap = 18;
        textModifier = 2;
        letterSpacingModifier = 1;
    } else if (width <= 3840) {
        cellSize = 48;
        gap = 22;
        textModifier = 4;
        letterSpacingModifier = 2;
    } else {
        cellSize = 54;
        gap = 26;
        textModifier = 6;
        letterSpacingModifier = 3;
    }
    
    const baseSizes = {
        title: 32,
        arrows: 28,
        projectIcon: 24,
        normalTitle: 20,
        subTitle: 16,
        medium: 15,
        medium: 14,
        small: 12,
        tiny: 10
    };
    
    const baseLetterSpacing = {
        title: 12,
        subTitle: 6,
        medium: 0.2,
        medium: 0.5,
        small: 2,
        tiny: 2.5
    };
    
    const textSizes = {};
    const letterSpacing = {};
    const lineHeight = {};
    
    Object.keys(baseSizes).forEach(key => {
        textSizes[key] = Math.max(6, baseSizes[key] + textModifier);
    });
    
    Object.keys(baseLetterSpacing).forEach(key => {
        letterSpacing[key] = Math.max(0, baseLetterSpacing[key] + (letterSpacingModifier * 0.5));
    });
    
    lineHeight.title = 1.2;
    lineHeight.subTitle = 1;
    lineHeight.big = 1.8;
    lineHeight.medium = 1.7;
    lineHeight.small = 1.6;
    lineHeight.tiny = 1.5;
    
    return {
        CELL_SIZE: cellSize,
        GAP: gap,
        TEXT_MODIFIER: textModifier,
        TEXT_SIZES: textSizes,
        LETTER_SPACING: letterSpacing,
        LINE_HEIGHT: lineHeight
    };
}

export function updateColors(newPrimary, newSecondary = '#ffffff', newBackground = '#000000') {
    const newColors = createColors(newPrimary, newSecondary, newBackground);
    CONFIG.COLORS = newColors;
    

    const event = new CustomEvent('colorsUpdated', { 
        detail: { colors: newColors } 
    });
    document.dispatchEvent(event);
    
    return CONFIG.COLORS;
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
  "7,5": {
    "type": "combined_red",
    "left": 464,
    "top": 394,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "7,7": "logo",
  "7,8": {
    "type": "combined_red",
    "left": 623,
    "top": 394,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "7,9": "logo",
  "7,10": "logo",
  "7,12": {
    "type": "combined_red",
    "left": 835,
    "top": 394,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "7,13": {
    "type": "combined_red",
    "left": 888,
    "top": 394,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "7,16": {
    "type": "combined_red",
    "left": 1047,
    "top": 394,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "7,18": "logo",
  "7,19": "logo",
  "7,20": {
    "type": "combined_red",
    "left": 1259,
    "top": 394,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "7,22": "logo",
  "7,23": {
    "type": "combined_red",
    "left": 1418,
    "top": 394,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "7,25": {
    "type": "combined_red",
    "left": 1524,
    "top": 394,
    "width": 144,
    "height": 38,
    "combined": true
  },
  "8,4": {
    "type": "combined_red",
    "left": 411,
    "top": 447,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "8,7": {
    "type": "combined_red",
    "left": 570,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "8,9": {
    "type": "combined_red",
    "left": 676,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "8,10": {
    "type": "combined_red",
    "left": 729,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "8,11": "logo",
  "8,18": "logo",
  "8,19": {
    "type": "combined_red",
    "left": 1206,
    "top": 447,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "8,22": {
    "type": "combined_red",
    "left": 1365,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "8,24": "logo",
  "8,25": {
    "type": "combined_red",
    "left": 1524,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "8,26": "logo",
  "8,27": {
    "type": "combined_red",
    "left": 1630,
    "top": 447,
    "width": 38,
    "height": 91,
    "combined": true
  },
  "9,4": "logo",
  "9,5": {
    "type": "combined_red",
    "left": 464,
    "top": 500,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "9,12": "logo",
  "9,13": "logo",
  "9,14": {
    "type": "combined_red",
    "left": 941,
    "top": 500,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "9,16": {
    "type": "combined_red",
    "left": 1047,
    "top": 500,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "9,19": "logo",
  "9,20": {
    "type": "combined_red",
    "left": 1259,
    "top": 500,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "9,23": {
    "type": "combined_red",
    "left": 1418,
    "top": 500,
    "width": 91,
    "height": 38,
    "combined": true
  },
  "14,0": {
    "type": "combined_normal",
    "left": 199,
    "top": 765,
    "width": 303,
    "height": 144,
    "combined": true
  },
  "14,6": {
    "type": "combined_normal",
    "left": 517,
    "top": 765,
    "width": 303,
    "height": 144,
    "combined": true
  },
  "14,12": {
    "type": "combined_normal",
    "left": 835,
    "top": 765,
    "width": 303,
    "height": 144,
    "combined": true
  },
  "14,18": {
    "type": "combined_normal",
    "left": 1153,
    "top": 765,
    "width": 303,
    "height": 144,
    "combined": true
  },
  "14,24": {
    "type": "combined_normal",
    "left": 1471,
    "top": 765,
    "width": 303,
    "height": 144,
    "combined": true
  },
  "14,30": {
    "type": "combined_logo",
    "left": 1789,
    "top": 765,
    "width": 91,
    "height": 144,
    "combined": true
  }
};