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