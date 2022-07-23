class Enemy {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }
    draw(ctx, camera) {
        let x = camera.getPosOnScreen(this.x, this.y).x;
        let y = camera.getPosOnScreen(this.x, this.y).y;
        ctx.globalAlpha = 1;
        ctx.beginPath();
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);

        ctx.fillStyle = "red";
        ctx.fill();
    }
}