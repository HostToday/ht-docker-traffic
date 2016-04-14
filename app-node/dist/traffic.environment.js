"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/
exports.relevantContainersBefore = []; // containers at the last check cycle
exports.relevantContainers = []; // all certs that are currently missing
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
exports.containerChange = plugins.rx.Observable.create(function (observer) {
});
exports.detectContainerChange = function (containerDataArg) {
    console.log("checking for container change");
    var filteredData = containerDataArg.map(function (containerObjectArg) {
        return {
            "Id": containerObjectArg.Id,
            "Created": containerObjectArg.Created
        };
    });
    console.log(filteredData);
};

//# sourceMappingURL=data:application/json;base64,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ZmlsZSI6InRyYWZmaWMuZW52aXJvbm1lbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBpbmdzL21haW4uZC50c1wiIC8+XG5pbXBvcnQgcGx1Z2lucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMucGx1Z2luc1wiKTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIERBVEEgU1RPUkFHRSAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGxldCByZWxldmFudENvbnRhaW5lcnNCZWZvcmUgPSBbXTsgLy8gY29udGFpbmVycyBhdCB0aGUgbGFzdCBjaGVjayBjeWNsZVxuZXhwb3J0IGxldCByZWxldmFudENvbnRhaW5lcnMgPSBbXTsgLy8gYWxsIGNlcnRzIHRoYXQgYXJlIGN1cnJlbnRseSBtaXNzaW5nXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBTRVRVUFMgLSBSVU4gT04gRklSU1QgU1RBUlQgKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgY2hlY2tEZWJ1ZyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBpZihwcm9jZXNzLmVudi5ERUJVRyA9PT0gXCJ0cnVlXCIpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJTaG93aW5nIERlYnVnIE1lc3NhZ2VzLCBiZWNhdXNlIEVOVjogREVCVUcgPT09ICd0cnVlJ1wiKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiY2hlY2tpbmcgc2hlbGwgdG9vbHM6XCIpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwicHl0aG9uIGF2YWlsYWJsZTogXCIgKyBwbHVnaW5zLnNoZWxsanMud2hpY2goXCJweXRob25cIikpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwib3BlbnNzbCBhdmFpbGFibGU6IFwiICsgcGx1Z2lucy5zaGVsbGpzLndoaWNoKFwib3BlbnNzbFwiKSk7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmluZm8oXCJnaXQgYXZhaWxhYmxlOiBcIiArIHBsdWdpbnMuc2hlbGxqcy53aGljaChcImdpdFwiKSk7XG4gICAgICAgIGRvbmUucmVzb2x2ZSh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb25lLnJlc29sdmUoZmFsc2UpO1xuICAgIH07XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgY2hlY2tDZXJ0T3JpZ2luU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IHNzbFVwZGF0ZTpib29sZWFuO1xuICAgIGlmKHByb2Nlc3MuZW52LkNFUlRfT1JJR0lOKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cub2soXCJBbGxyaWdodCwgQ0VSVF9VUERBVEUgaXMgc2V0XCIpO1xuICAgICAgICBzc2xVcGRhdGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRVJUX1VQREFURSBpcyBub3Qgc2V0ISBZb3UgYXJlIG5vdCBpbiBhIENsdXN0ZXI/XCIpO1xuICAgICAgICBzc2xVcGRhdGUgPSBmYWxzZTtcbiAgICB9O1xuICAgIHJldHVybiBzc2xVcGRhdGU7XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydExlU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IHNzbExlOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0VSVF9MRSl7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENFUlRfTEUgaXMgc2V0XCIpO1xuICAgICAgICBzc2xMZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cud2FybihcIkNFUlRfTEUgaXMgbm90IHNldCEgWW91IGFyZSBub3QgaW4gYSBDbHVzdGVyP1wiKTtcbiAgICAgICAgc3NsTGUgPSBmYWxzZTtcbiAgICB9O1xuICAgIHJldHVybiBzc2xMZTtcbn07XG5cblxuXG5leHBvcnQgbGV0IGNoZWNrQ2ZVcGRhdGVTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgY2ZTeW5jOmJvb2xlYW47XG4gICAgaWYocHJvY2Vzcy5lbnYuQ0ZfVVBEQVRFID09PSBcInRydWVcIil7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENGX1VQREFURSBpcyB0cnVlLiBOb3cgY2hlY2tpbmcgZm9yIGNyZWRlbnRpYWxzLlwiKTtcbiAgICAgICAgaWYocHJvY2Vzcy5lbnYuQ0ZfRU1BSUwgJiYgcHJvY2Vzcy5lbnYuQ0ZfS0VZKXtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiRm91bmQgQ2xvdWRmbGFyZSBDcmVkZW50aWFsc1wiKTtcbiAgICAgICAgICAgIGNmU3luYyA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5lcnJvcihcIkJ1bW1lciEgQ2xvdWRmbGFyZSBDcmVkZW50aWFscyBhcmUgbWlzc2luZyFcIik7XG4gICAgICAgICAgICBjZlN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRl9VUERBVEUgaXMgZmFsc2UhIFlvdSBhcmUgbm90IGluIGEgQ2x1c3Rlcj9cIik7XG4gICAgICAgIGNmU3luYyA9IGZhbHNlO1xuICAgIH07XG4gICAgcmV0dXJuIGNmU3luYztcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBSb3V0aW5lcyAtIFJVTiBEVVJJTkcgQ09OVEFJTkVSIExJRkVUSU1FICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5sZXQgY29udGFpbmVyQ2hhbmdlTm90aWZ5O1xuXG5leHBvcnQgbGV0IGNvbnRhaW5lckNoYW5nZSA9IHBsdWdpbnMucnguT2JzZXJ2YWJsZS5jcmVhdGUoZnVuY3Rpb24ob2JzZXJ2ZXIpe1xuXG59KTtcblxuZXhwb3J0IGxldCBkZXRlY3RDb250YWluZXJDaGFuZ2UgPSBmdW5jdGlvbihjb250YWluZXJEYXRhQXJnOmFueVtdKXtcbiAgICBjb25zb2xlLmxvZyhcImNoZWNraW5nIGZvciBjb250YWluZXIgY2hhbmdlXCIpO1xuICAgIGxldCBmaWx0ZXJlZERhdGEgPSBjb250YWluZXJEYXRhQXJnLm1hcChmdW5jdGlvbihjb250YWluZXJPYmplY3RBcmcpe1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgXCJJZFwiOmNvbnRhaW5lck9iamVjdEFyZy5JZCxcbiAgICAgICAgICAgIFwiQ3JlYXRlZFwiOmNvbnRhaW5lck9iamVjdEFyZy5DcmVhdGVkXG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgY29uc29sZS5sb2coZmlsdGVyZWREYXRhKTtcbiAgICBcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
