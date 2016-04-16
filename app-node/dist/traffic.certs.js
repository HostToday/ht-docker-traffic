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
var setupCertsFromOriginSync = function () {
    TrafficSsh.setupSshFromEnvSync(); //setting up SSH in case SSH is specified;
    plugins.beautylog.log("now getting certificates from certificate origin");
    plugins.shelljs.exec("cd " + paths.certDir + " && git init && git remote add origin " + process.env.CERT_ORIGIN);
    pullCertsFromOriginSync();
};
exports.setupCerts = function () {
    var done = plugins.q.defer();
    if (TrafficOptions.certOrigin) {
        plugins.fs.ensureDirSync(paths.certDir);
        if (TrafficOptions.certOrigin)
            setupCertsFromOriginSync();
        done.resolve();
    }
    else {
        done.resolve();
    }
    return done.promise;
};
/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
var pullCertsFromOriginSync = function () {
    plugins.shelljs.exec("cd " + paths.certDir + " && git pull origin master");
};
var pushCertsToOriginSync = function () {
    plugins.beautylog.log("now syncing certs back to source ");
    plugins.shelljs.exec("cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS' && git push origin master");
};
var getLeCertSync = function (domainStringArg) {
    plugins.beautylog.log("now getting certs from Lets Encrypt");
    var resultPath = plugins.path.join(paths.appSslDir, "certs/", domainStringArg);
    plugins.shelljs.exec("cd /app-ssl/ && ./letsencrypt.sh -c -d " + domainStringArg + " -t dns-01 -k './hooks/cloudflare/hook.py'");
    plugins.shelljs.cp("-r", resultPath, paths.certDir);
    plugins.shelljs.rm('-rf', resultPath);
};
var checkCertificate = function () {
};
/**************************************************************
 ************ Main exports ************************************
 **************************************************************/
