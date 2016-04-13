"use strict";
/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
var plugins = require("./traffic.plugins");
var TrafficEnvironment = require("./traffic.environment");
var TrafficOptions = require("./traffic.options");
var TrafficDockersock = require("./traffic.dockersock");
var TrafficCerts = require("./traffic.certs");
plugins.beautylog.log("Traffic container is started!");
TrafficEnvironment.checkDebug()
    .then(TrafficOptions.buildOptions)
    .then(TrafficCerts.setupCerts)
    .then(TrafficDockersock.startTicker);
//prevent Ticker from executing indefinitely for tests
exports.noTicker = function () {
    TrafficDockersock.noTicker = true;
};
//# sourceMappingURL=index.js.map