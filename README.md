Proxer
======

A configurable HTTP(S) proxy middleware.

Usage
------

Create a request listener:

    listener = proxer.create();

Optionally, provide a list of request or response headers that should be proxied in `requestHeaders` or `responseHeaders`, respectively:

    listener = proxer.create({
        requestHeaders: ["accept", "accept-language", "content-language", "content-type"],
        responseHeaders: ["cache-control", "content-language", "content-type", "expires", "last-modified", "pragma"]
    });

Route `req` and `res` through the proxer listener:

    server = http.createServer(function (req, res) {
        listener(req, res);
    });
