"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.checkDebug = function () {
    var done = plugins.q.defer();
    if (process.env.DEBUG === "true") {
        plugins.beautylog.log("Showing Debug Messages, because ENV: DEBUG === 'true'");
        done.resolve(true);
    }
    else {
        done.resolve(false);
    }
    ;
    return done.promise;
};
exports.checkCertOriginSync = function () {
    var sslUpdate;
    if (process.env.CERT_ORIGIN) {
        plugins.beautylog.log("Allright, CERT_UPDATE is set");
        sslUpdate = true;
    }
    else {
        plugins.beautylog.warn("CERT_UPDATE is not set! You are not in a Cluster?");
        sslUpdate = false;
    }
    ;
    return sslUpdate;
};
exports.checkCertLeSync = function () {
    var sslLe;
    if (process.env.CERT_LE) {
        plugins.beautylog.log("Allright, CERT_LE is set");
        sslLe = true;
    }
    else {
        plugins.beautylog.warn("CERT_LE is not set! You are not in a Cluster?");
        sslLe = false;
    }
    ;
    return sslLe;
};
exports.checkCfUpdateSync = function () {
    var cfSync;
    if (process.env.CF_UPDATE === "true") {
        plugins.beautylog.log("Allright, CF_UPDATE is true. Now checking for credentials.");
        if (process.env.CF_EMAIL && process.env.CF_KEY) {
            plugins.beautylog.log("Found Cloudflare Credentials");
            cfSync = true;
        }
        else {
            plugins.beautylog.error("Bummer! Cloudflare Credentials are missing!");
            cfSync = false;
        }
    }
    else {
        plugins.beautylog.warn("CF_UPDATE is false! You are not in a Cluster?");
        cfSync = false;
    }
    ;
    return cfSync;
};
//# sourceMappingURL=traffic.environment.js.map