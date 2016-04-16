"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var TrafficEvents = require("./traffic.events");
var TrafficDockersock = require("./traffic.dockersock");
var TrafficCerts = require("./traffic.certs");
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
exports.checkCertOriginSync = function () {
    var sslUpdate;
    if (process.env.CERT_ORIGIN) {
        plugins.beautylog.ok("Allright, CERT_UPDATE is set");
        sslUpdate = true;
    }
    else {
        plugins.beautylog.warn("CERT_UPDATE is not set! You are not in a Cluster?");
        sslUpdate = false;
    }
    ;
    return sslUpdate;
};
exports.checkCertLeSync = function () {
    var sslLe;
    if (process.env.CERT_LE) {
        plugins.beautylog.ok("Allright, CERT_LE is set");
        sslLe = true;
    }
    else {
        plugins.beautylog.warn("CERT_LE is not set! You are not in a Cluster?");
        sslLe = false;
    }
    ;
    return sslLe;
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
                "containerId": containerObject.Id,
                "domain": plugins.smartstring.docker.makeEnvObject(containerObject.Config.Env).VIRTUAL_HOST
            };
        });
        var receivingContainersLocal = detailedContainerData.filter(function (containerObjectArg) {
            return containerObjectArg.domain ? true : false;
        });
        exports.receivingContainers = receivingContainersLocal;
        console.log(detailedContainerData);
        TrafficCerts.getCerts(receivingContainersLocal)
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

