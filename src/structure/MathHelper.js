class MathHelper {
    static getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }
    static getDirection(x1, y1, x2, y2) {
        return Math.atan2(y2 - y1, x2 - x1);
    }
}

module.exports = MathHelper;