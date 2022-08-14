class Canvas {
    constructor(width, height) {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;
    }
    getContext() {
        return this.ctx
    }
    setAspects(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
    }
    getAspects() {
        return {
            width: this.canvas.width,
            height: this.height
        }
    }
    renderGrid(camera, viewport, scale) {
        let ctx = this.ctx;
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000000';
        ctx.globalAlpha = 0.1;
        ctx.beginPath();
        for (var x = -camera.x; x < viewport.width; x += viewport.height / scale) {
            if (x > 0) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, viewport.height);
            }
        }
        for (var y = -camera.y; y < viewport.height; y += viewport.height / scale) {
            if (y > 0) {
                ctx.moveTo(0, y);
                ctx.lineTo(viewport.width, y);
            }
        }
        ctx.stroke()
    }
    renderCircle(x, y, radius, color) {
        let ctx = this.ctx;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
    }
    renderText(text, x, y, color, font) {
        let ctx = this.ctx;
        ctx.fillStyle = color;
        ctx.font = font;
        ctx.fillText(text, x, y);
    }
    renderBackground(viewport) {
        let ctx = this.ctx;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.rect(0, 0, viewport.width, viewport.height);
        ctx.fillStyle = "#b0bec2";
        ctx.fill();
    }
}

module.exports = Canvas;