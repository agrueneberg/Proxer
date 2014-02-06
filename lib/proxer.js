var http, https, url;

http = require("http");
https = require("https");
url = require("url");

exports.create = function (options) {
    options = options || {};
    // TODO: Check if types match.
    options.requestHeaders = options.requestHeaders || [];
    options.responseHeaders = options.responseHeaders || [];
    return function (req, res) {
        var parsedUrl, proxyUrl, proxyReq, proxyResHandler;
        parsedUrl = url.parse(req.url, true);
        if (parsedUrl.query.hasOwnProperty("url")) {
            proxyUrl = url.parse(parsedUrl.query.url);
            var proxyOptions = {
                "host": proxyUrl.hostname,
                "path": proxyUrl.path,
                "method": req.method,
                "headers": {}
            };
            // Copy HTTP request headers.
            options.requestHeaders.forEach(function (requestHeader) {
                var lowerCaseRequestHeader;
                lowerCaseRequestHeader = requestHeader.toLowerCase();
                if (req.headers.hasOwnProperty(lowerCaseRequestHeader)) {
                    proxyOptions.headers[lowerCaseRequestHeader] = req.headers[lowerCaseRequestHeader];
                }
            });
            // Different protocol, different module, but same response handler.
            proxyResHandler = function (proxyRes) {
                var resHeaders;
                // Copy HTTP response headers.
                resHeaders = {};
                options.responseHeaders.forEach(function (responseHeader) {
                    var lowerCaseResponseHeader;
                    lowerCaseResponseHeader = responseHeader.toLowerCase();
                    if (proxyRes.headers.hasOwnProperty(lowerCaseResponseHeader)) {
                        resHeaders[lowerCaseResponseHeader] = proxyRes.headers[lowerCaseResponseHeader];
                    }
                });
                // Respect status code.
                res.writeHead(proxyRes.statusCode, resHeaders);
                proxyRes.pipe(res);
            };
            if (proxyUrl.protocol === "https:") {
                proxyOptions.port = proxyUrl.port || 443;
                proxyReq = https.request(proxyOptions, proxyResHandler);
            } else {
                proxyOptions.port = proxyUrl.port || 80;
                proxyReq = http.request(proxyOptions, proxyResHandler);
            }
            proxyReq.on("error", function (e) {
                res.writeHead(500);
                res.end("Captain, we crashed: " + e.code + "\n");
            });
            req.pipe(proxyReq);
        } else {
            res.writeHead(400);
            res.end("\"url\", did you pass it?\n");
        }
    };
};
