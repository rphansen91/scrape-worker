(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
function extractAllImages (html) {
    // Find all images in document
    return (html || '').matchAll('<img', '>');
}

function extractAllSrc (imgs) {
    return (imgs || []).map(img => 
        // Extract src value from each image
        img.within('src="|\'', '"|\''));
}

module.exports = html => extractAllSrc(extractAllImages(html));
},{}],2:[function(require,module,exports){
const CORS = url => "https://cors-anywhere.herokuapp.com/" + url;

module.exports = url =>
    fetch(CORS(url))
    .then(res => res.text())
},{}],3:[function(require,module,exports){
const loadHTML = require('./html');
const extractSrcs = require('../extract/src');
require('../protos/replaceAll');
require('../protos/contains');
require('../protos/flatMap');
require('../protos/extract');

const str = s => s || '';
const add = (...args) => args.map(str).reduce((p,c) => p + c, '');

module.exports = url => name =>
    loadHTML(add(url, name))
    .then((data) => extractSrcs(data))
    .then((imgs) => imgs.flatMap())
    .then((imgs) => ({
        source: add(url, name),
        urls: imgs
    }));
},{"../extract/src":1,"../protos/contains":4,"../protos/extract":5,"../protos/flatMap":6,"../protos/replaceAll":7,"./html":2}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
Array.prototype.flatMap = flatMap;
module.exports = flatMap;

function flatMap () {
    return this.reduce(function (p, c) {
        if (!c) return p;
        return p.concat(c);
    }, []);
}
},{}],7:[function(require,module,exports){
String.prototype.replaceAll = replaceAll;
module.exports = replaceAll;

function replaceAll (match, set) {
    return this.replace(new RegExp(match, 'g'), set)
}
},{}],8:[function(require,module,exports){
const imageSearch = require('../loader/images');

onmessage = function (e) {
    const url = e.data.url;
    const term = e.data.term;
    
    imageSearch(url)(term)
    .then(postMessage)
    .catch(e => {
        postMessage({ type: 'ERROR', payload: 'WORKER SCRIPT ERROR: ' + JSON.stringify(e) })
    })
}
},{"../loader/images":3}]},{},[8]);
