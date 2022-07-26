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
const Canvas = require("./structure/canvas");
const Player = require("./structure/player");
const Camera = require("./structure/Camera");
const MathHelper = require("./structure/MathHelper");

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
    let centerx = camera.getPosOnScreen(0, 0).x;
    let centery = camera.getPosOnScreen(0, 0).y;
    canvas.renderCircle(centerx, centery, 10, "red");

    

    window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
},{"./config":1,"./structure/Camera":3,"./structure/MathHelper":4,"./structure/canvas":5,"./structure/player":6}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
class MathHelper {
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    static getDirection(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
}

module.exports = MathHelper;
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
},{}]},{},[2]);
