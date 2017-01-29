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
},{"../extract/src":1,"../protos/contains":5,"../protos/extract":6,"../protos/flatMap":7,"../protos/replaceAll":9,"./html":2}],4:[function(require,module,exports){
var scrapeWorker = window.scrapeWorker || {};

scrapeWorker.images = require('./queries/images');

window.scrapeWorker = scrapeWorker;
module.exports = scrapeWorker;
},{"./queries/images":10}],5:[function(require,module,exports){
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
},{}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
Array.prototype.flatMap = flatMap;
module.exports = flatMap;

function flatMap () {
    return this.reduce(function (p, c) {
        if (!c) return p;
        return p.concat(c);
    }, []);
}
},{}],8:[function(require,module,exports){
String.prototype.isImageSrc = function (opts) {
    return new Promise((res, rej) => {
        const img = new Image();
        img.src = this;
        img.onload = () => res(img);
        img.onerror = rej;
    }).then(img => {
        if (img.width <= 10) return Promise.reject('Image too small');
        if (img.height <= 10) return Promise.reject('Image too small');
        if (!opts) return img;
        if (isNum(opts.minW) && img.width  < opts.minW) return Promise.reject('Image too small');
        if (isNum(opts.minH) && img.height < opts.minH) return Promise.reject('Image too small');
        if (isNum(opts.maxW) && img.width  < opts.maxW) return Promise.reject('Image too big');
        if (isNum(opts.maxH) && img.height < opts.maxH) return Promise.reject('Image too big');
        return img;
    })
}

Array.prototype.allImageSrcs = function (opts) {
    let valid = [];
    let _this = this;
    return new Promise((res, rej) => {
        (function check (i) {
            if (opts && valid.length === opts.max) return res(valid);
            if (!_this[i]) return res(valid);
            if (typeof _this[i] !== 'string') return check(++i);

            _this[i].isImageSrc(opts)
            .then(() => valid.push(_this[i]))
            .then(() => check(++i))
            .catch((e) => check(++i));
        })(0);
    });
}


function isNum (x) {
    return typeof x === 'number' ? true : false;
}
},{}],9:[function(require,module,exports){
String.prototype.replaceAll = replaceAll;
module.exports = replaceAll;

function replaceAll (match, set) {
    return this.replace(new RegExp(match, 'g'), set)
}
},{}],10:[function(require,module,exports){
const imageSearch = require('../loader/images');
const createWorker = require('../worker/create');
require('../protos/image');

const validateImages = opts => res => {
    return res.urls.allImageSrcs(opts)
    .then(urls => {
        res.urls = urls;
        return res;
    })
}

module.exports = {
    search: (url, opts) => (term) => {
        return imageSearch(url)(term)
    },
    worker: workerPath => {
        workerPath = workerPath || '/workers/image.js';
        const worker = createWorker(workerPath);
        return {
            terminate: () => worker.terminate(),
            search: (url, opts) => (term) =>
                new Promise((res, rej) => {
                    worker.subscribe(res);
                    worker.dispatch({ url, term });
                })
        }
    },
    validate: (url, opts) => url.isImageSrc(opts)
}
},{"../loader/images":3,"../protos/image":8,"../worker/create":11}],11:[function(require,module,exports){
const subscribe = (worker) => {
    let listeners = [];
    worker.onmessage = e => {
        listeners.map(l => l(e.data));
    };
    return (l) => {
        if (typeof l !== 'function') return;
        listeners = [...listeners, l];
    }
}

module.exports = (fileName) => {
    const worker = new Worker(fileName);
    return {
        subscribe: subscribe(worker),
        dispatch: d => worker.postMessage(d),
        terminate: () => worker.terminate()
    }
}
},{}]},{},[4]);
