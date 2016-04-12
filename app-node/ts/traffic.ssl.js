"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.setupSSL = function () {
    var done = plugins.q.defer();
    plugins.fs.ensureDirSync("/LE_CERTS");
    done.resolve();
    return done.promise;
};
//# sourceMappingURL=traffic.ssl.js.map