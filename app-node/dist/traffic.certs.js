"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var paths = require("./traffic.paths");
var TrafficOptions = require("./traffic.options");
/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/
exports.neededCerts = []; //all certs that are currently needed
exports.availableCerts = []; //all certs that are currently available
exports.missingCerts = []; //all certs that are currently missing 
/**************************************************************
 ************ SETUPS - RUN ON FIRST START *********************
 **************************************************************/
var setupCertsFromOrigin = function () {
    var done = plugins.q.defer();
    plugins.beautylog.log("now getting certificates from certificate origin");
    plugins.shelljs.exec("cd " + paths.certDir + " && git init && git remote add origin " + process.env.CERT_ORIGIN);
    done.resolve();
    return done.promise;
};
exports.setupCerts = function () {
    var done = plugins.q.defer();
    plugins.beautylog.log("now setting up certs...");
    plugins.fs.ensureDirSync(paths.certDir);
    TrafficOptions.certOrigin ? setupCertsFromOrigin().then(done.resolve) : done.resolve();
    return done.promise;
};
/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
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
        .then(getCertsFromOrigin)
        .then(getAvailableCerts)
        .then(getMissingCerts)
        .then(pushCertsToOrigin)
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
var getCertsFromOrigin = function (neededCertsArg) {
    var done = plugins.q.defer();
    plugins.shelljs.exec("cd " + paths.certDir + " && git pull origin master");
    done.resolve(neededCertsArg);
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
var pushCertsToOrigin = function () {
    var done = plugins.q.defer();
    plugins.beautylog.log("now syncing certs back to source ");
    plugins.shelljs.exec("cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS' && git push origin master");
    done.resolve();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,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QUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsbUNBQW1DLENBQUMsQ0FBQztJQUMzRCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsMEVBQTBFLENBQ3JHLENBQUM7SUFDRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN4QixDQUFDLENBQUMiLCJmaWxlIjoidHJhZmZpYy5jZXJ0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IHBhdGhzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wYXRoc1wiKTtcbmltcG9ydCBUcmFmZmljT3B0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMub3B0aW9uc1wiKTtcbmltcG9ydCBUcmFmZmljU3NoID0gcmVxdWlyZShcIi4vdHJhZmZpYy5zc2hcIik7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBEQVRBIFNUT1JBR0UgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgbmVlZGVkQ2VydHMgPSBbXTsgLy9hbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG5lZWRlZFxuZXhwb3J0IGxldCBhdmFpbGFibGVDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgYXZhaWxhYmxlXG5leHBvcnQgbGV0IG1pc3NpbmdDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgbWlzc2luZyBcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIFNFVFVQUyAtIFJVTiBPTiBGSVJTVCBTVEFSVCAqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IHNldHVwQ2VydHNGcm9tT3JpZ2luID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIm5vdyBnZXR0aW5nIGNlcnRpZmljYXRlcyBmcm9tIGNlcnRpZmljYXRlIG9yaWdpblwiKTtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcbiAgICAgICAgXCJjZCBcIiArIHBhdGhzLmNlcnREaXIgKyBcIiAmJiBnaXQgaW5pdCAmJiBnaXQgcmVtb3RlIGFkZCBvcmlnaW4gXCIgKyBwcm9jZXNzLmVudi5DRVJUX09SSUdJTlxuICAgICk7XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgc2V0dXBDZXJ0cyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgc2V0dGluZyB1cCBjZXJ0cy4uLlwiKVxuICAgIHBsdWdpbnMuZnMuZW5zdXJlRGlyU3luYyhwYXRocy5jZXJ0RGlyKTtcbiAgICBUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luID8gc2V0dXBDZXJ0c0Zyb21PcmlnaW4oKS50aGVuKGRvbmUucmVzb2x2ZSkgOiBkb25lLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIFJvdXRpbmVzIC0gUlVOIERVUklORyBDT05UQUlORVIgTElGRVRJTUUgKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IGdldExlQ2VydFN5bmMgPSBmdW5jdGlvbihkb21haW5TdHJpbmdBcmc6c3RyaW5nKXtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgZ2V0dGluZyBjZXJ0cyBmcm9tIExldHMgRW5jcnlwdFwiKTtcbiAgICBsZXQgcmVzdWx0UGF0aCA9IHBsdWdpbnMucGF0aC5qb2luKHBhdGhzLmFwcFNzbERpcixcImNlcnRzL1wiLGRvbWFpblN0cmluZ0FyZyk7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJjZCAvYXBwLXNzbC8gJiYgLi9sZXRzZW5jcnlwdC5zaCAtYyAtZCBcIiArIGRvbWFpblN0cmluZ0FyZyArIFwiIC10IGRucy0wMSAtayAnLi9ob29rcy9jbG91ZGZsYXJlL2hvb2sucHknXCIpO1xuICAgIHBsdWdpbnMuc2hlbGxqcy5jcChcIi1yXCIscmVzdWx0UGF0aCxwYXRocy5jZXJ0RGlyKTtcbiAgICBwbHVnaW5zLnNoZWxsanMucm0oJy1yZicsIHJlc3VsdFBhdGgpO1xufTtcblxubGV0IGNoZWNrQ2VydGlmaWNhdGUgPSBmdW5jdGlvbigpe1xuICAgIFxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIE1haW4gZXhwb3J0cyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGxldCBnZXRDZXJ0cyA9IGZ1bmN0aW9uKHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZzphbnlbXSl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBnZXROZWVkZWRDZXJ0cyhyZWNlaXZpbmdDb250YWluZXJzQXJyYXlBcmcpXG4gICAgICAgIC50aGVuKGdldENlcnRzRnJvbU9yaWdpbilcbiAgICAgICAgLnRoZW4oZ2V0QXZhaWxhYmxlQ2VydHMpXG4gICAgICAgIC50aGVuKGdldE1pc3NpbmdDZXJ0cylcbiAgICAgICAgLnRoZW4ocHVzaENlcnRzVG9PcmlnaW4pXG4gICAgICAgIC50aGVuKGRvbmUucmVzb2x2ZSk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cblxubGV0IGdldE5lZWRlZENlcnRzID0gZnVuY3Rpb24ocmVjZWl2aW5nQ29udGFpbmVyc0FycmF5QXJnOmFueVtdKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGxldCBuZWVkZWRDZXJ0c0xvY2FsID0gW107XG4gICAgZm9yKGxldCBjb250YWluZXJLZXkgaW4gcmVjZWl2aW5nQ29udGFpbmVyc0FycmF5QXJnKXtcbiAgICAgICAgbmVlZGVkQ2VydHNMb2NhbC5wdXNoKHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZ1tjb250YWluZXJLZXldLmRvbWFpbik7XG4gICAgfVxuICAgIG5lZWRlZENlcnRzID0gbmVlZGVkQ2VydHNMb2NhbDtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJXZSBuZWVkIHRoZSBmb2xsb3dpbmcgY2VydGlmaWNhdGVzOlwiKTtcbiAgICBjb25zb2xlLmxvZyhuZWVkZWRDZXJ0c0xvY2FsKTtcbiAgICBkb25lLnJlc29sdmUobmVlZGVkQ2VydHNMb2NhbCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmxldCBnZXRDZXJ0c0Zyb21PcmlnaW4gPSBmdW5jdGlvbihuZWVkZWRDZXJ0c0FyZyl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcImNkIFwiICsgcGF0aHMuY2VydERpciArIFwiICYmIGdpdCBwdWxsIG9yaWdpbiBtYXN0ZXJcIik7XG4gICAgZG9uZS5yZXNvbHZlKG5lZWRlZENlcnRzQXJnKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxubGV0IGdldEF2YWlsYWJsZUNlcnRzID0gZnVuY3Rpb24obmVlZGVkQ2VydHNBcmc6c3RyaW5nW10pe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgcGx1Z2lucy5zbWFydGZpbGUuZ2V0LmZvbGRlcnMocGF0aHMuY2VydERpcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZm9sZGVyc0FycmF5QXJnKXtcbiAgICAgICAgICAgIGF2YWlsYWJsZUNlcnRzID0gZm9sZGVyc0FycmF5QXJnLmZpbHRlcihmdW5jdGlvbihmb2xkZXJTdHJpbmc6c3RyaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVyU3RyaW5nICE9IFwiLmdpdFwiIC8vbWFrZSBzdXJlIHRoYXQgdGhlIC5naXQgZGlyZWN0b3J5IGlzIG5vdCBsaXN0ZWQgYXMgZG9tYWluXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgYXJlIGF2YWlsYWJsZTpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFibGVDZXJ0cyk7XG4gICAgICAgICAgICBtaXNzaW5nQ2VydHMgPSBwbHVnaW5zLmxvZGFzaC5kaWZmZXJlbmNlKG5lZWRlZENlcnRzQXJnLGF2YWlsYWJsZUNlcnRzKTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgbWlzc2luZzpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtaXNzaW5nQ2VydHMpO1xuICAgICAgICAgICAgZG9uZS5yZXNvbHZlKG1pc3NpbmdDZXJ0cyk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5sZXQgZ2V0TWlzc2luZ0NlcnRzID0gZnVuY3Rpb24obWlzc2luZ0NlcnRzQXJnOnN0cmluZ1tdKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGZvcihsZXQgZG9tYWluU3RyaW5nS2V5IGluIG1pc3NpbmdDZXJ0c0FyZyl7XG4gICAgICAgIGdldExlQ2VydFN5bmMobWlzc2luZ0NlcnRzQXJnW2RvbWFpblN0cmluZ0tleV0pO1xuICAgIH07XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmxldCBwdXNoQ2VydHNUb09yaWdpbiA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgc3luY2luZyBjZXJ0cyBiYWNrIHRvIHNvdXJjZSBcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXG4gICAgICAgIFwiY2QgXCIgKyBwYXRocy5jZXJ0RGlyICsgXCIgJiYgZ2l0IGFkZCAtQSAmJiBnaXQgY29tbWl0IC1tICdVUERBVEUgQ0VSVFMnICYmIGdpdCBwdXNoIG9yaWdpbiBtYXN0ZXJcIlxuICAgICk7XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
