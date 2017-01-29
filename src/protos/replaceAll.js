String.prototype.replaceAll = replaceAll;
module.exports = replaceAll;

function replaceAll (match, set) {
    return this.replace(new RegExp(match, 'g'), set)
}