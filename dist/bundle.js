(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports = {
    map: {
        gridSize: 23
    },
    camera: {
        smoothness: .005
    }
}
},{}],2:[function(require,module,exports){
const Canvas = require("./render/canvas");
const Player = require("./structure/player");
const Camera = require("./render/Camera");
const MathHelper = require("./lib/MathHelper");

const config = require("./config");

const camera = new Camera(0, 0);
const canvas = new Canvas(window.innerWidth, window.innerHeight);
const player = new Player(1000, 1000, 40);

const ctx = canvas.getContext();

const defaultTransform = new DOMMatrixReadOnly([1, 0, 0, 1, 0, 0])

let delta = 0;
let lastRender = Date.now();

let scale;

let currentTransform = new DOMMatrixReadOnly([1, 0, 0, 1, 0, 0])


let keyspressed = {
    w: false,
    a: false,
    s: false,
    d: false
}
document.addEventListener("keydown", function (e) {
    keyspressed[e.key] = true;
});

document.addEventListener("keyup", function (e) {
    keyspressed[e.key] = false;
})

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("game-canvas").addEventListener("mousemove", function (e) {
        player.updateMouse(e.clientX, e.clientY);
    })
})

document.addEventListener("mousedown", function (e) {
    player.shoot(ctx, camera);
})

window.addEventListener("resize", function (e) {
    camera.setViewPort(window.innerWidth, window.innerHeight);
    let viewport = camera.getViewport();
    canvas.setAspects(window.innerWidth, window.innerHeight);
    scale = Math.max(window.innerWidth / viewport.width, window.innerHeight / viewport.height);
    currentTransform = new DOMMatrixReadOnly([scale, 0, 0, scale, (window.width - viewport.width * scale) / 2, (window.height - viewport.height * scale) / 2]);
    ctx.setTransform(currentTransform);
})

let trees = [{
    x: 100,
    y: 100,
}]

