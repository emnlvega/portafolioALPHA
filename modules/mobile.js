// modules/mobile.js - Nuevo archivo
export function isMobile() {
    // Detectar por ancho de pantalla O user agent
    const width = window.innerWidth;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    
    // Detectar por ancho (más confiable)
    if (width <= 768) return true;
    
    // Detectar por user agent (fallback)
    if (/android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
        return true;
    }
    
    return false;
}

export function getDeviceType() {
    const width = window.innerWidth;
    if (width <= 480) return 'phone';
    if (width <= 768) return 'tablet';
    return 'desktop';
}