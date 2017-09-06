exports.get = function (req) {
    return {
		body: '<script>window.location = "http://video.qbrick.com";</script>',
        contentType: 'text/html'
    };
};