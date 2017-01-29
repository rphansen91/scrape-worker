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