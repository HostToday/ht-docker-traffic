"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var TrafficEvents = require("./traffic.events");
var TrafficDockersock = require("./traffic.dockersock");
var TrafficCerts = require("./traffic.certs");
var TrafficNginx = require("./traffic.nginx");
/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/
exports.relevantContainersBefore = []; // containers at the last check cycle
exports.relevantContainers = []; // all certs that are currently missing
exports.receivingContainers = []; // containers that receive traffic
/**************************************************************
 ************ SETUPS - RUN ON FIRST START *********************
 **************************************************************/
exports.checkDebug = function () {
    var done = plugins.q.defer();
    if (process.env.DEBUG === "true") {
        plugins.beautylog.log("Showing Debug Messages, because ENV: DEBUG === 'true'");
        plugins.beautylog.log("checking shell tools:");
        plugins.beautylog.info("python available: " + plugins.shelljs.which("python"));
        plugins.beautylog.info("openssl available: " + plugins.shelljs.which("openssl"));
        plugins.beautylog.info("git available: " + plugins.shelljs.which("git"));
        done.resolve(true);
    }
    else {
        done.resolve(false);
    }
    ;
    return done.promise;
};
exports.checkDockersock = function () {
    try {
        plugins.smartfile.checks.fileExistsSync("/var/run/docker.sock");
        plugins.beautylog.log("great, docker.sock is available!");
        return true;
    }
    catch (err) {
        plugins.beautylog.warn("docker.sock is unavailable.");
        return false;
    }
};
exports.checkSshKeySync = function () {
    if (process.env.CERT_ORIGIN_SSH) {
        return true;
    }
    else {
        return false;
    }
};
exports.checkCertOriginSync = function () {
    if (process.env.CERT_ORIGIN) {
        plugins.beautylog.ok("Allright, CERT_UPDATE is set");
        return true;
    }
    else {
        plugins.beautylog.warn("CERT_UPDATE is not set! You are not in a Cluster?");
        return false;
    }
    ;
};
exports.checkCertLeSync = function () {
    if (process.env.CERT_LE) {
        plugins.beautylog.ok("Allright, CERT_LE is set");
        return true;
    }
    else {
        plugins.beautylog.warn("CERT_LE is not set! You are not in a Cluster?");
        return false;
    }
    ;
};
exports.checkCfUpdateSync = function () {
    var cfSync;
    if (process.env.CF_UPDATE === "true") {
        plugins.beautylog.ok("Allright, CF_UPDATE is true. Now checking for credentials.");
        if (process.env.CF_EMAIL && process.env.CF_KEY) {
            plugins.beautylog.ok("Found Cloudflare Credentials");
            cfSync = true;
        }
        else {
            plugins.beautylog.error("Bummer! Cloudflare Credentials are missing!");
            cfSync = false;
        }
    }
    else {
        plugins.beautylog.warn("CF_UPDATE is false! You are not in a Cluster?");
        cfSync = false;
    }
    ;
    return cfSync;
};
/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
var containerChangeNotify;
exports.handleContainerChange = function () {
    var done = plugins.q.defer();
    TrafficDockersock.getContainerData("detailed")
        .then(function (containerDataArg) {
        var detailedContainerData = containerDataArg
            .map(function (containerObject) {
            return {
                "id": containerObject.Id,
                "domain": plugins.smartstring.docker.makeEnvObject(containerObject.Config.Env).VIRTUAL_HOST,
                "ip": containerObject.NetworkSettings.Networks.bridge.IPAddress
            };
        });
        var receivingContainersLocal = detailedContainerData.filter(function (containerObjectArg) {
            return containerObjectArg.domain ? true : false;
        });
        exports.receivingContainers = receivingContainersLocal;
        console.log(detailedContainerData);
        TrafficCerts.getCerts(receivingContainersLocal)
            .then(function () { TrafficNginx.getNginxConfig(receivingContainersLocal); })
            .then(done.resolve);
    });
    return done.promise;
};
exports.detectContainerChange = function () {
    console.log("checking for container change");
    TrafficDockersock.getContainerData("overview")
        .then(function (containerDataArg) {
        exports.relevantContainers = containerDataArg.map(function (containerObjectArg) {
            return {
                "Id": containerObjectArg.Id,
                "Created": containerObjectArg.Created
            };
        });
        if (plugins.lodash.isEqual(exports.relevantContainers, exports.relevantContainersBefore)) {
            exports.relevantContainersBefore = exports.relevantContainers;
            console.log("no change");
        }
        else {
            console.log("change detected");
            TrafficEvents.stopTicker();
            exports.handleContainerChange()
                .then(function () {
                exports.relevantContainersBefore = exports.relevantContainers;
                TrafficEvents.startTicker();
            });
        }
        ;
    });
};