//# sourceMappingURL=data:application/json;base64,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QUcsMEJBQWtCLENBQUM7WUFDOUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQztRQUM3QixDQUFDO1FBQUMsSUFBSSxDQUFDLENBQUM7WUFDSixPQUFPLENBQUMsR0FBRyxDQUFDLGlCQUFpQixDQUFDLENBQUM7WUFDL0IsYUFBYSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQzNCLDZCQUFxQixFQUFFO2lCQUNsQixJQUFJLENBQUM7Z0JBQ0YsZ0NBQXdCLEdBQUcsMEJBQWtCLENBQUM7Z0JBQzlDLGFBQWEsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNoQyxDQUFDLENBQUMsQ0FBQztRQUVYLENBQUM7UUFBQSxDQUFDO0lBQ04sQ0FBQyxDQUFDLENBQUM7QUFDWCxDQUFDLENBQUMiLCJmaWxlIjoidHJhZmZpYy5lbnZpcm9ubWVudC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IFRyYWZmaWNFdmVudHMgPSByZXF1aXJlKFwiLi90cmFmZmljLmV2ZW50c1wiKTtcbmltcG9ydCBUcmFmZmljRG9ja2Vyc29jayA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuZG9ja2Vyc29ja1wiKTtcbmltcG9ydCBUcmFmZmljQ2VydHMgPSByZXF1aXJlKFwiLi90cmFmZmljLmNlcnRzXCIpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogREFUQSBTVE9SQUdFICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IHJlbGV2YW50Q29udGFpbmVyc0JlZm9yZSA9IFtdOyAvLyBjb250YWluZXJzIGF0IHRoZSBsYXN0IGNoZWNrIGN5Y2xlXG5leHBvcnQgbGV0IHJlbGV2YW50Q29udGFpbmVycyA9IFtdOyAvLyBhbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG1pc3NpbmdcbmV4cG9ydCBsZXQgcmVjZWl2aW5nQ29udGFpbmVycyA9IFtdOyAvLyBjb250YWluZXJzIHRoYXQgcmVjZWl2ZSB0cmFmZmljXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBTRVRVUFMgLSBSVU4gT04gRklSU1QgU1RBUlQgKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgY2hlY2tEZWJ1ZyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBpZihwcm9jZXNzLmVudi5ERUJVRyA9PT0gXCJ0cnVlXCIpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJTaG93aW5nIERlYnVnIE1lc3NhZ2VzLCBiZWNhdXNlIEVOVjogREVCVUcgPT09ICd0cnVlJ1wiKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiY2hlY2tpbmcgc2hlbGwgdG9vbHM6XCIpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwicHl0aG9uIGF2YWlsYWJsZTogXCIgKyBwbHVnaW5zLnNoZWxsanMud2hpY2goXCJweXRob25cIikpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwib3BlbnNzbCBhdmFpbGFibGU6IFwiICsgcGx1Z2lucy5zaGVsbGpzLndoaWNoKFwib3BlbnNzbFwiKSk7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmluZm8oXCJnaXQgYXZhaWxhYmxlOiBcIiArIHBsdWdpbnMuc2hlbGxqcy53aGljaChcImdpdFwiKSk7XG4gICAgICAgIGRvbmUucmVzb2x2ZSh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb25lLnJlc29sdmUoZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgY2hlY2tDZXJ0T3JpZ2luU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IHNzbFVwZGF0ZTpib29sZWFuO1xuICAgIGlmKHByb2Nlc3MuZW52LkNFUlRfT1JJR0lOKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cub2soXCJBbGxyaWdodCwgQ0VSVF9VUERBVEUgaXMgc2V0XCIpO1xuICAgICAgICBzc2xVcGRhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRVJUX1VQREFURSBpcyBub3Qgc2V0ISBZb3UgYXJlIG5vdCBpbiBhIENsdXN0ZXI/XCIpO1xuICAgICAgICBzc2xVcGRhdGUgPSBmYWxzZTtcbiAgICB9O1xuICAgIHJldHVybiBzc2xVcGRhdGU7XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydExlU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IHNzbExlOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0VSVF9MRSl7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENFUlRfTEUgaXMgc2V0XCIpO1xuICAgICAgICBzc2xMZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cud2FybihcIkNFUlRfTEUgaXMgbm90IHNldCEgWW91IGFyZSBub3QgaW4gYSBDbHVzdGVyP1wiKTtcbiAgICAgICAgc3NsTGUgPSBmYWxzZTtcbiAgICB9O1xuICAgIHJldHVybiBzc2xMZTtcbn07XG5cblxuXG5leHBvcnQgbGV0IGNoZWNrQ2ZVcGRhdGVTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgY2ZTeW5jOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0ZfVVBEQVRFID09PSBcInRydWVcIil7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENGX1VQREFURSBpcyB0cnVlLiBOb3cgY2hlY2tpbmcgZm9yIGNyZWRlbnRpYWxzLlwiKTtcbiAgICAgICAgaWYocHJvY2Vzcy5lbnYuQ0ZfRU1BSUwgJiYgcHJvY2Vzcy5lbnYuQ0ZfS0VZKXtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiRm91bmQgQ2xvdWRmbGFyZSBDcmVkZW50aWFsc1wiKTtcbiAgICAgICAgICAgIGNmU3luYyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5lcnJvcihcIkJ1bW1lciEgQ2xvdWRmbGFyZSBDcmVkZW50aWFscyBhcmUgbWlzc2luZyFcIik7XG4gICAgICAgICAgICBjZlN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRl9VUERBVEUgaXMgZmFsc2UhIFlvdSBhcmUgbm90IGluIGEgQ2x1c3Rlcj9cIik7XG4gICAgICAgIGNmU3luYyA9IGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIGNmU3luYztcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBSb3V0aW5lcyAtIFJVTiBEVVJJTkcgQ09OVEFJTkVSIExJRkVUSU1FICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5sZXQgY29udGFpbmVyQ2hhbmdlTm90aWZ5O1xuXG5leHBvcnQgbGV0IGhhbmRsZUNvbnRhaW5lckNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBUcmFmZmljRG9ja2Vyc29jay5nZXRDb250YWluZXJEYXRhKFwiZGV0YWlsZWRcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZzphbnlbXSl7XG4gICAgICAgICAgICBsZXQgZGV0YWlsZWRDb250YWluZXJEYXRhID0gY29udGFpbmVyRGF0YUFyZ1xuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY29udGFpbmVyT2JqZWN0KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbmVySWRcIjpjb250YWluZXJPYmplY3QuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRvbWFpblwiOnBsdWdpbnMuc21hcnRzdHJpbmcuZG9ja2VyLm1ha2VFbnZPYmplY3QoY29udGFpbmVyT2JqZWN0LkNvbmZpZy5FbnYpLlZJUlRVQUxfSE9TVFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgcmVjZWl2aW5nQ29udGFpbmVyc0xvY2FsID0gZGV0YWlsZWRDb250YWluZXJEYXRhLmZpbHRlcihmdW5jdGlvbihjb250YWluZXJPYmplY3RBcmcpe1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZXJPYmplY3RBcmcuZG9tYWluID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZWNlaXZpbmdDb250YWluZXJzID0gcmVjZWl2aW5nQ29udGFpbmVyc0xvY2FsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGV0YWlsZWRDb250YWluZXJEYXRhKTtcbiAgICAgICAgICAgIFRyYWZmaWNDZXJ0cy5nZXRDZXJ0cyhyZWNlaXZpbmdDb250YWluZXJzTG9jYWwpXG4gICAgICAgICAgICAgICAgLnRoZW4oZG9uZS5yZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgZGV0ZWN0Q29udGFpbmVyQ2hhbmdlID0gZnVuY3Rpb24oKXtcbiAgICBjb25zb2xlLmxvZyhcImNoZWNraW5nIGZvciBjb250YWluZXIgY2hhbmdlXCIpO1xuICAgIFRyYWZmaWNEb2NrZXJzb2NrLmdldENvbnRhaW5lckRhdGEoXCJvdmVydmlld1wiKVxuICAgICAgICAudGhlbihmdW5jdGlvbihjb250YWluZXJEYXRhQXJnOmFueVtdKXtcbiAgICAgICAgICAgIHJlbGV2YW50Q29udGFpbmVycyA9IGNvbnRhaW5lckRhdGFBcmcubWFwKGZ1bmN0aW9uKGNvbnRhaW5lck9iamVjdEFyZyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgXCJJZFwiOmNvbnRhaW5lck9iamVjdEFyZy5JZCxcbiAgICAgICAgICAgICAgICAgICAgXCJDcmVhdGVkXCI6Y29udGFpbmVyT2JqZWN0QXJnLkNyZWF0ZWRcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZihwbHVnaW5zLmxvZGFzaC5pc0VxdWFsKHJlbGV2YW50Q29udGFpbmVycyxyZWxldmFudENvbnRhaW5lcnNCZWZvcmUpKXtcbiAgICAgICAgICAgICAgICByZWxldmFudENvbnRhaW5lcnNCZWZvcmUgPSByZWxldmFudENvbnRhaW5lcnM7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJubyBjaGFuZ2VcIik7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiY2hhbmdlIGRldGVjdGVkXCIpO1xuICAgICAgICAgICAgICAgIFRyYWZmaWNFdmVudHMuc3RvcFRpY2tlcigpO1xuICAgICAgICAgICAgICAgIGhhbmRsZUNvbnRhaW5lckNoYW5nZSgpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWxldmFudENvbnRhaW5lcnNCZWZvcmUgPSByZWxldmFudENvbnRhaW5lcnM7XG4gICAgICAgICAgICAgICAgICAgICAgICBUcmFmZmljRXZlbnRzLnN0YXJ0VGlja2VyKCk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICB9O1xuICAgICAgICB9KTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
