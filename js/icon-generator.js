/**
 * Icon Generator for Shafiya PWA
 * Creates all required icon sizes programmatically
 */

class IconGenerator {
    constructor() {
        this.iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
        this.primaryColor = '#ff6b6b';
        this.backgroundColor = '#121212';
        this.textColor = '#ffffff';
    }

    /**
     * Generate all required icons
     */
    async generateAllIcons() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        for (const size of this.iconSizes) {
            await this.generateIcon(ctx, size);
        }
    }

    /**
     * Generate a single icon
     */
    async generateIcon(ctx, size) {
        // Set canvas size
        ctx.canvas.width = size;
        ctx.canvas.height = size;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);
        
        // Draw background circle
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(size/2, size/2, size/2 - 2, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add border
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = Math.max(2, size * 0.02);
        ctx.stroke();
        
        // Draw text (S for Shafiya)
        ctx.fillStyle = this.textColor;
        ctx.font = `bold ${size * 0.4}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', size/2, size/2);
        
        // Convert to blob and create download
        const blob = await new Promise(resolve => ctx.canvas.toBlob(resolve, 'image/png'));
        const url = URL.createObjectURL(blob);
        
        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = `icon-${size}x${size}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // Clean up
        URL.revokeObjectURL(url);
    }

    /**
     * Generate favicon
     */
    generateFavicon() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Set small size for favicon
        canvas.width = 32;
        canvas.height = 32;
        
        // Draw background
        ctx.fillStyle = this.primaryColor;
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, 2 * Math.PI);
        ctx.fill();
        
        // Draw text
        ctx.fillStyle = this.textColor;
        ctx.font = 'bold 18px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('S', 16, 16);
        
        return canvas.toDataURL('image/png');
    }
}

// Auto-generate icons when script loads (for development)
if (typeof window !== 'undefined') {
    const iconGenerator = new IconGenerator();
    
    // Only run in development, not in production
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
        console.log('Run iconGenerator.generateAllIcons() in console to generate icons');
        window.iconGenerator = iconGenerator;
    }
}