//# sourceMappingURL=data:application/json;base64,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QUMsQ0FBQztBQUNYLENBQUMsQ0FBQyIsImZpbGUiOiJ0cmFmZmljLmVudmlyb25tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdHlwaW5ncy9tYWluLmQudHNcIiAvPlxuaW1wb3J0IHBsdWdpbnMgPSByZXF1aXJlKFwiLi90cmFmZmljLnBsdWdpbnNcIik7XG5pbXBvcnQgVHJhZmZpY0V2ZW50cyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuZXZlbnRzXCIpO1xuaW1wb3J0IFRyYWZmaWNEb2NrZXJzb2NrID0gcmVxdWlyZShcIi4vdHJhZmZpYy5kb2NrZXJzb2NrXCIpO1xuaW1wb3J0IFRyYWZmaWNDZXJ0cyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuY2VydHNcIik7XG5pbXBvcnQgVHJhZmZpY05naW54ID0gcmVxdWlyZShcIi4vdHJhZmZpYy5uZ2lueFwiKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIERBVEEgU1RPUkFHRSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGxldCByZWxldmFudENvbnRhaW5lcnNCZWZvcmUgPSBbXTsgLy8gY29udGFpbmVycyBhdCB0aGUgbGFzdCBjaGVjayBjeWNsZVxuZXhwb3J0IGxldCByZWxldmFudENvbnRhaW5lcnMgPSBbXTsgLy8gYWxsIGNlcnRzIHRoYXQgYXJlIGN1cnJlbnRseSBtaXNzaW5nXG5leHBvcnQgbGV0IHJlY2VpdmluZ0NvbnRhaW5lcnMgPSBbXTsgLy8gY29udGFpbmVycyB0aGF0IHJlY2VpdmUgdHJhZmZpY1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogU0VUVVBTIC0gUlVOIE9OIEZJUlNUIFNUQVJUICoqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IGNoZWNrRGVidWcgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgaWYocHJvY2Vzcy5lbnYuREVCVUcgPT09IFwidHJ1ZVwiKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiU2hvd2luZyBEZWJ1ZyBNZXNzYWdlcywgYmVjYXVzZSBFTlY6IERFQlVHID09PSAndHJ1ZSdcIik7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcImNoZWNraW5nIHNoZWxsIHRvb2xzOlwiKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cuaW5mbyhcInB5dGhvbiBhdmFpbGFibGU6IFwiICsgcGx1Z2lucy5zaGVsbGpzLndoaWNoKFwicHl0aG9uXCIpKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cuaW5mbyhcIm9wZW5zc2wgYXZhaWxhYmxlOiBcIiArIHBsdWdpbnMuc2hlbGxqcy53aGljaChcIm9wZW5zc2xcIikpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwiZ2l0IGF2YWlsYWJsZTogXCIgKyBwbHVnaW5zLnNoZWxsanMud2hpY2goXCJnaXRcIikpO1xuICAgICAgICBkb25lLnJlc29sdmUodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrRG9ja2Vyc29jayA9IGZ1bmN0aW9uKCl7XG4gICAgdHJ5IHtcbiAgICAgICAgcGx1Z2lucy5zbWFydGZpbGUuY2hlY2tzLmZpbGVFeGlzdHNTeW5jKFwiL3Zhci9ydW4vZG9ja2VyLnNvY2tcIik7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcImdyZWF0LCBkb2NrZXIuc29jayBpcyBhdmFpbGFibGUhXCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgY2F0Y2goZXJyKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cud2FybihcImRvY2tlci5zb2NrIGlzIHVuYXZhaWxhYmxlLlwiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn07XG5cbmV4cG9ydCBsZXQgY2hlY2tTc2hLZXlTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBpZihwcm9jZXNzLmVudi5DRVJUX09SSUdJTl9TU0gpe1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydE9yaWdpblN5bmMgPSBmdW5jdGlvbigpe1xuICAgIGlmKHByb2Nlc3MuZW52LkNFUlRfT1JJR0lOKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cub2soXCJBbGxyaWdodCwgQ0VSVF9VUERBVEUgaXMgc2V0XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0VSVF9VUERBVEUgaXMgbm90IHNldCEgWW91IGFyZSBub3QgaW4gYSBDbHVzdGVyP1wiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydExlU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0VSVF9MRSl7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENFUlRfTEUgaXMgc2V0XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0VSVF9MRSBpcyBub3Qgc2V0ISBZb3UgYXJlIG5vdCBpbiBhIENsdXN0ZXI/XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn07XG5cblxuXG5leHBvcnQgbGV0IGNoZWNrQ2ZVcGRhdGVTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgY2ZTeW5jOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0ZfVVBEQVRFID09PSBcInRydWVcIil7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENGX1VQREFURSBpcyB0cnVlLiBOb3cgY2hlY2tpbmcgZm9yIGNyZWRlbnRpYWxzLlwiKTtcbiAgICAgICAgaWYocHJvY2Vzcy5lbnYuQ0ZfRU1BSUwgJiYgcHJvY2Vzcy5lbnYuQ0ZfS0VZKXtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiRm91bmQgQ2xvdWRmbGFyZSBDcmVkZW50aWFsc1wiKTtcbiAgICAgICAgICAgIGNmU3luYyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5lcnJvcihcIkJ1bW1lciEgQ2xvdWRmbGFyZSBDcmVkZW50aWFscyBhcmUgbWlzc2luZyFcIik7XG4gICAgICAgICAgICBjZlN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRl9VUERBVEUgaXMgZmFsc2UhIFlvdSBhcmUgbm90IGluIGEgQ2x1c3Rlcj9cIik7XG4gICAgICAgIGNmU3luYyA9IGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIGNmU3luYztcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBSb3V0aW5lcyAtIFJVTiBEVVJJTkcgQ09OVEFJTkVSIExJRkVUSU1FICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5sZXQgY29udGFpbmVyQ2hhbmdlTm90aWZ5O1xuXG5leHBvcnQgbGV0IGhhbmRsZUNvbnRhaW5lckNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBUcmFmZmljRG9ja2Vyc29jay5nZXRDb250YWluZXJEYXRhKFwiZGV0YWlsZWRcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZzphbnlbXSl7XG4gICAgICAgICAgICBsZXQgZGV0YWlsZWRDb250YWluZXJEYXRhID0gY29udGFpbmVyRGF0YUFyZ1xuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY29udGFpbmVyT2JqZWN0KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaWRcIjpjb250YWluZXJPYmplY3QuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRvbWFpblwiOnBsdWdpbnMuc21hcnRzdHJpbmcuZG9ja2VyLm1ha2VFbnZPYmplY3QoY29udGFpbmVyT2JqZWN0LkNvbmZpZy5FbnYpLlZJUlRVQUxfSE9TVCxcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiaXBcIjpjb250YWluZXJPYmplY3QuTmV0d29ya1NldHRpbmdzLk5ldHdvcmtzLmJyaWRnZS5JUEFkZHJlc3NcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgbGV0IHJlY2VpdmluZ0NvbnRhaW5lcnNMb2NhbCA9IGRldGFpbGVkQ29udGFpbmVyRGF0YS5maWx0ZXIoZnVuY3Rpb24oY29udGFpbmVyT2JqZWN0QXJnKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGFpbmVyT2JqZWN0QXJnLmRvbWFpbiA/IHRydWUgOiBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmVjZWl2aW5nQ29udGFpbmVycyA9IHJlY2VpdmluZ0NvbnRhaW5lcnNMb2NhbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRldGFpbGVkQ29udGFpbmVyRGF0YSk7XG4gICAgICAgICAgICBUcmFmZmljQ2VydHMuZ2V0Q2VydHMocmVjZWl2aW5nQ29udGFpbmVyc0xvY2FsKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7VHJhZmZpY05naW54LmdldE5naW54Q29uZmlnKHJlY2VpdmluZ0NvbnRhaW5lcnNMb2NhbCl9KVxuICAgICAgICAgICAgICAgIC50aGVuKGRvbmUucmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5leHBvcnQgbGV0IGRldGVjdENvbnRhaW5lckNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJjaGVja2luZyBmb3IgY29udGFpbmVyIGNoYW5nZVwiKTtcbiAgICBUcmFmZmljRG9ja2Vyc29jay5nZXRDb250YWluZXJEYXRhKFwib3ZlcnZpZXdcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZzphbnlbXSl7XG4gICAgICAgICAgICByZWxldmFudENvbnRhaW5lcnMgPSBjb250YWluZXJEYXRhQXJnLm1hcChmdW5jdGlvbihjb250YWluZXJPYmplY3RBcmcpe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiSWRcIjpjb250YWluZXJPYmplY3RBcmcuSWQsXG4gICAgICAgICAgICAgICAgICAgIFwiQ3JlYXRlZFwiOmNvbnRhaW5lck9iamVjdEFyZy5DcmVhdGVkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYocGx1Z2lucy5sb2Rhc2guaXNFcXVhbChyZWxldmFudENvbnRhaW5lcnMscmVsZXZhbnRDb250YWluZXJzQmVmb3JlKSl7XG4gICAgICAgICAgICAgICAgcmVsZXZhbnRDb250YWluZXJzQmVmb3JlID0gcmVsZXZhbnRDb250YWluZXJzO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gY2hhbmdlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZSBkZXRlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICBUcmFmZmljRXZlbnRzLnN0b3BUaWNrZXIoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVDb250YWluZXJDaGFuZ2UoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsZXZhbnRDb250YWluZXJzQmVmb3JlID0gcmVsZXZhbnRDb250YWluZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgVHJhZmZpY0V2ZW50cy5zdGFydFRpY2tlcigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
