String.prototype.contains = contains;
String.prototype.containsAll = containsAll; 
String.prototype.containsAny = containsAny; 
module.exports = { contains, containsAll, containsAny };

function contains (part, opts) {
    opts = opts || 'gi';
    return this.match(new RegExp(part, opts));
}

function containsAll (parts, opts) {
    return parts.every((part) => this.contains(part, opts));
}

function containsAny (parts, opts) {
    return parts.some((part) => this.contains(part, opts));
}