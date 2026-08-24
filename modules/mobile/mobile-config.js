export const MOBILE_CONFIG = {
    GRID: {
        COLS: 20,
        ROWS: 36,
        CELL_SIZE: 14,
        GAP: 5,
        SIDEBAR_WIDTH: 0,
        BORDER_RADIUS: 10
    },
    
    FONT_SIZES: {
        sidebar: 8,
        logo: 9,
        title: 14,
        subtitle: 10,
        body: 9
    },
    
    TEXT_SIZES: {
        title: 32,
        arrows: 28,
        projectIcon: 24,
        normalTitle: 20,
        subTitle: 16,
        medium: 14,
        small: 10,
        tiny: 8,
        extraTiny: 6
    },
    
    LETTER_SPACING: {
        title: 12,
        subTitle: 6,
        medium: 0.5,
        small: 1.5,
        tiny: 2
    },
    
    PADDING: 3,
    SPACING: 3,
    
    SHOW: {
        grain: true,
        scanlines: false,
        vignette: true,
        glow: true,
        bloom: true,
        gaussianBlur: false,
        burnBlur: false,
        flicker: false,
        crtCurvature: true,
        crtReflection: true,
        texture: true
    },
    
    ANIMATIONS: {
        SCALE: { ENABLED: false },
        COLOR: { ENABLED: false },
        GLOW: { ENABLED: false },
        ROTATE: { ENABLED: false },
        BORDER_SHIFT: { ENABLED: false },
        OPACITY_WAVE: { ENABLED: false, DURATION: 2000, MIN_INTERVAL: 100, MAX_INTERVAL: 100, MAX_SIMULTANEOUS: 8, MIN_OPACITY: 0.2, MAX_OPACITY: 0.9 }
    },
    
    OVERLAY: {
        INTERVAL: 30000,
        FADE_DURATION: 0,
        FOLDER: 'assets/overlays/',
        EXTENSION: 'jpg',
        BLEND_MODE: 'color-dodge',
        OPACITY: 0.5,
        OPACITY_FIRST: 0.5,
        RANDOM_ORDER: true,
        IMAGE_COUNT: 18
    },
    
    LETTERS_IMAGE: {
        PATH: './assets/images/lettersM.png',
        Z_INDEX: 99999,
        OPACITY: 1
    }
};