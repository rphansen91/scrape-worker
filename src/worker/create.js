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