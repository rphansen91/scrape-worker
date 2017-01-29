Array.prototype.flatMap = flatMap;
module.exports = flatMap;

function flatMap () {
    return this.reduce(function (p, c) {
        if (!c) return p;
        return p.concat(c);
    }, []);
}