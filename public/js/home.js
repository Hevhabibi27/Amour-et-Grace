// public/js/home.js
document.addEventListener('DOMContentLoaded', () => {
    console.log('Amour et GRÂCE Home page loaded.');
    
    // Check if images are loaded properly, if not, apply a fallback gradient
    const imagesToFallback = [
        { id: 'filipino-img', gradient: 'radial-gradient(circle, #f5f5f5 0%, #dcdcdc 100%)' },
        { id: 'japanese-img', gradient: 'radial-gradient(circle, #ff4b4b 0%, #b30000 100%)' }
    ];
    
    imagesToFallback.forEach(item => {
        const img = document.getElementById(item.id);
        if (img) {
            img.onerror = function() {
                this.style.display = 'none';
                this.parentElement.style.background = item.gradient;
            }
        }
    });
});
