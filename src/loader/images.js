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