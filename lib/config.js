"use strict"

// directory default file
var default_file = ["index.htm", "index.html", "default.htm", "home.htm"]

// http 404 error response string
var _404 = "<html><body><h1>404 - Not Found</h1></body></html>"

// http 403 error response string
var _403 = "<html><body><h1>403 - Forbidden</h1></body></html>"

// http 500 error response string
var _500 = "<html><body><h1>500 -  Internal Server Error</h1></body></html>"

module.exports = {
    "default": default_file,
    "http_404": _404,
    "http_403": _403,
    "http_500": _500
}