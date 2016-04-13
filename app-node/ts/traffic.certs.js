"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var TrafficOptions = require("./traffic.options");
exports.setupCertsFromOrigin = function () {
    plugins.shelljs.exec("cd /LE_CERTS "
        + "&& git init && git remote add origin"
        + "&& git pull origin master");
};
exports.pullCertsFromOrigin = function () {
};
exports.pushCertsToOrigin = function () {
};
exports.getLeCerts = function () {
};
exports.getMissingCertsFromLe = function () {
};
exports.setupCerts = function () {
    var done = plugins.q.defer();
    if (TrafficOptions.certOrigin || TrafficOptions.certLe) {
        plugins.fs.ensureDirSync("/LE_CERTS");
    }
    done.resolve();
    return done.promise;
};
//# sourceMappingURL=traffic.certs.js.map