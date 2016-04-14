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
    console.log(containerDataArg);
};

//# sourceMappingURL=data:application/json;base64,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QUMsNERBQTRELENBQUMsQ0FBQztRQUNuRixFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBLENBQUM7WUFDM0MsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsOEJBQThCLENBQUMsQ0FBQztZQUNyRCxNQUFNLEdBQUcsSUFBSSxDQUFDO1FBQ2xCLENBQUM7UUFBQyxJQUFJLENBQUMsQ0FBQztZQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7WUFDdkUsTUFBTSxHQUFHLEtBQUssQ0FBQztRQUNuQixDQUFDO0lBQ0wsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsK0NBQStDLENBQUMsQ0FBQztRQUN4RSxNQUFNLEdBQUcsS0FBSyxDQUFDO0lBQ25CLENBQUM7SUFBQSxDQUFDO0lBQ0YsTUFBTSxDQUFDLE1BQU0sQ0FBQztBQUNsQixDQUFDLENBQUM7QUFFRjs7Z0VBRWdFO0FBQ2hFLElBQUkscUJBQXFCLENBQUM7QUFFZix1QkFBZSxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxVQUFTLFFBQVE7QUFFM0UsQ0FBQyxDQUFDLENBQUM7QUFFUSw2QkFBcUIsR0FBRyxVQUFTLGdCQUFnQjtJQUN4RCxPQUFPLENBQUMsR0FBRyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDN0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2xDLENBQUMsQ0FBQyIsImZpbGUiOiJ0cmFmZmljLmVudmlyb25tZW50LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdHlwaW5ncy9tYWluLmQudHNcIiAvPlxuaW1wb3J0IHBsdWdpbnMgPSByZXF1aXJlKFwiLi90cmFmZmljLnBsdWdpbnNcIik7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBEQVRBIFNUT1JBR0UgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgcmVsZXZhbnRDb250YWluZXJzQmVmb3JlID0gW107IC8vIGNvbnRhaW5lcnMgYXQgdGhlIGxhc3QgY2hlY2sgY3ljbGVcbmV4cG9ydCBsZXQgcmVsZXZhbnRDb250YWluZXJzID0gW107IC8vIGFsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgbWlzc2luZ1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogU0VUVVBTIC0gUlVOIE9OIEZJUlNUIFNUQVJUICoqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IGNoZWNrRGVidWcgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgaWYocHJvY2Vzcy5lbnYuREVCVUcgPT09IFwidHJ1ZVwiKXtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiU2hvd2luZyBEZWJ1ZyBNZXNzYWdlcywgYmVjYXVzZSBFTlY6IERFQlVHID09PSAndHJ1ZSdcIik7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcImNoZWNraW5nIHNoZWxsIHRvb2xzOlwiKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cuaW5mbyhcInB5dGhvbiBhdmFpbGFibGU6IFwiICsgcGx1Z2lucy5zaGVsbGpzLndoaWNoKFwicHl0aG9uXCIpKTtcbiAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cuaW5mbyhcIm9wZW5zc2wgYXZhaWxhYmxlOiBcIiArIHBsdWdpbnMuc2hlbGxqcy53aGljaChcIm9wZW5zc2xcIikpO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5pbmZvKFwiZ2l0IGF2YWlsYWJsZTogXCIgKyBwbHVnaW5zLnNoZWxsanMud2hpY2goXCJnaXRcIikpO1xuICAgICAgICBkb25lLnJlc29sdmUodHJ1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZS5yZXNvbHZlKGZhbHNlKTtcbiAgICB9O1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5leHBvcnQgbGV0IGNoZWNrQ2VydE9yaWdpblN5bmMgPSBmdW5jdGlvbigpe1xuICAgIGxldCBzc2xVcGRhdGU6Ym9vbGVhbjtcbiAgICBpZihwcm9jZXNzLmVudi5DRVJUX09SSUdJTil7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLm9rKFwiQWxscmlnaHQsIENFUlRfVVBEQVRFIGlzIHNldFwiKTtcbiAgICAgICAgc3NsVXBkYXRlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0VSVF9VUERBVEUgaXMgbm90IHNldCEgWW91IGFyZSBub3QgaW4gYSBDbHVzdGVyP1wiKTtcbiAgICAgICAgc3NsVXBkYXRlID0gZmFsc2U7XG4gICAgfTtcbiAgICByZXR1cm4gc3NsVXBkYXRlO1xufTtcblxuZXhwb3J0IGxldCBjaGVja0NlcnRMZVN5bmMgPSBmdW5jdGlvbigpe1xuICAgIGxldCBzc2xMZTpib29sZWFuO1xuICAgIGlmKHByb2Nlc3MuZW52LkNFUlRfTEUpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5vayhcIkFsbHJpZ2h0LCBDRVJUX0xFIGlzIHNldFwiKTtcbiAgICAgICAgc3NsTGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJDRVJUX0xFIGlzIG5vdCBzZXQhIFlvdSBhcmUgbm90IGluIGEgQ2x1c3Rlcj9cIik7XG4gICAgICAgIHNzbExlID0gZmFsc2U7XG4gICAgfTtcbiAgICByZXR1cm4gc3NsTGU7XG59O1xuXG5cblxuZXhwb3J0IGxldCBjaGVja0NmVXBkYXRlU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGNmU3luYzpib29sZWFuO1xuICAgIGlmKHByb2Nlc3MuZW52LkNGX1VQREFURSA9PT0gXCJ0cnVlXCIpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5vayhcIkFsbHJpZ2h0LCBDRl9VUERBVEUgaXMgdHJ1ZS4gTm93IGNoZWNraW5nIGZvciBjcmVkZW50aWFscy5cIik7XG4gICAgICAgIGlmKHByb2Nlc3MuZW52LkNGX0VNQUlMICYmIHByb2Nlc3MuZW52LkNGX0tFWSl7XG4gICAgICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5vayhcIkZvdW5kIENsb3VkZmxhcmUgQ3JlZGVudGlhbHNcIik7XG4gICAgICAgICAgICBjZlN5bmMgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcGx1Z2lucy5iZWF1dHlsb2cuZXJyb3IoXCJCdW1tZXIhIENsb3VkZmxhcmUgQ3JlZGVudGlhbHMgYXJlIG1pc3NpbmchXCIpO1xuICAgICAgICAgICAgY2ZTeW5jID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy53YXJuKFwiQ0ZfVVBEQVRFIGlzIGZhbHNlISBZb3UgYXJlIG5vdCBpbiBhIENsdXN0ZXI/XCIpO1xuICAgICAgICBjZlN5bmMgPSBmYWxzZTtcbiAgICB9O1xuICAgIHJldHVybiBjZlN5bmM7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogUm91dGluZXMgLSBSVU4gRFVSSU5HIENPTlRBSU5FUiBMSUZFVElNRSAqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xubGV0IGNvbnRhaW5lckNoYW5nZU5vdGlmeTtcblxuZXhwb3J0IGxldCBjb250YWluZXJDaGFuZ2UgPSBwbHVnaW5zLnJ4Lk9ic2VydmFibGUuY3JlYXRlKGZ1bmN0aW9uKG9ic2VydmVyKXtcblxufSk7XG5cbmV4cG9ydCBsZXQgZGV0ZWN0Q29udGFpbmVyQ2hhbmdlID0gZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZyl7XG4gICAgY29uc29sZS5sb2coXCJjaGVja2luZyBmb3IgY29udGFpbmVyIGNoYW5nZVwiKTtcbiAgICBjb25zb2xlLmxvZyhjb250YWluZXJEYXRhQXJnKTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
