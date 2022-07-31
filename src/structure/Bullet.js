class bullet {
    constructor(x, y, direction, damage, speed, type) {
        this.x = x;
        this.y = y;
        this.direction = direction;
        this.damage = damage;
        this.type = type;
        this.radius = 15;
        this.speed = speed
    }
    update() {
        let speed = this.speed
        this.x += speed * Math.cos(this.direction);
        this.y += speed * Math.sin(this.direction);
    }
    draw(ctx, camera) {
        let x = camera.getPosOnScreen(this.x, this.y).x;
        let y = camera.getPosOnScreen(this.x, this.y).y;

        ctx.beginPath();
        ctx.globalAlpha = 1
        ctx.lineWidth = 3;
        ctx.fillStyle = '#0085A8'
        ctx.arc(x, y, this.radius + 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.globalAlpha = 1
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgb(0,178,225)'
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
        this.update()
    }
}

module.exports = bullet;