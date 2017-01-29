Heap Grid
=========

[![Demo](https://rphansen91.github.io/scrape-worker/demo.jpg)](https://rphansen91.github.io/scrape-worker/)

[Github](https://github.com/rphansen91/scrape-worker)
[Demo](https://rphansen91.github.io/scrape-worker/)

Description
------------

Parse any url for content directly from a web worker

Installation
------------

```
npm install scrape-worker
```

Usage
-----

```js
import ScrapeWorker from 'scrape-worker';

var imageSearch = ScrapeWorker.images.search();
var imageWorkerSearch = ScrapeWorker.images.worker().search();

imageWorkerSearch(ANY_URL)
.then(function (res) {
    // res.urls
})
```