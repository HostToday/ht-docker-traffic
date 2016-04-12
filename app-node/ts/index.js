"use strict";
/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
var plugins = require("./traffic.plugins");
var TrafficDockersock = require("./traffic.dockersock");
var TrafficEnvironment = require("./traffic.environment");
plugins.beautylog.log("Traffic container is started!");
TrafficEnvironment.checkDebug()
    .then(TrafficEnvironment.checkSsl)
    .then(TrafficEnvironment.checkCloudflare)
    .then(TrafficDockersock.startTicker);
//prevent Ticker from executing indefinitely for tests
exports.noTicker = function () {
    TrafficDockersock.noTicker = true;
};
//# sourceMappingURL=index.js.map