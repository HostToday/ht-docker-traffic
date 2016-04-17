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
        .then(removeOldCerts)
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
var removeOldCerts = function (neededCertsArg) {
    var done = plugins.q.defer();
    plugins.beautylog.log("now checking for obsolete certificates");
    var regexCertTime = /-(.*).pem/;
    var regexDomainName = /LE_CERTS\/(.*)\//;
    var obsoleteCerts = [];
    plugins.gulp.src([
        plugins.path.join(paths.certDir, "**/fullchain-*"),
        "!" + plugins.path.join(paths.certDir, ".git/**/*")
    ])
        .pipe(plugins.through2.obj(function (file, enc, cb) {
        var certGenerationTime = parseInt((regexCertTime.exec(file.relative))[1]);
        var currentTime = plugins.moment(new Date()).seconds();
        var certDomainName = (regexDomainName.exec(file.path))[1];
        if (certGenerationTime + 7000000 < currentTime) {
            console.log(certDomainName + " is obsolete!");
            obsoleteCerts.push(certDomainName);
        }
        else {
            console.log(certDomainName + " is still valid!");
        }
        cb(null, file);
    }, done.resolve));
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
    plugins.beautylog.log("now commiting certificate changes");
    plugins.shelljs.exec("cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS'");
    plugins.beautylog.log("Now pushing certificate changes");
    plugins.shelljs.exec("cd " + paths.certDir + " && git push origin master");
    done.resolve();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,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QzdCLEdBQUcsQ0FBQSxDQUFDLElBQUksZUFBZSxJQUFJLGVBQWUsQ0FBQyxDQUFBLENBQUM7UUFDeEMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDO0lBQ3BELENBQUM7SUFBQSxDQUFDO0lBQ0YsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDeEIsQ0FBQyxDQUFDO0FBRUYsSUFBSSxpQkFBaUIsR0FBRztJQUNwQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLENBQUM7SUFDM0QsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQ2hCLEtBQUssR0FBRyxLQUFLLENBQUMsT0FBTyxHQUFHLGdEQUFnRCxDQUMzRSxDQUFDO0lBQ0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsaUNBQWlDLENBQUMsQ0FBQztJQUN6RCxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FDaEIsS0FBSyxHQUFHLEtBQUssQ0FBQyxPQUFPLEdBQUcsNEJBQTRCLENBQ3ZELENBQUM7SUFDRixJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDZixNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztBQUN4QixDQUFDLENBQUMiLCJmaWxlIjoidHJhZmZpYy5jZXJ0cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IHBhdGhzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wYXRoc1wiKTtcbmltcG9ydCBUcmFmZmljT3B0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMub3B0aW9uc1wiKTtcbmltcG9ydCBUcmFmZmljU3NoID0gcmVxdWlyZShcIi4vdHJhZmZpYy5zc2hcIik7XG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBEQVRBIFNUT1JBR0UgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbmV4cG9ydCBsZXQgbmVlZGVkQ2VydHMgPSBbXTsgLy9hbGwgY2VydHMgdGhhdCBhcmUgY3VycmVudGx5IG5lZWRlZFxuZXhwb3J0IGxldCBhdmFpbGFibGVDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgYXZhaWxhYmxlXG5leHBvcnQgbGV0IG1pc3NpbmdDZXJ0cyA9IFtdOyAvL2FsbCBjZXJ0cyB0aGF0IGFyZSBjdXJyZW50bHkgbWlzc2luZyBcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIFNFVFVQUyAtIFJVTiBPTiBGSVJTVCBTVEFSVCAqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IHNldHVwQ2VydHNGcm9tT3JpZ2luID0gZnVuY3Rpb24oKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIm5vdyBnZXR0aW5nIGNlcnRpZmljYXRlcyBmcm9tIGNlcnRpZmljYXRlIG9yaWdpblwiKTtcbiAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcbiAgICAgICAgXCJjZCBcIiArIHBhdGhzLmNlcnREaXIgKyBcIiAmJiBnaXQgaW5pdCAmJiBnaXQgcmVtb3RlIGFkZCBvcmlnaW4gXCIgKyBwcm9jZXNzLmVudi5DRVJUX09SSUdJTlxuICAgICk7XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgc2V0dXBDZXJ0cyA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgc2V0dGluZyB1cCBjZXJ0cy4uLlwiKVxuICAgIHBsdWdpbnMuZnMuZW5zdXJlRGlyU3luYyhwYXRocy5jZXJ0RGlyKTtcbiAgICBUcmFmZmljT3B0aW9ucy5jZXJ0T3JpZ2luID8gc2V0dXBDZXJ0c0Zyb21PcmlnaW4oKS50aGVuKGRvbmUucmVzb2x2ZSkgOiBkb25lLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIFJvdXRpbmVzIC0gUlVOIERVUklORyBDT05UQUlORVIgTElGRVRJTUUgKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxubGV0IGdldExlQ2VydFN5bmMgPSBmdW5jdGlvbihkb21haW5TdHJpbmdBcmc6c3RyaW5nKXtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgZ2V0dGluZyBjZXJ0cyBmcm9tIExldHMgRW5jcnlwdFwiKTtcbiAgICBsZXQgcmVzdWx0UGF0aCA9IHBsdWdpbnMucGF0aC5qb2luKHBhdGhzLmFwcFNzbERpcixcImNlcnRzL1wiLGRvbWFpblN0cmluZ0FyZyk7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJjZCAvYXBwLXNzbC8gJiYgLi9sZXRzZW5jcnlwdC5zaCAtYyAtZCBcIiArIGRvbWFpblN0cmluZ0FyZyArIFwiIC10IGRucy0wMSAtayAnLi9ob29rcy9jbG91ZGZsYXJlL2hvb2sucHknXCIpO1xuICAgIHBsdWdpbnMuc2hlbGxqcy5jcChcIi1yXCIscmVzdWx0UGF0aCxwYXRocy5jZXJ0RGlyKTtcbiAgICBwbHVnaW5zLnNoZWxsanMucm0oJy1yZicsIHJlc3VsdFBhdGgpO1xufTtcblxubGV0IGNoZWNrQ2VydGlmaWNhdGUgPSBmdW5jdGlvbigpe1xuICAgIFxufTtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqXG4gKioqKioqKioqKioqIE1haW4gZXhwb3J0cyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuZXhwb3J0IGxldCBnZXRDZXJ0cyA9IGZ1bmN0aW9uKHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZzphbnlbXSl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBnZXROZWVkZWRDZXJ0cyhyZWNlaXZpbmdDb250YWluZXJzQXJyYXlBcmcpXG4gICAgICAgIC50aGVuKGdldENlcnRzRnJvbU9yaWdpbilcbiAgICAgICAgLnRoZW4ocmVtb3ZlT2xkQ2VydHMpXG4gICAgICAgIC50aGVuKGdldEF2YWlsYWJsZUNlcnRzKVxuICAgICAgICAudGhlbihnZXRNaXNzaW5nQ2VydHMpXG4gICAgICAgIC50aGVuKHB1c2hDZXJ0c1RvT3JpZ2luKVxuICAgICAgICAudGhlbihkb25lLnJlc29sdmUpO1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5cbmxldCBnZXROZWVkZWRDZXJ0cyA9IGZ1bmN0aW9uKHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZzphbnlbXSl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBsZXQgbmVlZGVkQ2VydHNMb2NhbCA9IFtdO1xuICAgIGZvcihsZXQgY29udGFpbmVyS2V5IGluIHJlY2VpdmluZ0NvbnRhaW5lcnNBcnJheUFyZyl7XG4gICAgICAgIG5lZWRlZENlcnRzTG9jYWwucHVzaChyZWNlaXZpbmdDb250YWluZXJzQXJyYXlBcmdbY29udGFpbmVyS2V5XS5kb21haW4pO1xuICAgIH1cbiAgICBuZWVkZWRDZXJ0cyA9IG5lZWRlZENlcnRzTG9jYWw7XG4gICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwiV2UgbmVlZCB0aGUgZm9sbG93aW5nIGNlcnRpZmljYXRlczpcIik7XG4gICAgY29uc29sZS5sb2cobmVlZGVkQ2VydHNMb2NhbCk7XG4gICAgZG9uZS5yZXNvbHZlKG5lZWRlZENlcnRzTG9jYWwpO1xuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5sZXQgZ2V0Q2VydHNGcm9tT3JpZ2luID0gZnVuY3Rpb24obmVlZGVkQ2VydHNBcmcpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJjZCBcIiArIHBhdGhzLmNlcnREaXIgKyBcIiAmJiBnaXQgcHVsbCBvcmlnaW4gbWFzdGVyXCIpO1xuICAgIGRvbmUucmVzb2x2ZShuZWVkZWRDZXJ0c0FyZyk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmxldCByZW1vdmVPbGRDZXJ0cyA9IGZ1bmN0aW9uKG5lZWRlZENlcnRzQXJnKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIm5vdyBjaGVja2luZyBmb3Igb2Jzb2xldGUgY2VydGlmaWNhdGVzXCIpO1xuICAgIGxldCByZWdleENlcnRUaW1lID0gLy0oLiopLnBlbS87XG4gICAgbGV0IHJlZ2V4RG9tYWluTmFtZSA9IC9MRV9DRVJUU1xcLyguKilcXC8vXG4gICAgbGV0IG9ic29sZXRlQ2VydHMgPSBbXTtcbiAgICBwbHVnaW5zLmd1bHAuc3JjKFtcbiAgICAgICAgcGx1Z2lucy5wYXRoLmpvaW4ocGF0aHMuY2VydERpcixcIioqL2Z1bGxjaGFpbi0qXCIpLFxuICAgICAgICBcIiFcIiArIHBsdWdpbnMucGF0aC5qb2luKHBhdGhzLmNlcnREaXIsXCIuZ2l0LyoqLypcIilcbiAgICBdKVxuICAgICAgICAucGlwZShwbHVnaW5zLnRocm91Z2gyLm9iaihmdW5jdGlvbihmaWxlLGVuYyxjYil7XG4gICAgICAgICAgICBsZXQgY2VydEdlbmVyYXRpb25UaW1lOm51bWJlciA9IHBhcnNlSW50KChyZWdleENlcnRUaW1lLmV4ZWMoZmlsZS5yZWxhdGl2ZSkpWzFdKTtcbiAgICAgICAgICAgIGxldCBjdXJyZW50VGltZTpudW1iZXIgPSBwbHVnaW5zLm1vbWVudChuZXcgRGF0ZSgpKS5zZWNvbmRzKCk7XG4gICAgICAgICAgICBsZXQgY2VydERvbWFpbk5hbWUgPSAocmVnZXhEb21haW5OYW1lLmV4ZWMoZmlsZS5wYXRoKSlbMV07XG4gICAgICAgICAgICBpZiAoY2VydEdlbmVyYXRpb25UaW1lICsgNzAwMDAwMCA8IGN1cnJlbnRUaW1lKXtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjZXJ0RG9tYWluTmFtZSArIFwiIGlzIG9ic29sZXRlIVwiKTtcbiAgICAgICAgICAgICAgICBvYnNvbGV0ZUNlcnRzLnB1c2goY2VydERvbWFpbk5hbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjZXJ0RG9tYWluTmFtZSArIFwiIGlzIHN0aWxsIHZhbGlkIVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNiKG51bGwsZmlsZSk7XG4gICAgICAgIH0sZG9uZS5yZXNvbHZlKSk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn1cblxubGV0IGdldEF2YWlsYWJsZUNlcnRzID0gZnVuY3Rpb24obmVlZGVkQ2VydHNBcmc6c3RyaW5nW10pe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgcGx1Z2lucy5zbWFydGZpbGUuZ2V0LmZvbGRlcnMocGF0aHMuY2VydERpcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oZm9sZGVyc0FycmF5QXJnKXtcbiAgICAgICAgICAgIGF2YWlsYWJsZUNlcnRzID0gZm9sZGVyc0FycmF5QXJnLmZpbHRlcihmdW5jdGlvbihmb2xkZXJTdHJpbmc6c3RyaW5nKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZm9sZGVyU3RyaW5nICE9IFwiLmdpdFwiIC8vbWFrZSBzdXJlIHRoYXQgdGhlIC5naXQgZGlyZWN0b3J5IGlzIG5vdCBsaXN0ZWQgYXMgZG9tYWluXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgYXJlIGF2YWlsYWJsZTpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhhdmFpbGFibGVDZXJ0cyk7XG4gICAgICAgICAgICBtaXNzaW5nQ2VydHMgPSBwbHVnaW5zLmxvZGFzaC5kaWZmZXJlbmNlKG5lZWRlZENlcnRzQXJnLGF2YWlsYWJsZUNlcnRzKTtcbiAgICAgICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIlRoZSBmb2xsb3dpbmcgY2VydHMgbWlzc2luZzpcIik7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhtaXNzaW5nQ2VydHMpO1xuICAgICAgICAgICAgZG9uZS5yZXNvbHZlKG1pc3NpbmdDZXJ0cyk7XG4gICAgICAgIH0pO1xuICAgIFxuICAgIHJldHVybiBkb25lLnByb21pc2U7XG59O1xuXG5sZXQgZ2V0TWlzc2luZ0NlcnRzID0gZnVuY3Rpb24obWlzc2luZ0NlcnRzQXJnOnN0cmluZ1tdKXtcbiAgICBsZXQgZG9uZSA9IHBsdWdpbnMucS5kZWZlcigpO1xuICAgIGZvcihsZXQgZG9tYWluU3RyaW5nS2V5IGluIG1pc3NpbmdDZXJ0c0FyZyl7XG4gICAgICAgIGdldExlQ2VydFN5bmMobWlzc2luZ0NlcnRzQXJnW2RvbWFpblN0cmluZ0tleV0pO1xuICAgIH07XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmxldCBwdXNoQ2VydHNUb09yaWdpbiA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJub3cgY29tbWl0aW5nIGNlcnRpZmljYXRlIGNoYW5nZXNcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXG4gICAgICAgIFwiY2QgXCIgKyBwYXRocy5jZXJ0RGlyICsgXCIgJiYgZ2l0IGFkZCAtQSAmJiBnaXQgY29tbWl0IC1tICdVUERBVEUgQ0VSVFMnXCJcbiAgICApO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmxvZyhcIk5vdyBwdXNoaW5nIGNlcnRpZmljYXRlIGNoYW5nZXNcIik7XG4gICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXG4gICAgICAgIFwiY2QgXCIgKyBwYXRocy5jZXJ0RGlyICsgXCIgJiYgZ2l0IHB1c2ggb3JpZ2luIG1hc3RlclwiXG4gICAgKTtcbiAgICBkb25lLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
