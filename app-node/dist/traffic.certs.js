"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var paths = require("./traffic.paths");
var TrafficOptions = require("./traffic.options");
var TrafficSsh = require("./traffic.ssh");
/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/
exports.neededCerts = []; //all certs that are currently needed
exports.availableCerts = []; //all certs that are currently available
exports.missingCerts = []; //all certs that are currently missing 
/**************************************************************
 ************ SETUPS - RUN ON FIRST START *********************
 **************************************************************/
exports.setupCertsFromOriginSync = function () {
    TrafficSsh.setupSshFromEnvSync(); //setting up SSH in case SSH is specified;
    plugins.beautylog.log("now getting certificates from certificate origin");
    plugins.shelljs.exec("cd " + paths.certDir + " && git init && git remote add origin " + process.env.CERT_ORIGIN);
    exports.pullCertsFromOriginSync();
};
exports.setupCertsFromLe = function () {
    var done = plugins.q.defer();
    exports.getNeededCerts()
        .then(exports.getAvailableCerts)
        .then(exports.getMissingCerts)
        .then(done.resolve);
    return done.promise;
};
exports.setupCerts = function () {
    var done = plugins.q.defer();
    if (TrafficOptions.certOrigin || TrafficOptions.certLe) {
        plugins.fs.ensureDirSync(paths.certDir);
        if (TrafficOptions.certOrigin)
            exports.setupCertsFromOriginSync();
        if (TrafficOptions.certLe) {
            exports.setupCertsFromLe()
                .then(function () {
                if (TrafficOptions.certOrigin)
                    exports.pushCertsToOriginSync();
                done.resolve();
            });
        }
        else {
            done.resolve();
        }
        ;
    }
    else {
        done.resolve();
    }
    return done.promise;
};
/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
exports.pullCertsFromOriginSync = function () {
    plugins.shelljs.exec("cd " + paths.certDir + " && git pull origin master");
};
exports.pushCertsToOriginSync = function () {
    plugins.beautylog.log("now syncing certs back to source ");
    plugins.shelljs.exec("cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS' && git push origin master");
};
exports.getLeCertSync = function (domainArg) {
    plugins.beautylog.log("now getting certs from Lets Encrypt");
    plugins.shelljs.exec("cd /app-ssl/ && ./letsencrypt.sh -c -d " + domainArg + " -t dns-01 -k './hooks/cloudflare/hook.py'");
};
exports.checkCertificate = function () {
};
exports.getNeededCerts = function () {
    var done = plugins.q.defer();
    done.resolve();
    return done.promise;
};
exports.getAvailableCerts = function () {
    var done = plugins.q.defer();
    plugins.smartfile.get.folders(paths.certDir)
        .then(function (foldersArrayArg) {
        exports.neededCerts = foldersArrayArg;
        done.resolve(exports.neededCerts);
    });
    return done.promise;
};
exports.getMissingCerts = function () {
    var done = plugins.q.defer();
    done.resolve();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,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b3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBpbmdzL21haW4uZC50c1wiIC8+XG5pbXBvcnQgcGx1Z2lucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMucGx1Z2luc1wiKTtcbmltcG9ydCBwYXRocyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMucGF0aHNcIik7XG5pbXBvcnQgVHJhZmZpY09wdGlvbnMgPSByZXF1aXJlKFwiLi90cmFmZmljLm9wdGlvbnNcIik7XG5pbXBvcnQgVHJhZmZpY1NzaCA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuc3NoXCIpO1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogREFUQSBTVE9SQUdFICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IG5lZWRlZENlcnRzID0gW107IC8vYWxsIGNlcnRzIHRoYXQgYXJlIGN1cnJlbnRseSBuZWVkZWRcbmV4cG9ydCBsZXQgYXZhaWxhYmxlQ2VydHMgPSBbXTsgLy9hbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IGF2YWlsYWJsZVxuZXhwb3J0IGxldCBtaXNzaW5nQ2VydHMgPSBbXTsgLy9hbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG1pc3NpbmcgXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBTRVRVUFMgLSBSVU4gT04gRklSU1QgU1RBUlQgKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgc2V0dXBDZXJ0c0Zyb21PcmlnaW5TeW5jID0gZnVuY3Rpb24oKXtcbiAgICBUcmFmZmljU3NoLnNldHVwU3NoRnJvbUVudlN5bmMoKTsgLy9zZXR0aW5nIHVwIFNTSCBpbiBjYXNlIFNTSCBpcyBzcGVjaWZpZWQ7XG4gICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwibm93IGdldHRpbmcgY2VydGlmaWNhdGVzIGZyb20gY2VydGlmaWNhdGUgb3JpZ2luXCIpO1xuICAgIHBsdWdpbnMuc2hlbGxqcy5leGVjKFxuICAgICAgICBcImNkIFwiICsgcGF0aHMuY2VydERpciArIFwiICYmIGdpdCBpbml0ICYmIGdpdCByZW1vdGUgYWRkIG9yaWdpbiBcIiArIHByb2Nlc3MuZW52LkNFUlRfT1JJR0lOXG4gICAgKTtcbiAgICBwdWxsQ2VydHNGcm9tT3JpZ2luU3luYygpO1xufTtcblxuZXhwb3J0IGxldCBzZXR1cENlcnRzRnJvbUxlID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGdldE5lZWRlZENlcnRzKClcbiAgICAgICAgLnRoZW4oZ2V0QXZhaWxhYmxlQ2VydHMpXG4gICAgICAgIC50aGVuKGdldE1pc3NpbmdDZXJ0cylcbiAgICAgICAgLnRoZW4oZG9uZS5yZXNvbHZlKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuZXhwb3J0IGxldCBzZXR1cENlcnRzID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGlmKFRyYWZmaWNPcHRpb25zLmNlcnRPcmlnaW4gfHwgVHJhZmZpY09wdGlvbnMuY2VydExlKXtcbiAgICAgICAgcGx1Z2lucy5mcy5lbnN1cmVEaXJTeW5jKHBhdGhzLmNlcnREaXIpO1xuICAgICAgICBpZihUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luKSBzZXR1cENlcnRzRnJvbU9yaWdpblN5bmMoKTtcbiAgICAgICAgaWYoVHJhZmZpY09wdGlvbnMuY2VydExlKSB7XG4gICAgICAgICAgICBzZXR1cENlcnRzRnJvbUxlKClcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgICAgICBpZihUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luKSBwdXNoQ2VydHNUb09yaWdpblN5bmMoKTtcbiAgICAgICAgICAgICAgICAgICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkb25lLnJlc29sdmUoKTtcbiAgICAgICAgfTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb25lLnJlc29sdmUoKTtcbiAgICB9XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBSb3V0aW5lcyAtIFJVTiBEVVJJTkcgQ09OVEFJTkVSIExJRkVUSU1FICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5leHBvcnQgbGV0IHB1bGxDZXJ0c0Zyb21PcmlnaW5TeW5jID0gZnVuY3Rpb24oKXtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcImNkIFwiICsgcGF0aHMuY2VydERpciArIFwiICYmIGdpdCBwdWxsIG9yaWdpbiBtYXN0ZXJcIik7XG59O1xuXG5leHBvcnQgbGV0IHB1c2hDZXJ0c1RvT3JpZ2luU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwibm93IHN5bmNpbmcgY2VydHMgYmFjayB0byBzb3VyY2UgXCIpO1xuICAgIHBsdWdpbnMuc2hlbGxqcy5leGVjKFxuICAgICAgICBcImNkIFwiICsgcGF0aHMuY2VydERpciArIFwiICYmIGdpdCBhZGQgLUEgJiYgZ2l0IGNvbW1pdCAtbSAnVVBEQVRFIENFUlRTJyAmJiBnaXQgcHVzaCBvcmlnaW4gbWFzdGVyXCJcbiAgICApO1xufTtcblxuZXhwb3J0IGxldCBnZXRMZUNlcnRTeW5jID0gZnVuY3Rpb24oZG9tYWluQXJnOnN0cmluZyl7XG4gICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwibm93IGdldHRpbmcgY2VydHMgZnJvbSBMZXRzIEVuY3J5cHRcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJjZCAvYXBwLXNzbC8gJiYgLi9sZXRzZW5jcnlwdC5zaCAtYyAtZCBcIiArIGRvbWFpbkFyZyArIFwiIC10IGRucy0wMSAtayAnLi9ob29rcy9jbG91ZGZsYXJlL2hvb2sucHknXCIpO1xufTtcblxuZXhwb3J0IGxldCBjaGVja0NlcnRpZmljYXRlID0gZnVuY3Rpb24oKXtcbiAgICBcbn07XG5cbmV4cG9ydCBsZXQgZ2V0TmVlZGVkQ2VydHMgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG5cbiAgICBkb25lLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuZXhwb3J0IGxldCBnZXRBdmFpbGFibGVDZXJ0cyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLnNtYXJ0ZmlsZS5nZXQuZm9sZGVycyhwYXRocy5jZXJ0RGlyKVxuICAgICAgICAudGhlbihmdW5jdGlvbihmb2xkZXJzQXJyYXlBcmcpe1xuICAgICAgICAgICAgbmVlZGVkQ2VydHMgPSBmb2xkZXJzQXJyYXlBcmc7XG4gICAgICAgICAgICBkb25lLnJlc29sdmUobmVlZGVkQ2VydHMpO1xuICAgICAgICB9KTtcbiAgICBcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuZXhwb3J0IGxldCBnZXRNaXNzaW5nQ2VydHMgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
