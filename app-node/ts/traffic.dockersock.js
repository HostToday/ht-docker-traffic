"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.get = function () {
    var done = plugins.q.defer();
    plugins.request.get('http://unix:/var/run/docker.sock:/containers/json')
        .on("data", function (data) {
        var dataString = data.toString("utf8");
        var dataObject = JSON.parse(dataString);
        done.resolve(dataObject);
    });
    return done.promise;
};
var tickerObs = plugins.rx.Observable
    .interval(5000).repeat();
exports.noTicker = false;
exports.startTicker = function () {
    var done = plugins.q.defer();
    exports.tickerSub = tickerObs.subscribe(function (x) {
        console.log('Next: ' + x);
    }, function (err) {
        console.log('Error: ' + err);
    }, function () {
        console.log('Completed');
    });
    console.log("subscribed ticker");
    if (exports.noTicker)
        exports.tickerSub.dispose();
    return done.promise;
};
exports.getChange = function () {
};
exports.containerChange = plugins.rx.Observable.create(function (observer) {
});
//# sourceMappingURL=traffic.dockersock.js.map