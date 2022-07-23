class Player {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.speed = {
            x: 0,
            y: 0
        };
        this.speedMultiplier = 1.2;

        this.velocity = {
            x: 0,
            y: 0
        };
    }
    draw(ctx, camera, keys) {
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
        let smothnes = 0.02
        let accsmothnes = .05
        if (keys.w) {
            if (this.velocity.y > -1) {
                this.velocity.y -= accsmothnes
            } else {
                this.velocity.y = -1
            }
        } else if (keys.s) {
            this.velocity.y = 1;
        } else {
            if (this.velocity.y > 0) {
                this.velocity.y -= smothnes;
            } else if (this.velocity.y < 0) {
                this.velocity.y += smothnes;
            }
        }
        if (keys.a) {
            if (this.velocity.x > -1) {
                this.velocity.x = -1;
            }
        } else if (keys.d) {
            this.velocity.x = 1;
        } else {
            if (this.velocity.x > 0) {
                this.velocity.x -= smothnes;
            } else if (this.velocity.x < 0) {
                this.velocity.x += smothnes;
            }
        }
        this.x += this.velocity.x * this.speedMultiplier;
        this.y += this.velocity.y * this.speedMultiplier;
    }
    updateMouse(x, y) {
        this.mouseX = x;
        this.mouseY = y;
    }
    conduit(ctx, camera) {
        let rorhlength = 80
        let rohrdecr = 6
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
        ctx.lineTo(x + rorhlength * Math.cos(direction), y + rorhlength * Math.sin(direction));
        ctx.fill()
        ctx.stroke()
        
        ctx.beginPath();
        ctx.globalAlpha = 1;
        ctx.strokeStyle = '#888888';
        ctx.lineWidth = '29';
        ctx.moveTo(x, y);
        ctx.lineTo(x + (rorhlength - rohrdecr) * Math.cos(direction), y + (rorhlength - rohrdecr) * Math.sin(direction));
        ctx.fill()
        ctx.stroke()

        // let xx = camera.getPosOnScreen(this.x, this.y).x;
        // let yx = camera.getPosOnScreen(this.x, this.y).y;
        // ctx.beginPath();
        // ctx.globalAlpha = 1;
        // ctx.fillStyle = "rgb(52,52,52)";
        // ctx.arc(xx, yx, this.radius + 16, 0, 2 * Math.PI);
        // ctx.fill();
    }
}

module.exports = Player;