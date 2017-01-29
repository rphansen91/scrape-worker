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