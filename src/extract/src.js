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