exports.getCerts = function (receivingContainersArrayArg) {
    var done = plugins.q.defer();
    getNeededCerts(receivingContainersArrayArg)
        .then(getAvailableCerts)
        .then(getMissingCerts)
        .then(done.resolve);
    return done.promise;
};
var getNeededCerts = function (receivingContainersArrayArg) {
    var done = plugins.q.defer();
    var neededCertsLocal = [];
    for (var containerKey in receivingContainersArrayArg) {
        neededCertsLocal.push(receivingContainersArrayArg[containerKey].domain);
    }
    exports.neededCerts = neededCertsLocal;
    plugins.beautylog.log("We need the following certificates:");
    console.log(neededCertsLocal);
    done.resolve(neededCertsLocal);
    return done.promise;
};
var getAvailableCerts = function (neededCertsArg) {
    var done = plugins.q.defer();
    plugins.smartfile.get.folders(paths.certDir)
        .then(function (foldersArrayArg) {
        exports.availableCerts = foldersArrayArg.filter(function (folderString) {
            return folderString != ".git"; //make sure that the .git directory is not listed as domain
        });
        plugins.beautylog.log("The following certs are available:");
        console.log(exports.availableCerts);
        exports.missingCerts = plugins.lodash.difference(neededCertsArg, exports.availableCerts);
        plugins.beautylog.log("The following certs missing:");
        console.log(exports.missingCerts);
        done.resolve(exports.missingCerts);
    });
    return done.promise;
};
var getMissingCerts = function (missingCertsArg) {
    var done = plugins.q.defer();
    for (var domainStringKey in missingCertsArg) {
        getLeCertSync(missingCertsArg[domainStringKey]);
    }
    ;
    done.resolve();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWZmaWMuY2VydHMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDRDQUE0QztBQUM1QyxJQUFPLE9BQU8sV0FBVyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlDLElBQU8sS0FBSyxXQUFXLGlCQUFpQixDQUFDLENBQUM7QUFDMUMsSUFBTyxjQUFjLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztBQUNyRCxJQUFPLFVBQVUsV0FBVyxlQUFlLENBQUMsQ0FBQztBQUU3Qzs7Z0VBRWdFO0FBRXJELG1CQUFXLEdBQUcsRUFBRSxDQUFDLENBQUMscUNBQXFDO0FBQ3ZELHNCQUFjLEdBQUcsRUFBRSxDQUFDLENBQUMsd0NBQXdDO0FBQzdELG9CQUFZLEdBQUcsRUFBRSxDQUFDLENBQUMsdUNBQXVDO0FBRXJFOztnRUFFZ0U7QUFFaEUsSUFBSSx3QkFBd0IsR0FBRztJQUMzQixVQUFVLENBQUMsbUJBQW1CLEVBQUUsQ0FBQyxDQUFDLDBDQUEwQztJQUM1RSxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxrREFBa0QsQ0FBQyxDQUFDO0lBQzFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUNoQixLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sR0FBRyx3Q0FBd0MsR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FDN0YsQ0FBQztJQUNGLHVCQUF1QixFQUFFLENBQUM7QUFDOUIsQ0FBQyxDQUFDO0FBRVMsa0JBQVUsR0FBRztJQUNwQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLEVBQUUsQ0FBQSxDQUFDLGNBQWMsQ0FBQyxVQUFVLENBQUMsQ0FBQSxDQUFDO1FBQzFCLE9BQU8sQ0FBQyxFQUFFLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4QyxFQUFFLENBQUEsQ0FBQyxjQUFjLENBQUMsVUFBVSxDQUFDO1lBQUMsd0JBQXdCLEVBQUUsQ0FBQztRQUN6RCxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDbkIsQ0FBQztJQUFDLElBQUksQ0FBQyxDQUFDO1FBQ0osSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ25CLENBQUM7SUFDRCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN4QixDQUFDLENBQUM7QUFFRjs7Z0VBRWdFO0FBQ2hFLElBQUksdUJBQXVCLEdBQUc7SUFDMUIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsNEJBQTRCLENBQUMsQ0FBQztBQUMvRSxDQUFDLENBQUM7QUFFRixJQUFJLHFCQUFxQixHQUFHO0lBQ3hCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDM0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2hCLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLDBFQUEwRSxDQUNyRyxDQUFDO0FBQ04sQ0FBQyxDQUFDO0FBRUYsSUFBSSxhQUFhLEdBQUcsVUFBUyxlQUFzQjtJQUMvQyxPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQzdELElBQUksVUFBVSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHlDQUF5QyxHQUFHLGVBQWUsR0FBRyw0Q0FBNEMsQ0FBQyxDQUFDO0lBQ2pJLE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLElBQUksRUFBQyxVQUFVLEVBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ2xELE9BQU8sQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxVQUFVLENBQUMsQ0FBQztBQUMxQyxDQUFDLENBQUM7QUFFRixJQUFJLGdCQUFnQixHQUFHO0FBRXZCLENBQUMsQ0FBQztBQUVGOztnRUFFZ0U7QUFFckQsZ0JBQVEsR0FBRyxVQUFTLDJCQUFpQztJQUM1RCxJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLGNBQWMsQ0FBQywyQkFBMkIsQ0FBQztTQUN0QyxJQUFJLENBQUMsaUJBQWlCLENBQUM7U0FDdkIsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUNyQixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3hCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3hCLENBQUMsQ0FBQztBQUdGLElBQUksY0FBYyxHQUFHLFVBQVMsMkJBQWlDO0lBQzNELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsSUFBSSxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDMUIsR0FBRyxDQUFBLENBQUMsSUFBSSxZQUFZLElBQUksMkJBQTJCLENBQUMsQ0FBQSxDQUFDO1FBQ2pELGdCQUFnQixDQUFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQztJQUM1RSxDQUFDO0lBQ0QsbUJBQVcsR0FBRyxnQkFBZ0IsQ0FBQztJQUMvQixPQUFPLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxxQ0FBcUMsQ0FBQyxDQUFDO0lBQzdELE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztJQUM5QixJQUFJLENBQUMsT0FBTyxDQUFDLGdCQUFnQixDQUFDLENBQUM7SUFDL0IsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsSUFBSSxpQkFBaUIsR0FBRyxVQUFTLGNBQXVCO0lBQ3BELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7U0FDdkMsSUFBSSxDQUFDLFVBQVMsZUFBZTtRQUMxQixzQkFBYyxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsVUFBUyxZQUFtQjtZQUNoRSxNQUFNLENBQUMsWUFBWSxJQUFJLE1BQU0sQ0FBQSxDQUFDLDJEQUEyRDtRQUM3RixDQUFDLENBQUMsQ0FBQztRQUNILE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG9DQUFvQyxDQUFDLENBQUM7UUFDNUQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBYyxDQUFDLENBQUM7UUFDNUIsb0JBQVksR0FBRyxPQUFPLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxjQUFjLEVBQUMsc0JBQWMsQ0FBQyxDQUFDO1FBQ3hFLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7UUFDdEQsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBWSxDQUFDLENBQUM7UUFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxvQkFBWSxDQUFDLENBQUM7SUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFFUCxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN4QixDQUFDLENBQUM7QUFFRixJQUFJLGVBQWUsR0FBRyxVQUFTLGVBQXdCO0lBQ25ELElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsR0FBRyxDQUFBLENBQUMsSUFBSSxlQUFlLElBQUksZUFBZSxDQUFDLENBQUEsQ0FBQztRQUN4QyxhQUFhLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUM7SUFDcEQsQ0FBQztJQUFBLENBQUM7SUFDRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN4QixDQUFDLENBQUMiLCJmaWxlIjoidHJhZmZpYy5jZXJ0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IHBhdGhzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wYXRoc1wiKTtcbmltcG9ydCBUcmFmZmljT3B0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMub3B0aW9uc1wiKTtcbmltcG9ydCBUcmFmZmljU3NoID0gcmVxdWlyZShcIi4vdHJhZmZpYy5zc2hcIik7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBEQVRBIFNUT1JBR0UgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgbmVlZGVkQ2VydHMgPSBbXTsgLy9hbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG5lZWRlZFxuZXhwb3J0IGxldCBhdmFpbGFibGVDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgYXZhaWxhYmxlXG5leHBvcnQgbGV0IG1pc3NpbmdDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgbWlzc2luZyBcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIFNFVFVQUyAtIFJVTiBPTiBGSVJTVCBTVEFSVCAqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IHNldHVwQ2VydHNGcm9tT3JpZ2luU3luYyA9IGZ1bmN0aW9uKCl7XG4gICAgVHJhZmZpY1NzaC5zZXR1cFNzaEZyb21FbnZTeW5jKCk7IC8vc2V0dGluZyB1cCBTU0ggaW4gY2FzZSBTU0ggaXMgc3BlY2lmaWVkO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIm5vdyBnZXR0aW5nIGNlcnRpZmljYXRlcyBmcm9tIGNlcnRpZmljYXRlIG9yaWdpblwiKTtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcbiAgICAgICAgXCJjZCBcIiArIHBhdGhzLmNlcnREaXIgKyBcIiAmJiBnaXQgaW5pdCAmJiBnaXQgcmVtb3RlIGFkZCBvcmlnaW4gXCIgKyBwcm9jZXNzLmVudi5DRVJUX09SSUdJTlxuICAgICk7XG4gICAgcHVsbENlcnRzRnJvbU9yaWdpblN5bmMoKTtcbn07XG5cbmV4cG9ydCBsZXQgc2V0dXBDZXJ0cyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBpZihUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luKXtcbiAgICAgICAgcGx1Z2lucy5mcy5lbnN1cmVEaXJTeW5jKHBhdGhzLmNlcnREaXIpO1xuICAgICAgICBpZihUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luKSBzZXR1cENlcnRzRnJvbU9yaWdpblN5bmMoKTtcbiAgICAgICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgfVxuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogUm91dGluZXMgLSBSVU4gRFVSSU5HIENPTlRBSU5FUiBMSUZFVElNRSAqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xubGV0IHB1bGxDZXJ0c0Zyb21PcmlnaW5TeW5jID0gZnVuY3Rpb24oKXtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcImNkIFwiICsgcGF0aHMuY2VydERpciArIFwiICYmIGdpdCBwdWxsIG9yaWdpbiBtYXN0ZXJcIik7XG59O1xuXG5sZXQgcHVzaENlcnRzVG9PcmlnaW5TeW5jID0gZnVuY3Rpb24oKXtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgc3luY2luZyBjZXJ0cyBiYWNrIHRvIHNvdXJjZSBcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXG4gICAgICAgIFwiY2QgXCIgKyBwYXRocy5jZXJ0RGlyICsgXCIgJiYgZ2l0IGFkZCAtQSAmJiBnaXQgY29tbWl0IC1tICdVUERBVEUgQ0VSVFMnICYmIGdpdCBwdXNoIG9yaWdpbiBtYXN0ZXJcIlxuICAgICk7XG59O1xuXG5sZXQgZ2V0TGVDZXJ0U3luYyA9IGZ1bmN0aW9uKGRvbWFpblN0cmluZ0FyZzpzdHJpbmcpe1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIm5vdyBnZXR0aW5nIGNlcnRzIGZyb20gTGV0cyBFbmNyeXB0XCIpO1xuICAgIGxldCByZXN1bHRQYXRoID0gcGx1Z2lucy5wYXRoLmpvaW4ocGF0aHMuYXBwU3NsRGlyLFwiY2VydHMvXCIsZG9tYWluU3RyaW5nQXJnKTtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcImNkIC9hcHAtc3NsLyAmJiAuL2xldHNlbmNyeXB0LnNoIC1jIC1kIFwiICsgZG9tYWluU3RyaW5nQXJnICsgXCIgLXQgZG5zLTAxIC1rICcuL2hvb2tzL2Nsb3VkZmxhcmUvaG9vay5weSdcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmNwKFwiLXJcIixyZXN1bHRQYXRoLHBhdGhzLmNlcnREaXIpO1xuICAgIHBsdWdpbnMuc2hlbGxqcy5ybSgnLXJmJywgcmVzdWx0UGF0aCk7XG59O1xuXG5sZXQgY2hlY2tDZXJ0aWZpY2F0ZSA9IGZ1bmN0aW9uKCl7XG4gICAgXG59O1xuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogTWFpbiBleHBvcnRzICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5leHBvcnQgbGV0IGdldENlcnRzID0gZnVuY3Rpb24ocmVjZWl2aW5nQ29udGFpbmVyc0FycmF5QXJnOmFueVtdKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGdldE5lZWRlZENlcnRzKHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZylcbiAgICAgICAgLnRoZW4oZ2V0QXZhaWxhYmxlQ2VydHMpXG4gICAgICAgIC50aGVuKGdldE1pc3NpbmdDZXJ0cylcbiAgICAgICAgLnRoZW4oZG9uZS5yZXNvbHZlKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuXG5sZXQgZ2V0TmVlZGVkQ2VydHMgPSBmdW5jdGlvbihyZWNlaXZpbmdDb250YWluZXJzQXJyYXlBcmc6YW55W10pe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgbGV0IG5lZWRlZENlcnRzTG9jYWwgPSBbXTtcbiAgICBmb3IobGV0IGNvbnRhaW5lcktleSBpbiByZWNlaXZpbmdDb250YWluZXJzQXJyYXlBcmcpe1xuICAgICAgICBuZWVkZWRDZXJ0c0xvY2FsLnB1c2gocmVjZWl2aW5nQ29udGFpbmVyc0FycmF5QXJnW2NvbnRhaW5lcktleV0uZG9tYWluKTtcbiAgICB9XG4gICAgbmVlZGVkQ2VydHMgPSBuZWVkZWRDZXJ0c0xvY2FsO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIldlIG5lZWQgdGhlIGZvbGxvd2luZyBjZXJ0aWZpY2F0ZXM6XCIpO1xuICAgIGNvbnNvbGUubG9nKG5lZWRlZENlcnRzTG9jYWwpO1xuICAgIGRvbmUucmVzb2x2ZShuZWVkZWRDZXJ0c0xvY2FsKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxubGV0IGdldEF2YWlsYWJsZUNlcnRzID0gZnVuY3Rpb24obmVlZGVkQ2VydHNBcmc6c3RyaW5nW10pe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgcGx1Z2lucy5zbWFydGZpbGUuZ2V0LmZvbGRlcnMocGF0aHMuY2VydERpcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZm9sZGVyc0FycmF5QXJnKXtcbiAgICAgICAgICAgIGF2YWlsYWJsZUNlcnRzID0gZm9sZGVyc0FycmF5QXJnLmZpbHRlcihmdW5jdGlvbihmb2xkZXJTdHJpbmc6c3RyaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVyU3RyaW5nICE9IFwiLmdpdFwiIC8vbWFrZSBzdXJlIHRoYXQgdGhlIC5naXQgZGlyZWN0b3J5IGlzIG5vdCBsaXN0ZWQgYXMgZG9tYWluXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgYXJlIGF2YWlsYWJsZTpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFibGVDZXJ0cyk7XG4gICAgICAgICAgICBtaXNzaW5nQ2VydHMgPSBwbHVnaW5zLmxvZGFzaC5kaWZmZXJlbmNlKG5lZWRlZENlcnRzQXJnLGF2YWlsYWJsZUNlcnRzKTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgbWlzc2luZzpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtaXNzaW5nQ2VydHMpO1xuICAgICAgICAgICAgZG9uZS5yZXNvbHZlKG1pc3NpbmdDZXJ0cyk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5sZXQgZ2V0TWlzc2luZ0NlcnRzID0gZnVuY3Rpb24obWlzc2luZ0NlcnRzQXJnOnN0cmluZ1tdKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGZvcihsZXQgZG9tYWluU3RyaW5nS2V5IGluIG1pc3NpbmdDZXJ0c0FyZyl7XG4gICAgICAgIGdldExlQ2VydFN5bmMobWlzc2luZ0NlcnRzQXJnW2RvbWFpblN0cmluZ0tleV0pO1xuICAgIH07XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
