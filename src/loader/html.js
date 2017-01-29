const CORS = url => "https://cors-anywhere.herokuapp.com/" + url;

module.exports = url =>
    fetch(CORS(url))
    .then(res => res.text())