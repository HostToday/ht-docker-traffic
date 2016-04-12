/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
import plugins = require("./traffic.plugins");
import TrafficDockersock = require("./traffic.dockersock");
import TrafficEnvironment = require("./traffic.environment");
import TrafficSsl = require("./traffic.ssl");
plugins.beautylog.log("Traffic container is started!");
TrafficEnvironment.checkDebug()
    .then(TrafficEnvironment.checkSsl)
    .then(TrafficEnvironment.checkCloudflare)
    .then(TrafficDockersock.startTicker);

//prevent Ticker from executing indefinitely for tests
export let noTicker = function(){
    TrafficDockersock.noTicker = true;
};