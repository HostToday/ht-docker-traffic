"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var TrafficEnvironment = require("./traffic.environment");
exports.certOrigin = false; // when true, certificates are synced using git
exports.certLe = false; // when true, new certificates are obtained from Lets Encrypt
exports.cfUpdate = false; // when true, cloudflare is updated for containers on the same node
exports.buildOptions = function () {
    var done = plugins.q.defer();
    plugins.beautylog.log("now building options...");
    exports.certOrigin = TrafficEnvironment.checkCertOriginSync();
    exports.certLe = TrafficEnvironment.checkCertLeSync();
    exports.cfUpdate = TrafficEnvironment.checkCfUpdateSync();
    done.resolve();
    return done.promise;
};
//# sourceMappingURL=traffic.options.js.map