function render() {
    delta = Date.now() - lastRender;
    lastRender = Date.now();
    let viewport = camera.getViewport();

    ctx.setTransform(currentTransform);

    ctx.clearRect(0, 0, viewport.width, viewport.height); 

    ctx.setTransform(defaultTransform);

    // render background
    canvas.renderBackground(viewport);

    // render grid
    canvas.renderGrid(camera, viewport, config.map.gridSize);

    // draw camera
    const distance = MathHelper.getDistance(camera.x, camera.y, player.x, player.y);
    const direction = MathHelper.getDirection(camera.x, camera.y, player.x, player.y);
    const speed = Math.min(distance * config.camera.smoothness * delta, distance);
    camera.x += speed * Math.cos(direction);
    camera.y += speed * Math.sin(direction);

    // render player
    player.draw(ctx, camera, keyspressed);

    // draw border (why idk)
    ctx.beginPath();
    ctx.rect(0, 0, viewport.width, viewport.height);
    ctx.strokeStyle = "black";
    ctx.stroke();

    // render circle at 0,0
    let [centerx, centery ] = Object.values(camera.getPosOnScreen(0, 0))
    canvas.renderCircle(centerx, centery, 10, "red");

    

    window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
},{"./config":1,"./lib/MathHelper":3,"./render/Camera":4,"./render/canvas":5,"./structure/player":7}],3:[function(require,module,exports){
class MathHelper {
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    static getDirection(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
}

module.exports = MathHelper;
},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
        this.canvasheight = height;
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
},{}],6:[function(require,module,exports){
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
        ctx.arc(x, y, this.radius + 3, 0, 2 * Math.PI);
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
},{}],7:[function(require,module,exports){
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
        let smothnes = 0.02
        let accsmothnes = .05
        if (keys.w) {
            if (this.velocity.y > -1) {
                this.velocity.y -= accsmothnes
            } else {
                this.velocity.y = -1
            }
        } else if (keys.s) {
            if(this.velocity.y < 1) {
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
            if(this.velocity.x < 1) {
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
},{"./bullet":6}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL0FwcERhdGEvUm9hbWluZy9ucG0vbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvY29uZmlnLmpzIiwic3JjL2luZGV4LmpzIiwic3JjL2xpYi9NYXRoSGVscGVyLmpzIiwic3JjL3JlbmRlci9DYW1lcmEuanMiLCJzcmMvcmVuZGVyL2NhbnZhcy5qcyIsInNyYy9zdHJ1Y3R1cmUvYnVsbGV0LmpzIiwic3JjL3N0cnVjdHVyZS9wbGF5ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsIm1vZHVsZS5leHBvcnRzID0ge1xyXG4gICAgbWFwOiB7XHJcbiAgICAgICAgZ3JpZFNpemU6IDIzXHJcbiAgICB9LFxyXG4gICAgY2FtZXJhOiB7XHJcbiAgICAgICAgc21vb3RobmVzczogLjAwNVxyXG4gICAgfVxyXG59IiwiY29uc3QgQ2FudmFzID0gcmVxdWlyZShcIi4vcmVuZGVyL2NhbnZhc1wiKTtcclxuY29uc3QgUGxheWVyID0gcmVxdWlyZShcIi4vc3RydWN0dXJlL3BsYXllclwiKTtcclxuY29uc3QgQ2FtZXJhID0gcmVxdWlyZShcIi4vcmVuZGVyL0NhbWVyYVwiKTtcclxuY29uc3QgTWF0aEhlbHBlciA9IHJlcXVpcmUoXCIuL2xpYi9NYXRoSGVscGVyXCIpO1xyXG5cclxuY29uc3QgY29uZmlnID0gcmVxdWlyZShcIi4vY29uZmlnXCIpO1xyXG5cclxuY29uc3QgY2FtZXJhID0gbmV3IENhbWVyYSgwLCAwKTtcclxuY29uc3QgY2FudmFzID0gbmV3IENhbnZhcyh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuY29uc3QgcGxheWVyID0gbmV3IFBsYXllcigxMDAwLCAxMDAwLCA0MCk7XHJcblxyXG5jb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgpO1xyXG5cclxuY29uc3QgZGVmYXVsdFRyYW5zZm9ybSA9IG5ldyBET01NYXRyaXhSZWFkT25seShbMSwgMCwgMCwgMSwgMCwgMF0pXHJcblxyXG5sZXQgZGVsdGEgPSAwO1xyXG5sZXQgbGFzdFJlbmRlciA9IERhdGUubm93KCk7XHJcblxyXG5sZXQgc2NhbGU7XHJcblxyXG5sZXQgY3VycmVudFRyYW5zZm9ybSA9IG5ldyBET01NYXRyaXhSZWFkT25seShbMSwgMCwgMCwgMSwgMCwgMF0pXHJcblxyXG5cclxubGV0IGtleXNwcmVzc2VkID0ge1xyXG4gICAgdzogZmFsc2UsXHJcbiAgICBhOiBmYWxzZSxcclxuICAgIHM6IGZhbHNlLFxyXG4gICAgZDogZmFsc2VcclxufVxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5ZG93blwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAga2V5c3ByZXNzZWRbZS5rZXldID0gdHJ1ZTtcclxufSk7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwia2V5dXBcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIGtleXNwcmVzc2VkW2Uua2V5XSA9IGZhbHNlO1xyXG59KVxyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJnYW1lLWNhbnZhc1wiKS5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vtb3ZlXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgcGxheWVyLnVwZGF0ZU1vdXNlKGUuY2xpZW50WCwgZS5jbGllbnRZKTtcclxuICAgIH0pXHJcbn0pXHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICBwbGF5ZXIuc2hvb3QoY3R4LCBjYW1lcmEpO1xyXG59KVxyXG5cclxud2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgIGNhbWVyYS5zZXRWaWV3UG9ydCh3aW5kb3cuaW5uZXJXaWR0aCwgd2luZG93LmlubmVySGVpZ2h0KTtcclxuICAgIGxldCB2aWV3cG9ydCA9IGNhbWVyYS5nZXRWaWV3cG9ydCgpO1xyXG4gICAgY2FudmFzLnNldEFzcGVjdHMod2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XHJcbiAgICBzY2FsZSA9IE1hdGgubWF4KHdpbmRvdy5pbm5lcldpZHRoIC8gdmlld3BvcnQud2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCAvIHZpZXdwb3J0LmhlaWdodCk7XHJcbiAgICBjdXJyZW50VHJhbnNmb3JtID0gbmV3IERPTU1hdHJpeFJlYWRPbmx5KFtzY2FsZSwgMCwgMCwgc2NhbGUsICh3aW5kb3cud2lkdGggLSB2aWV3cG9ydC53aWR0aCAqIHNjYWxlKSAvIDIsICh3aW5kb3cuaGVpZ2h0IC0gdmlld3BvcnQuaGVpZ2h0ICogc2NhbGUpIC8gMl0pO1xyXG4gICAgY3R4LnNldFRyYW5zZm9ybShjdXJyZW50VHJhbnNmb3JtKTtcclxufSlcclxuXHJcbmxldCB0cmVlcyA9IFt7XHJcbiAgICB4OiAxMDAsXHJcbiAgICB5OiAxMDAsXHJcbn1dXHJcblxyXG5mdW5jdGlvbiByZW5kZXIoKSB7XHJcbiAgICBkZWx0YSA9IERhdGUubm93KCkgLSBsYXN0UmVuZGVyO1xyXG4gICAgbGFzdFJlbmRlciA9IERhdGUubm93KCk7XHJcbiAgICBsZXQgdmlld3BvcnQgPSBjYW1lcmEuZ2V0Vmlld3BvcnQoKTtcclxuXHJcbiAgICBjdHguc2V0VHJhbnNmb3JtKGN1cnJlbnRUcmFuc2Zvcm0pO1xyXG5cclxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodCk7IFxyXG5cclxuICAgIGN0eC5zZXRUcmFuc2Zvcm0oZGVmYXVsdFRyYW5zZm9ybSk7XHJcblxyXG4gICAgLy8gcmVuZGVyIGJhY2tncm91bmRcclxuICAgIGNhbnZhcy5yZW5kZXJCYWNrZ3JvdW5kKHZpZXdwb3J0KTtcclxuXHJcbiAgICAvLyByZW5kZXIgZ3JpZFxyXG4gICAgY2FudmFzLnJlbmRlckdyaWQoY2FtZXJhLCB2aWV3cG9ydCwgY29uZmlnLm1hcC5ncmlkU2l6ZSk7XHJcblxyXG4gICAgLy8gZHJhdyBjYW1lcmFcclxuICAgIGNvbnN0IGRpc3RhbmNlID0gTWF0aEhlbHBlci5nZXREaXN0YW5jZShjYW1lcmEueCwgY2FtZXJhLnksIHBsYXllci54LCBwbGF5ZXIueSk7XHJcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBNYXRoSGVscGVyLmdldERpcmVjdGlvbihjYW1lcmEueCwgY2FtZXJhLnksIHBsYXllci54LCBwbGF5ZXIueSk7XHJcbiAgICBjb25zdCBzcGVlZCA9IE1hdGgubWluKGRpc3RhbmNlICogY29uZmlnLmNhbWVyYS5zbW9vdGhuZXNzICogZGVsdGEsIGRpc3RhbmNlKTtcclxuICAgIGNhbWVyYS54ICs9IHNwZWVkICogTWF0aC5jb3MoZGlyZWN0aW9uKTtcclxuICAgIGNhbWVyYS55ICs9IHNwZWVkICogTWF0aC5zaW4oZGlyZWN0aW9uKTtcclxuXHJcbiAgICAvLyByZW5kZXIgcGxheWVyXHJcbiAgICBwbGF5ZXIuZHJhdyhjdHgsIGNhbWVyYSwga2V5c3ByZXNzZWQpO1xyXG5cclxuICAgIC8vIGRyYXcgYm9yZGVyICh3aHkgaWRrKVxyXG4gICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgY3R4LnJlY3QoMCwgMCwgdmlld3BvcnQud2lkdGgsIHZpZXdwb3J0LmhlaWdodCk7XHJcbiAgICBjdHguc3Ryb2tlU3R5bGUgPSBcImJsYWNrXCI7XHJcbiAgICBjdHguc3Ryb2tlKCk7XHJcblxyXG4gICAgLy8gcmVuZGVyIGNpcmNsZSBhdCAwLDBcclxuICAgIGxldCBbY2VudGVyeCwgY2VudGVyeSBdID0gT2JqZWN0LnZhbHVlcyhjYW1lcmEuZ2V0UG9zT25TY3JlZW4oMCwgMCkpXHJcbiAgICBjYW52YXMucmVuZGVyQ2lyY2xlKGNlbnRlcngsIGNlbnRlcnksIDEwLCBcInJlZFwiKTtcclxuXHJcbiAgICBcclxuXHJcbiAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlbmRlcik7XHJcbn1cclxuXHJcbndpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUocmVuZGVyKTsiLCJjbGFzcyBNYXRoSGVscGVyIHtcclxuICAgIHN0YXRpYyBnZXREaXN0YW5jZSh4MSwgeTEsIHgyLCB5Mikge1xyXG4gICAgICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3coeDIgLSB4MSwgMikgKyBNYXRoLnBvdyh5MiAtIHkxLCAyKSk7XHJcbiAgICB9XHJcbiAgICBzdGF0aWMgZ2V0RGlyZWN0aW9uKHgxLCB5MSwgeDIsIHkyKSB7XHJcbiAgICAgICAgcmV0dXJuIE1hdGguYXRhbjIoeTIgLSB5MSwgeDIgLSB4MSk7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gTWF0aEhlbHBlcjsiLCJjbGFzcyBDYW1lcmEge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSkge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnZpZXdwb3J0ID0ge1xyXG4gICAgICAgICAgICB3aWR0aDogd2luZG93LmlubmVyV2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodDogd2luZG93LmlubmVySGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0UmVuZGVyT2Zmc2V0KCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6IHRoaXMueCAtICh0aGlzLnZpZXdwb3J0LndpZHRoIC8gMiksXHJcbiAgICAgICAgICAgIHk6IHRoaXMueSAtICh0aGlzLnZpZXdwb3J0LmhlaWdodCAvIDIpXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgZ2V0UG9zT25TY3JlZW4oeCwgeSkge1xyXG4gICAgICAgIGNvbnN0IGRlZmF1bHRPZmZzZXQgPSB0aGlzLmdldFJlbmRlck9mZnNldCgpO1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6IHggLSBkZWZhdWx0T2Zmc2V0LngsXHJcbiAgICAgICAgICAgIHk6IHkgLSBkZWZhdWx0T2Zmc2V0LnlcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICBnZXRWaWV3cG9ydCgpIHtcclxuICAgICAgICByZXR1cm4gdGhpcy52aWV3cG9ydDtcclxuICAgIH1cclxuICAgIHNldFZpZXdQb3J0KHdpZHRoLCBoZWlnaHQpIHtcclxuICAgICAgICB0aGlzLnZpZXdwb3J0LndpZHRoID0gd2lkdGg7XHJcbiAgICAgICAgdGhpcy52aWV3cG9ydC5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB9XHJcbn1cclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ2FtZXJhOyIsImNsYXNzIENhbnZhcyB7XHJcbiAgICBjb25zdHJ1Y3Rvcih3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZ2FtZS1jYW52YXMnKTtcclxuICAgICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICB9XHJcbiAgICBnZXRDb250ZXh0KCkge1xyXG4gICAgICAgIHJldHVybiB0aGlzLmN0eFxyXG4gICAgfVxyXG4gICAgc2V0QXNwZWN0cyh3aWR0aCwgaGVpZ2h0KSB7XHJcbiAgICAgICAgdGhpcy5jYW52YXMud2lkdGggPSB3aWR0aDtcclxuICAgICAgICB0aGlzLmNhbnZhc2hlaWdodCA9IGhlaWdodDtcclxuICAgIH1cclxuICAgIGdldEFzcGVjdHMoKSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgd2lkdGg6IHRoaXMuY2FudmFzLndpZHRoLFxyXG4gICAgICAgICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmVuZGVyR3JpZChjYW1lcmEsIHZpZXdwb3J0LCBzY2FsZSkge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gNDtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzAwMDAwMCc7XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMC4xO1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBmb3IgKHZhciB4ID0gLWNhbWVyYS54OyB4IDwgdmlld3BvcnQud2lkdGg7IHggKz0gdmlld3BvcnQuaGVpZ2h0IC8gc2NhbGUpIHtcclxuICAgICAgICAgICAgaWYgKHggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKHgsIDApO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh4LCB2aWV3cG9ydC5oZWlnaHQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvciAodmFyIHkgPSAtY2FtZXJhLnk7IHkgPCB2aWV3cG9ydC5oZWlnaHQ7IHkgKz0gdmlld3BvcnQuaGVpZ2h0IC8gc2NhbGUpIHtcclxuICAgICAgICAgICAgaWYgKHkgPiAwKSB7XHJcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKDAsIHkpO1xyXG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh2aWV3cG9ydC53aWR0aCwgeSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgY3R4LnN0cm9rZSgpXHJcbiAgICB9XHJcbiAgICByZW5kZXJDaXJjbGUoeCwgeSwgcmFkaXVzLCBjb2xvcikge1xyXG4gICAgICAgIGxldCBjdHggPSB0aGlzLmN0eDtcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4LmFyYyh4LCB5LCByYWRpdXMsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gY29sb3I7XHJcbiAgICAgICAgY3R4LmZpbGwoKTtcclxuICAgIH1cclxuICAgIHJlbmRlclRleHQodGV4dCwgeCwgeSwgY29sb3IsIGZvbnQpIHtcclxuICAgICAgICBsZXQgY3R4ID0gdGhpcy5jdHg7XHJcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGNvbG9yO1xyXG4gICAgICAgIGN0eC5mb250ID0gZm9udDtcclxuICAgICAgICBjdHguZmlsbFRleHQodGV4dCwgeCwgeSk7XHJcbiAgICB9XHJcbiAgICByZW5kZXJCYWNrZ3JvdW5kKHZpZXdwb3J0KSB7XHJcbiAgICAgICAgbGV0IGN0eCA9IHRoaXMuY3R4O1xyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDE7XHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5yZWN0KDAsIDAsIHZpZXdwb3J0LndpZHRoLCB2aWV3cG9ydC5oZWlnaHQpO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiNiMGJlYzJcIjtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IENhbnZhczsiLCJjbGFzcyBidWxsZXQge1xyXG4gICAgY29uc3RydWN0b3IoeCwgeSwgZGlyZWN0aW9uLCBkYW1hZ2UsIHNwZWVkLCB0eXBlKSB7XHJcbiAgICAgICAgdGhpcy54ID0geDtcclxuICAgICAgICB0aGlzLnkgPSB5O1xyXG4gICAgICAgIHRoaXMuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xyXG4gICAgICAgIHRoaXMuZGFtYWdlID0gZGFtYWdlO1xyXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGU7XHJcbiAgICAgICAgdGhpcy5yYWRpdXMgPSAxNTtcclxuICAgICAgICB0aGlzLnNwZWVkID0gc3BlZWRcclxuICAgIH1cclxuICAgIHVwZGF0ZSgpIHtcclxuICAgICAgICBsZXQgc3BlZWQgPSB0aGlzLnNwZWVkXHJcbiAgICAgICAgdGhpcy54ICs9IHNwZWVkICogTWF0aC5jb3ModGhpcy5kaXJlY3Rpb24pO1xyXG4gICAgICAgIHRoaXMueSArPSBzcGVlZCAqIE1hdGguc2luKHRoaXMuZGlyZWN0aW9uKTtcclxuICAgIH1cclxuICAgIGRyYXcoY3R4LCBjYW1lcmEpIHtcclxuICAgICAgICBsZXQgeCA9IGNhbWVyYS5nZXRQb3NPblNjcmVlbih0aGlzLngsIHRoaXMueSkueDtcclxuICAgICAgICBsZXQgeSA9IGNhbWVyYS5nZXRQb3NPblNjcmVlbih0aGlzLngsIHRoaXMueSkueTtcclxuXHJcbiAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xyXG4gICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IDFcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gMztcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gJyMwMDg1QTgnXHJcbiAgICAgICAgY3R4LmFyYyh4LCB5LCB0aGlzLnJhZGl1cyArIDMsIDAsIDIgKiBNYXRoLlBJKTtcclxuICAgICAgICBjdHguZmlsbCgpO1xyXG5cclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMVxyXG4gICAgICAgIGN0eC5saW5lV2lkdGggPSAzO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSAncmdiKDAsMTc4LDIyNSknXHJcbiAgICAgICAgY3R4LmFyYyh4LCB5LCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcbiAgICAgICAgdGhpcy51cGRhdGUoKVxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGJ1bGxldDsiLCJjb25zdCBCdWxsZXQgPSByZXF1aXJlKCcuL2J1bGxldCcpO1xyXG5cclxuY2xhc3MgUGxheWVyIHtcclxuICAgIGNvbnN0cnVjdG9yKHgsIHksIHJhZGl1cykge1xyXG4gICAgICAgIHRoaXMueCA9IHg7XHJcbiAgICAgICAgdGhpcy55ID0geTtcclxuICAgICAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcclxuICAgICAgICB0aGlzLnNwZWVkID0ge1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLnNwZWVkTXVsdGlwbGllciA9IDMuNjtcclxuICAgICAgICB0aGlzLnZlbG9jaXR5ID0ge1xyXG4gICAgICAgICAgICB4OiAwLFxyXG4gICAgICAgICAgICB5OiAwXHJcbiAgICAgICAgfTtcclxuICAgICAgICB0aGlzLmJ1bGxldHMgPSBbXTtcclxuICAgICAgICB0aGlzLnJvcmhsZW5ndGggPSA4MDtcclxuICAgICAgICB0aGlzLnJvaHJkZWNyID0gNjtcclxuICAgIH1cclxuICAgIGRyYXcoY3R4LCBjYW1lcmEsIGtleXMpIHtcclxuICAgICAgICB0aGlzLmJ1bGxldHMuZm9yRWFjaChidWxsZXQgPT4ge1xyXG4gICAgICAgICAgICBidWxsZXQuZHJhdyhjdHgsIGNhbWVyYSk7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAgICAgdGhpcy51cGRhdGUoa2V5cyk7XHJcbiAgICAgICAgdGhpcy5jb25kdWl0KGN0eCwgY2FtZXJhKVxyXG4gICAgICAgIGxldCB4ID0gY2FtZXJhLmdldFBvc09uU2NyZWVuKHRoaXMueCwgdGhpcy55KS54O1xyXG4gICAgICAgIGxldCB5ID0gY2FtZXJhLmdldFBvc09uU2NyZWVuKHRoaXMueCwgdGhpcy55KS55O1xyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxO1xyXG4gICAgICAgIGN0eC5maWxsU3R5bGUgPSBcIiMwMDg1QThcIjtcclxuICAgICAgICBjdHguYXJjKHgsIHksIHRoaXMucmFkaXVzICsgNiwgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZmlsbFN0eWxlID0gXCIjMDBiMmUxXCI7XHJcbiAgICAgICAgY3R4LmFyYyh4LCB5LCB0aGlzLnJhZGl1cywgMCwgMiAqIE1hdGguUEkpO1xyXG4gICAgICAgIGN0eC5maWxsKCk7XHJcblxyXG4gICAgfVxyXG4gICAgdXBkYXRlKGtleXMpIHtcclxuICAgICAgICBsZXQgc21vdGhuZXMgPSAwLjAyXHJcbiAgICAgICAgbGV0IGFjY3Ntb3RobmVzID0gLjA1XHJcbiAgICAgICAgaWYgKGtleXMudykge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS55ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSAtPSBhY2NzbW90aG5lc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS55ID0gLTFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5cy5zKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueSA8IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSArPSBhY2NzbW90aG5lc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS55ID0gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmVsb2NpdHkueSA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueSAtPSBzbW90aG5lcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZlbG9jaXR5LnkgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnkgKz0gc21vdGhuZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKGtleXMuYSkge1xyXG4gICAgICAgICAgICBpZiAodGhpcy52ZWxvY2l0eS54ID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueCAtPSBhY2NzbW90aG5lc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS54ID0gLTFcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoa2V5cy5kKSB7XHJcbiAgICAgICAgICAgIGlmKHRoaXMudmVsb2NpdHkueCA8IDEpIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueCArPSBhY2NzbW90aG5lc1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS54ID0gMVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKHRoaXMudmVsb2NpdHkueCA+IDApIHtcclxuICAgICAgICAgICAgICAgIHRoaXMudmVsb2NpdHkueCAtPSBzbW90aG5lcztcclxuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnZlbG9jaXR5LnggPCAwKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnggKz0gc21vdGhuZXM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKE9iamVjdC52YWx1ZXMoa2V5cykuZmlsdGVyKGtleSA9PiBrZXkpLmxlbmd0aCA+IDEpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJkaWFnb25hbFwiKVxyXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LnggKj0gMC45NjtcclxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eS55ICo9IDAuOTY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRoaXMueCArPSB0aGlzLnZlbG9jaXR5LnggKiB0aGlzLnNwZWVkTXVsdGlwbGllcjtcclxuICAgICAgICB0aGlzLnkgKz0gdGhpcy52ZWxvY2l0eS55ICogdGhpcy5zcGVlZE11bHRpcGxpZXI7XHJcbiAgICB9XHJcbiAgICB1cGRhdGVNb3VzZSh4LCB5KSB7XHJcbiAgICAgICAgdGhpcy5tb3VzZVggPSB4O1xyXG4gICAgICAgIHRoaXMubW91c2VZID0geTtcclxuICAgIH1cclxuICAgIGNvbmR1aXQoY3R4LCBjYW1lcmEpIHtcclxuICAgICAgICBsZXQgbXggPSB0aGlzLm1vdXNlWFxyXG4gICAgICAgIGxldCBteSA9IHRoaXMubW91c2VZXHJcbiAgICAgICAgXHJcbiAgICAgICAgbGV0IHggPSBjYW1lcmEuZ2V0UG9zT25TY3JlZW4odGhpcy54LCB0aGlzLnkpLnhcclxuICAgICAgICBsZXQgeSA9IGNhbWVyYS5nZXRQb3NPblNjcmVlbih0aGlzLngsIHRoaXMueSkueVxyXG4gICAgICAgIFxyXG4gICAgICAgIGxldCBkaXJlY3Rpb24gPSBNYXRoLmF0YW4yKG15IC0geSwgbXggLSB4KTtcclxuICAgICAgICBcclxuICAgICAgICBjdHguYmVnaW5QYXRoKCk7XHJcbiAgICAgICAgY3R4Lmdsb2JhbEFscGhhID0gMTtcclxuICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSAnIzZkNmQ2ZCc7XHJcbiAgICAgICAgY3R4LmxpbmVXaWR0aCA9ICc0MCc7XHJcbiAgICAgICAgY3R4Lm1vdmVUbyh4LCB5KTtcclxuICAgICAgICBjdHgubGluZVRvKHggKyB0aGlzLnJvcmhsZW5ndGggKiBNYXRoLmNvcyhkaXJlY3Rpb24pLCB5ICsgdGhpcy5yb3JobGVuZ3RoICogTWF0aC5zaW4oZGlyZWN0aW9uKSk7XHJcbiAgICAgICAgY3R4LmZpbGwoKVxyXG4gICAgICAgIGN0eC5zdHJva2UoKVxyXG4gICAgICAgIFxyXG4gICAgICAgIGN0eC5iZWdpblBhdGgoKTtcclxuICAgICAgICBjdHguZ2xvYmFsQWxwaGEgPSAxO1xyXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICcjODg4ODg4JztcclxuICAgICAgICBjdHgubGluZVdpZHRoID0gJzI5JztcclxuICAgICAgICBjdHgubW92ZVRvKHgsIHkpO1xyXG4gICAgICAgIGN0eC5saW5lVG8oeCArICh0aGlzLnJvcmhsZW5ndGggLSB0aGlzLnJvaHJkZWNyKSAqIE1hdGguY29zKGRpcmVjdGlvbiksIHkgKyAodGhpcy5yb3JobGVuZ3RoIC0gdGhpcy5yb2hyZGVjcikgKiBNYXRoLnNpbihkaXJlY3Rpb24pKTtcclxuICAgICAgICBjdHguZmlsbCgpXHJcbiAgICAgICAgY3R4LnN0cm9rZSgpXHJcbiAgICB9XHJcbiAgICBzaG9vdChjdHgsIGNhbWVyYSkge1xyXG4gICAgICAgIGxldCBteCA9IHRoaXMueDtcclxuICAgICAgICBsZXQgbXkgPSB0aGlzLnk7XHJcblxyXG4gICAgICAgIGxldCB4ID0gY2FtZXJhLmdldFBvc09uU2NyZWVuKHRoaXMueCwgdGhpcy55KS54O1xyXG4gICAgICAgIGxldCB5ID0gY2FtZXJhLmdldFBvc09uU2NyZWVuKHRoaXMueCwgdGhpcy55KS55O1xyXG5cclxuICAgICAgICBsZXQgZGlyZWN0aW9uID0gTWF0aC5hdGFuMih0aGlzLm1vdXNlWSAtIHksIHRoaXMubW91c2VYIC0geCk7XHJcblxyXG4gICAgICAgIGxldCBzdGFydHggPSB0aGlzLnggKyAodGhpcy5yb3JobGVuZ3RoIC0gdGhpcy5yb2hyZGVjcikgKiBNYXRoLmNvcyhkaXJlY3Rpb24pO1xyXG4gICAgICAgIGxldCBzdGFydHkgPSB0aGlzLnkgKyAodGhpcy5yb3JobGVuZ3RoIC0gdGhpcy5yb2hyZGVjcikgKiBNYXRoLnNpbihkaXJlY3Rpb24pO1xyXG5cclxuICAgICAgICBsZXQgYnVsbGV0ID0gbmV3IEJ1bGxldChzdGFydHgsIHN0YXJ0eSwgZGlyZWN0aW9uLCA2OSwgMTApO1xyXG4gICAgICAgIHRoaXMuYnVsbGV0cy5wdXNoKGJ1bGxldCk7XHJcblxyXG4gICAgfVxyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IFBsYXllcjsiXX0=
