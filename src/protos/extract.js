String.prototype.matchAll = matchAll;
String.prototype.within = within;
module.exports = {
    matchAll,
    within
};

function buildRegExp (begin, end) {
    return new RegExp(`(${begin})(.*?)(${end})`, 'gi');
}

function matchAll (begin, end) {
    return this.match(buildRegExp(begin, end));
}

function within (begin, end, group) {
    group = group || 2;
    const parts = buildRegExp(begin, end).exec(this);
    if (parts && parts[group]) return parts[group];
    return '';
}