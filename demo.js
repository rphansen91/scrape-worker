var heapGridSize = 250;
var heapGrid;

function run (selector) {
    var root = find(selector);
    root.innerHTML = demoTpl();
    var images = find('#images'),
        main = find('main'),
        dialog = find('dialog'),
        input = find('#input'),
        url = urlSelector(find('#url'), { main: main, dialog: dialog, input: input, submit: submit }),
        button = loader(find('#button'), 'GO'),
        listeners = {};
    
    heapGrid = new HeapGrid(images, { size: heapGridSize });
    
    button.addEventListener('click', submit);
    input.addEventListener('keyup', onEnter(submit));
    requestAnimationFrame(input.focus.bind(input));

    function submit () {
        var query = url.currentUrl() + input.value.trim();

        button.loading();
        listeners['submit'] && listeners['submit'].map(l => l(query));
    }

    return {
        on: function (e, l) {
            if (typeof l !== 'function') return this;
            if (!listeners[e]) listeners[e] = [];
            listeners[e].push(l);
            return this;
        },
        ready: function (data) {
            button.active();
            renderImages(data);
            listeners['loaded'] && listeners['loaded'].map(l => l(data));
            return this;
        },
        submit: function (text) {
            input.value = text;
            submit();
            return this;
        }
    }
}

function onEnter (cb) {
    return function (ev) {
        if (ev.which != 13) return;
        if (typeof cb === 'function') cb(ev);
    }
}

function renderItem (name) {
    return [
        '<li data-name="'+name+'">',
            '<input type="radio" id="'+name+'" name="'+name+'">',
            '<label for="'+name+'">'+name+'</label>',
            '<div class="check"></div>',
        '</li>'
    ].join('')
}

function urlSelector (instance, elements) {
    var main = elements.main, 
        dialog = elements.dialog,
        input = elements.input,
        submit  = elements.submit,
        selected = 'GOOGLE',
        custom = null,
        customInput;
    var urls = {
        BING: 'bing.com/images/search?q=',
        GOOGLE: 'google.com/search?tbm=isch&q='
    }

    function openDialog () {
        dialog.setAttribute('open', '');
	    main.classList.add('deemphasized');
    }

    function closeDialog () {
        dialog.removeAttribute('open');
	    main.classList.remove('deemphasized');
        urlEls.map(function (urlEl) {
            urlEl.checked = false;
        })
    }

    function setHTML (text) {
        instance.innerHTML = text;
    }

    instance.currentUrl = function () {
        if (custom) return custom;
        return urls[selected];
    }

    instance.addEventListener('click', openDialog);
    setHTML(selected);

    dialog.innerHTML = [
        '<h2>Scrape Images From</h2>',
        '<ul>',Object.keys(urls).map(renderItem).join(''),'</ul>',
        '<input id="custom" placeholder="custom url"/>'
    ].join('');

    var urlEls = findAll('[type="radio"]');
    urlEls.map(function (el) {
        el.addEventListener('change', setUrl)
    })

    function setUrl (ev) {
        const name = ev.target.getAttribute('name');
        if (!name) return;
        custom = null;
        selected = name;
        setHTML(selected);
        setTimeout(closeDialog, 300);
    }

    function setCustom () {
        custom = customInput.value.trim();
        if (!custom) return;
        input.value = '';
        setHTML(custom);
        closeDialog();
        submit();
    }

    customInput = find('#custom');
    customInput.addEventListener('keyup', onEnter(setCustom))

    return instance;
}

function loader (instance, text) {
    instance.innerHTML = text;
    instance.isLoading = false;
    instance.loading = function () {
        instance.isLoading = true;
        instance.setAttribute('disabled', '');
        instance.innerHTML = 'Loading...';
        render('');
    }
    instance.active  = function () {
        instance.isLoading = false;
        instance.removeAttribute('disabled');
        instance.innerHTML = text;
    }
    return instance;
}

function renderImages (r) {  
    var success = 0;
    var max = 36;
    if (r && r.urls && r.urls.length) {
        heapGrid.reset();
        (function valid (index) {
            if (!r.urls[index]) return finished();
            scrapeWorker.images.validate(r.urls[index])
            .then(appendImage)
            .then(function () {
                ++success;
                if (success >= max) return finished();
                valid(++index);
            })
            .catch(function (e) {
                console.log(e);
                valid(++index);
            })
        })(0);
        return render('');
    }
    if (r && r.source) return render('No images found at "' + r.source + '"');
    return render('No images found');
}

function finished () {
    var credit = document.createElement('p');
    credit.classList.add('credit');
    credit.innerHTML = '<a href="https://rphansen91.github.io/heap-grid/" target="_blank">Rendered By: <span class="creditU">Heap Grid</span></a>'
    images.appendChild(credit);
}

function appendImage (img) {
    var style = heapGrid.place(img);
    var result = document.createElement('div');
    var inner = document.createElement('div');
    result.classList.add('result');
    if (style.width >= heapGridSize && style.height >= heapGridSize) {
        result.classList.add('big');
    } else if (style.width >= heapGridSize) {
        result.classList.add('wide');
    } else if (style.height >= heapGridSize) {
        result.classList.add('tall');
    }
    inner.classList.add('resultImg');
    Object.keys(style).map(function (s) {
        result.style[s] = style[s] + 'px';
    })
    inner.style['background-image'] = 'url(' + img.src + ')';
    result.appendChild(inner);
    images.appendChild(result);
}

function find (id) {
    return document.querySelector(id);
}

function findAll (id) {
    return [].slice.call(document.querySelectorAll(id));
}

function render (content) {
    images.innerHTML = content;
}

function demoTpl () {
    return `
        <dialog>
        </dialog>
        <main>
            <div class="container">
                <h1>Scrape Worker</h1>
                <input id="input" type="text" placeholder="Search..." />
                <div id="url"></div>
                <button id="button">Go</button>
            </div>
            <div id="images"></div>
        </main>
    `
}