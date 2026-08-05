
export function isMobile() {

    const width = window.innerWidth;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    

    if (width <= 768) return true;
    

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