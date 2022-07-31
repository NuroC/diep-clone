const Bullet = require('./bullet');

class Player {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = {
            x: 0,
            y: 0
        };
        this.speedMultiplier = 3.6;
        this.velocity = {
            x: 0,
            y: 0
        };
        this.bullets = [];
        this.rorhlength = 80;
        this.rohrdecr = 6;
        this.shootCooldown = 0;
        this.shootCooldownMax = 0.5;
        this.canShoot = true;
    }
    draw(ctx, camera, keys) {
        this.bullets.forEach(bullet => {
            bullet.draw(ctx, camera);
        })

        this.update(keys);
        this.conduit(ctx, camera)
        let x = camera.getPosOnScreen(this.x, this.y).x;
        let y = camera.getPosOnScreen(this.x, this.y).y;
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#0085A8";
        ctx.arc(x, y, this.radius + 6, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.fillStyle = "#00b2e1";
        ctx.arc(x, y, this.radius, 0, 2 * Math.PI);
        ctx.fill();

    }
    update(keys) {
        if(this.shootCooldown > 0) {
            this.shootCooldown -= this.shootCooldownMax / 60;
        } else {
            this.canShoot = true;
        }
        let smothnes = 0.02
        let accsmothnes = .05
        if (keys.w) {
            if (this.velocity.y > -1) {
                this.velocity.y -= accsmothnes
            } else {
                this.velocity.y = -1
            }
        } else if (keys.s) {
            if (this.velocity.y < 1) {
                this.velocity.y += accsmothnes
            } else {
                this.velocity.y = 1
            }
        } else {
            if (this.velocity.y > 0) {
                this.velocity.y -= smothnes;
            } else if (this.velocity.y < 0) {
                this.velocity.y += smothnes;
            }
        }
        if (keys.a) {
            if (this.velocity.x > -1) {
                this.velocity.x -= accsmothnes
            } else {
                this.velocity.x = -1
            }
        } else if (keys.d) {
            if (this.velocity.x < 1) {
                this.velocity.x += accsmothnes
            } else {
                this.velocity.x = 1
            }
        } else {
            if (this.velocity.x > 0) {
                this.velocity.x -= smothnes;
            } else if (this.velocity.x < 0) {
                this.velocity.x += smothnes;
            }
        }
        if (Object.values(keys).filter(key => key).length > 1) {
            console.log("diagonal")
            this.velocity.x *= 0.96;
            this.velocity.y *= 0.96;
        }
        this.x += this.velocity.x * this.speedMultiplier;
        this.y += this.velocity.y * this.speedMultiplier;
    }
    updateMouse(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
    conduit(ctx, camera) {
        let mx = this.mouseX
        let my = this.mouseY

        let x = camera.getPosOnScreen(this.x, this.y).x
        let y = camera.getPosOnScreen(this.x, this.y).y

        let direction = Math.atan2(my - y, mx - x);

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#6d6d6d';
        ctx.lineWidth = '40';
        ctx.moveTo(x, y);
        ctx.lineTo(x + this.rorhlength * Math.cos(direction), y + this.rorhlength * Math.sin(direction));
        ctx.fill()
        ctx.stroke()

        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = '29';
        ctx.moveTo(x, y);
        ctx.lineTo(x + (this.rorhlength - this.rohrdecr) * Math.cos(direction), y + (this.rorhlength - this.rohrdecr) * Math.sin(direction));
        ctx.fill()
        ctx.stroke()
    }
    shoot(ctx, camera) {
        if (!this.canShoot) return;
        let mx = this.x;
        let my = this.y;

        let x = camera.getPosOnScreen(this.x, this.y).x;
        let y = camera.getPosOnScreen(this.x, this.y).y;

        let direction = Math.atan2(this.mouseY - y, this.mouseX - x);

        let startx = this.x + (this.rorhlength - this.rohrdecr) * Math.cos(direction);
        let starty = this.y + (this.rorhlength - this.rohrdecr) * Math.sin(direction);

        let bullet = new Bullet(startx, starty, direction, 69, 10);
        this.bullets.push(bullet);
        
    }
}

module.exports = Player;