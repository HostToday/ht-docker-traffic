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
            .then(TrafficNginx.getNginxConfig)
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

//# sourceMappingURL=data:application/json;base64,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LFNBQVMsRUFBQyxrQkFBa0IsQ0FBQyxPQUFPO2FBQ3ZDLENBQUM7UUFDTixDQUFDLENBQUMsQ0FBQztRQUNILEVBQUUsQ0FBQSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLDBCQUFrQixFQUFDLGdDQUF3QixDQUFDLENBQUMsQ0FBQSxDQUFDO1lBQ3BFLGdDQUF3QixHQUFHLDBCQUFrQixDQUFDO1lBQzlDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDN0IsQ0FBQztRQUFDLElBQUksQ0FBQyxDQUFDO1lBQ0osT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1lBQy9CLGFBQWEsQ0FBQyxVQUFVLEVBQUUsQ0FBQztZQUMzQiw2QkFBcUIsRUFBRTtpQkFDbEIsSUFBSSxDQUFDO2dCQUNGLGdDQUF3QixHQUFHLDBCQUFrQixDQUFDO2dCQUM5QyxhQUFhLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFWCxDQUFDO1FBQUEsQ0FBQztJQUNOLENBQUMsQ0FBQyxDQUFDO0FBQ1gsQ0FBQyxDQUFDIiwiZmlsZSI6InRyYWZmaWMuZW52aXJvbm1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBpbmdzL21haW4uZC50c1wiIC8+XG5pbXBvcnQgcGx1Z2lucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMucGx1Z2luc1wiKTtcbmltcG9ydCBUcmFmZmljRXZlbnRzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5ldmVudHNcIik7XG5pbXBvcnQgVHJhZmZpY0RvY2tlcnNvY2sgPSByZXF1aXJlKFwiLi90cmFmZmljLmRvY2tlcnNvY2tcIik7XG5pbXBvcnQgVHJhZmZpY0NlcnRzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5jZXJ0c1wiKTtcbmltcG9ydCBUcmFmZmljTmdpbnggPSByZXF1aXJlKFwiLi90cmFmZmljLm5naW54XCIpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogREFUQSBTVE9SQUdFICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IHJlbGV2YW50Q29udGFpbmVyc0JlZm9yZSA9IFtdOyAvLyBjb250YWluZXJzIGF0IHRoZSBsYXN0IGNoZWNrIGN5Y2xlXG5leHBvcnQgbGV0IHJlbGV2YW50Q29udGFpbmVycyA9IFtdOyAvLyBhbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG1pc3NpbmdcbmV4cG9ydCBsZXQgcmVjZWl2aW5nQ29udGFpbmVycyA9IFtdOyAvLyBjb250YWluZXJzIHRoYXQgcmVjZWl2ZSB0cmFmZmljXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBTRVRVUFMgLSBSVU4gT04gRklSU1QgU1RBUlQgKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgY2hlY2tEZWJ1ZyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBpZihwcm9jZXNzLmVudi5ERUJVRyA9PT0gXCJ0cnVlXCIpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJTaG93aW5nIERlYnVnIE1lc3NhZ2VzLCBiZWNhdXNlIEVOVjogREVCVUcgPT09ICd0cnVlJ1wiKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiY2hlY2tpbmcgc2hlbGwgdG9vbHM6XCIpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwicHl0aG9uIGF2YWlsYWJsZTogXCIgKyBwbHVnaW5zLnNoZWxsanMud2hpY2goXCJweXRob25cIikpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwib3BlbnNzbCBhdmFpbGFibGU6IFwiICsgcGx1Z2lucy5zaGVsbGpzLndoaWNoKFwib3BlbnNzbFwiKSk7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmluZm8oXCJnaXQgYXZhaWxhYmxlOiBcIiArIHBsdWdpbnMuc2hlbGxqcy53aGljaChcImdpdFwiKSk7XG4gICAgICAgIGRvbmUucmVzb2x2ZSh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb25lLnJlc29sdmUoZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgY2hlY2tTc2hLZXlTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBpZihwcm9jZXNzLmVudi5DRVJUX09SSUdJTl9TU0gpe1xuICAgICAgICByZXR1cm4gdHJ1ZVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydE9yaWdpblN5bmMgPSBmdW5jdGlvbigpe1xuICAgIGlmKHByb2Nlc3MuZW52LkNFUlRfT1JJR0lOKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cub2soXCJBbGxyaWdodCwgQ0VSVF9VUERBVEUgaXMgc2V0XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0VSVF9VUERBVEUgaXMgbm90IHNldCEgWW91IGFyZSBub3QgaW4gYSBDbHVzdGVyP1wiKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydExlU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0VSVF9MRSl7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENFUlRfTEUgaXMgc2V0XCIpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0VSVF9MRSBpcyBub3Qgc2V0ISBZb3UgYXJlIG5vdCBpbiBhIENsdXN0ZXI/XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn07XG5cblxuXG5leHBvcnQgbGV0IGNoZWNrQ2ZVcGRhdGVTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgY2ZTeW5jOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0ZfVVBEQVRFID09PSBcInRydWVcIil7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENGX1VQREFURSBpcyB0cnVlLiBOb3cgY2hlY2tpbmcgZm9yIGNyZWRlbnRpYWxzLlwiKTtcbiAgICAgICAgaWYocHJvY2Vzcy5lbnYuQ0ZfRU1BSUwgJiYgcHJvY2Vzcy5lbnYuQ0ZfS0VZKXtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiRm91bmQgQ2xvdWRmbGFyZSBDcmVkZW50aWFsc1wiKTtcbiAgICAgICAgICAgIGNmU3luYyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5lcnJvcihcIkJ1bW1lciEgQ2xvdWRmbGFyZSBDcmVkZW50aWFscyBhcmUgbWlzc2luZyFcIik7XG4gICAgICAgICAgICBjZlN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRl9VUERBVEUgaXMgZmFsc2UhIFlvdSBhcmUgbm90IGluIGEgQ2x1c3Rlcj9cIik7XG4gICAgICAgIGNmU3luYyA9IGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIGNmU3luYztcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBSb3V0aW5lcyAtIFJVTiBEVVJJTkcgQ09OVEFJTkVSIExJRkVUSU1FICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5sZXQgY29udGFpbmVyQ2hhbmdlTm90aWZ5O1xuXG5leHBvcnQgbGV0IGhhbmRsZUNvbnRhaW5lckNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBUcmFmZmljRG9ja2Vyc29jay5nZXRDb250YWluZXJEYXRhKFwiZGV0YWlsZWRcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZzphbnlbXSl7XG4gICAgICAgICAgICBsZXQgZGV0YWlsZWRDb250YWluZXJEYXRhID0gY29udGFpbmVyRGF0YUFyZ1xuICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24oY29udGFpbmVyT2JqZWN0KXtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiY29udGFpbmVySWRcIjpjb250YWluZXJPYmplY3QuSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBcImRvbWFpblwiOnBsdWdpbnMuc21hcnRzdHJpbmcuZG9ja2VyLm1ha2VFbnZPYmplY3QoY29udGFpbmVyT2JqZWN0LkNvbmZpZy5FbnYpLlZJUlRVQUxfSE9TVFxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBsZXQgcmVjZWl2aW5nQ29udGFpbmVyc0xvY2FsID0gZGV0YWlsZWRDb250YWluZXJEYXRhLmZpbHRlcihmdW5jdGlvbihjb250YWluZXJPYmplY3RBcmcpe1xuICAgICAgICAgICAgICAgIHJldHVybiBjb250YWluZXJPYmplY3RBcmcuZG9tYWluID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICByZWNlaXZpbmdDb250YWluZXJzID0gcmVjZWl2aW5nQ29udGFpbmVyc0xvY2FsO1xuICAgICAgICAgICAgY29uc29sZS5sb2coZGV0YWlsZWRDb250YWluZXJEYXRhKTtcbiAgICAgICAgICAgIFRyYWZmaWNDZXJ0cy5nZXRDZXJ0cyhyZWNlaXZpbmdDb250YWluZXJzTG9jYWwpXG4gICAgICAgICAgICAgICAgLnRoZW4oVHJhZmZpY05naW54LmdldE5naW54Q29uZmlnKVxuICAgICAgICAgICAgICAgIC50aGVuKGRvbmUucmVzb2x2ZSk7XG4gICAgICAgIH0pO1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5leHBvcnQgbGV0IGRldGVjdENvbnRhaW5lckNoYW5nZSA9IGZ1bmN0aW9uKCl7XG4gICAgY29uc29sZS5sb2coXCJjaGVja2luZyBmb3IgY29udGFpbmVyIGNoYW5nZVwiKTtcbiAgICBUcmFmZmljRG9ja2Vyc29jay5nZXRDb250YWluZXJEYXRhKFwib3ZlcnZpZXdcIilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZzphbnlbXSl7XG4gICAgICAgICAgICByZWxldmFudENvbnRhaW5lcnMgPSBjb250YWluZXJEYXRhQXJnLm1hcChmdW5jdGlvbihjb250YWluZXJPYmplY3RBcmcpe1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIFwiSWRcIjpjb250YWluZXJPYmplY3RBcmcuSWQsXG4gICAgICAgICAgICAgICAgICAgIFwiQ3JlYXRlZFwiOmNvbnRhaW5lck9iamVjdEFyZy5DcmVhdGVkXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYocGx1Z2lucy5sb2Rhc2guaXNFcXVhbChyZWxldmFudENvbnRhaW5lcnMscmVsZXZhbnRDb250YWluZXJzQmVmb3JlKSl7XG4gICAgICAgICAgICAgICAgcmVsZXZhbnRDb250YWluZXJzQmVmb3JlID0gcmVsZXZhbnRDb250YWluZXJzO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm8gY2hhbmdlXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhcImNoYW5nZSBkZXRlY3RlZFwiKTtcbiAgICAgICAgICAgICAgICBUcmFmZmljRXZlbnRzLnN0b3BUaWNrZXIoKTtcbiAgICAgICAgICAgICAgICBoYW5kbGVDb250YWluZXJDaGFuZ2UoKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVsZXZhbnRDb250YWluZXJzQmVmb3JlID0gcmVsZXZhbnRDb250YWluZXJzO1xuICAgICAgICAgICAgICAgICAgICAgICAgVHJhZmZpY0V2ZW50cy5zdGFydFRpY2tlcigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
