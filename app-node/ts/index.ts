/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
import plugins = require("./traffic.plugins");
import paths = require("./traffic.paths");
import TrafficEnvironment = require("./traffic.environment");
import TrafficOptions = require("./traffic.options");
import TrafficDockersock = require("./traffic.dockersock");
import TrafficNginx = require("./traffic.nginx");
import TrafficCerts = require("./traffic.certs");
plugins.beautylog.log("Traffic container is started!");
TrafficEnvironment.checkDebug()
    .then(TrafficOptions.buildOptions)
    .then(TrafficCerts.setupCerts)
    .then(TrafficDockersock.startTicker);

//prevent Ticker from executing indefinitely for tests
export let noTicker = function(){
    TrafficDockersock.noTicker = true;
};