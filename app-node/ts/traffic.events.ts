/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficEnvironment = require("./traffic.environment");

let tickerObs = plugins.rx.Observable
    .interval(5000).repeat();

export let tickerSub;
export let noTicker = false;
export let startTicker = function(){
    let done = plugins.q.defer();
    tickerSub = tickerObs.subscribe(
        function (x) {
            console.log('TickerCycle#: ' + x);
            TrafficEnvironment.detectContainerChange();
        },
        function (err) {
            console.log('Error: ' + err);
        },
        function () {
            console.log('Completed');
        }
    );
    console.log("subscribed ticker");
    if (noTicker) tickerSub.dispose();
    return done.promise;
};

export let stopTicker = function(){
    tickerSub.dispose();
}

export let cooldown = function(){
    let done = plugins.q.defer();
    return done.promise;
};
