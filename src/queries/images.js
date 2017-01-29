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