/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
import plugins = require("./traffic.plugins");
import paths = require("./traffic.paths");

import TrafficCerts = require("./traffic.certs");
import TrafficDockersock = require("./traffic.dockersock");
import TrafficEnvironment = require("./traffic.environment");
import TrafficEvents = require("./traffic.events");
import TrafficGit = require("./traffic.git");
import TrafficOptions = require("./traffic.options");

import TrafficNginx = require("./traffic.nginx");
plugins.beautylog.log("Traffic container is started!");
TrafficEnvironment.checkDebug()
    .then(TrafficOptions.buildOptions)
    .then(TrafficCerts.setupCerts)
    .then(TrafficEvents.startTicker);

//prevent Ticker from executing indefinitely for tests
export let noTicker = function(){
    TrafficEvents.noTicker = true;
};