class Camera {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.viewport = {
            width: window.innerWidth,
            height: window.innerHeight
        }
    }
    getRenderOffset() {
        return {
            x: this.x - (this.viewport.width / 2),
            y: this.y - (this.viewport.height / 2)
        }
    }
    getPosOnScreen(x, y) {
        const defaultOffset = this.getRenderOffset();
        return {
            x: x - defaultOffset.x,
            y: y - defaultOffset.y
        }
    }
    getViewport() {
        return this.viewport;
    }
    setViewPort(width, height) {
        this.viewport.width = width;
        this.viewport.height = height;
    }
}

module.exports = Camera;