var scrapeWorker = window.scrapeWorker || {};

scrapeWorker.images = require('./queries/images');

window.scrapeWorker = scrapeWorker;
module.exports = scrapeWorker;