"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.checkDebug = function () {
    var done = plugins.q.defer();
    if (process.env.DEBUG === "true") {
        plugins.beautylog.log("Showing Debug Messages, because ENV: DEBUG === 'true'");
    }
    ;
    done.resolve();
    return done.promise;
};
exports.checkSsl = function () {
    var done = plugins.q.defer();
    plugins.beautylog.log("now checking for SSLSYNC");
    if (process.env.SSLSYNC === "true") {
        plugins.beautylog.log("Allright, SSLSYNC is true");
    }
    else {
        plugins.beautylog.log("Allright, SSLSYNC is false");
    }
    ;
    done.resolve();
    return done.promise;
};
exports.checkCloudflare = function () {
    var done = plugins.q.defer();
    if (process.env.CLOUDFLARE === "true") {
        plugins.beautylog.log("Allright, CLOUDFLARE is true");
    }
    else {
        plugins.beautylog.log("Allright, CLOUDFLARE is false");
    }
    ;
    done.resolve();
    return done.promise;
};
//# sourceMappingURL=traffic.environment.js.map