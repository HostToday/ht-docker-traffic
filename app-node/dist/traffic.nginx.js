"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var paths = require("./traffic.paths");
var deleteOldConfig = function (containerDataArrayArg) {
    var done = plugins.q.defer();
    plugins.shelljs.rm("-r", "/etc/nginx/conf.d/*");
    done.resolve(containerDataArrayArg);
    return done.promise;
};
var createNewConfig = function (containerDataArrayArg) {
    var done = plugins.q.defer();
    var nginxTemplate = plugins.smartfile.local.toStringSync(paths.nginxTemplate);
    var regexContainerDomainName = /{{containerDomainName}}/g;
    var regexContainerIp = /{{containerIp}}/g;
    for (var containerKey in containerDataArrayArg) {
        var containerData = containerDataArrayArg[containerKey];
        var nginxConfig = nginxTemplate
            .replace(regexContainerDomainName, containerData.domain)
            .replace(regexContainerIp, containerData.ip);
        plugins.smartfile.memory.toFsSync(nginxConfig, { fileName: containerData.domain + ".conf", filePath: paths.nginxConfDir });
        plugins.beautylog.ok("created nginx config for " + containerData.domain);
    }
    done.resolve();
    return done.promise;
};
exports.getNginxConfig = function (containerDataArrayArg) {
    var done = plugins.q.defer();
    plugins.beautylog.log("now creating nginx config");
    deleteOldConfig(containerDataArrayArg)
        .then(createNewConfig)
        .then(reStartNginx)
        .then(done.resolve);
    return done.promise;
};
/**************************************************************
 ************ Nginx Child Process *****************************
 **************************************************************/
var nginxChildProcess = undefined;
var reStartNginx = function () {
    var done = plugins.q.defer();
    if (typeof nginxChildProcess != "undefined") {
        nginxChildProcess.kill();
        plugins.beautylog.info("killed Nginx!");
    }
    nginxChildProcess = plugins.childProcess.exec("nginx", function (error, stdout, stderr) {
        console.log("stdout: " + stdout);
        console.log("stderr: " + stderr);
        if (error !== null) {
            console.log("exec error: " + error);
        }
    });
    plugins.beautylog.info("started Nginx!");
    done.resolve();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,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QVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFDLFVBQVMsS0FBSyxFQUFFLE1BQU0sRUFBRSxNQUFNO1FBQ2hGLE9BQU8sQ0FBQyxHQUFHLENBQUMsYUFBVyxNQUFRLENBQUMsQ0FBQztRQUNqQyxPQUFPLENBQUMsR0FBRyxDQUFDLGFBQVcsTUFBUSxDQUFDLENBQUM7UUFDakMsRUFBRSxDQUFDLENBQUMsS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUM7WUFDakIsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBZSxLQUFPLENBQUMsQ0FBQztRQUN4QyxDQUFDO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0lBQ3pDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUNmLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyIsImZpbGUiOiJ0cmFmZmljLm5naW54LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgcGF0aD1cIi4vdHlwaW5ncy9tYWluLmQudHNcIiAvPlxuaW1wb3J0IHBsdWdpbnMgPSByZXF1aXJlKFwiLi90cmFmZmljLnBsdWdpbnNcIik7XG5pbXBvcnQgcGF0aHMgPSByZXF1aXJlKFwiLi90cmFmZmljLnBhdGhzXCIpO1xuaW1wb3J0IFRyYWZmaWNPcHRpb25zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5vcHRpb25zXCIpO1xuXG5cblxubGV0IGRlbGV0ZU9sZENvbmZpZyA9IGZ1bmN0aW9uKGNvbnRhaW5lckRhdGFBcnJheUFyZyl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBwbHVnaW5zLnNoZWxsanMucm0oXCItclwiLFwiL2V0Yy9uZ2lueC9jb25mLmQvKlwiKTtcbiAgICBkb25lLnJlc29sdmUoY29udGFpbmVyRGF0YUFycmF5QXJnKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTtcblxubGV0IGNyZWF0ZU5ld0NvbmZpZyA9IGZ1bmN0aW9uKGNvbnRhaW5lckRhdGFBcnJheUFyZyl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICBsZXQgbmdpbnhUZW1wbGF0ZTpzdHJpbmcgPSBwbHVnaW5zLnNtYXJ0ZmlsZS5sb2NhbC50b1N0cmluZ1N5bmMocGF0aHMubmdpbnhUZW1wbGF0ZSk7XG4gICAgbGV0IHJlZ2V4Q29udGFpbmVyRG9tYWluTmFtZSA9IC97e2NvbnRhaW5lckRvbWFpbk5hbWV9fS9nXG4gICAgbGV0IHJlZ2V4Q29udGFpbmVySXAgPSAve3tjb250YWluZXJJcH19L2dcbiAgICBmb3IgKGxldCBjb250YWluZXJLZXkgaW4gY29udGFpbmVyRGF0YUFycmF5QXJnKXtcbiAgICAgICAgbGV0IGNvbnRhaW5lckRhdGEgPSBjb250YWluZXJEYXRhQXJyYXlBcmdbY29udGFpbmVyS2V5XTtcbiAgICAgICAgbGV0IG5naW54Q29uZmlnID0gbmdpbnhUZW1wbGF0ZVxuICAgICAgICAgICAgLnJlcGxhY2UocmVnZXhDb250YWluZXJEb21haW5OYW1lLGNvbnRhaW5lckRhdGEuZG9tYWluKVxuICAgICAgICAgICAgLnJlcGxhY2UocmVnZXhDb250YWluZXJJcCxjb250YWluZXJEYXRhLmlwKVxuICAgICAgICBwbHVnaW5zLnNtYXJ0ZmlsZS5tZW1vcnkudG9Gc1N5bmMobmdpbnhDb25maWcse2ZpbGVOYW1lOmNvbnRhaW5lckRhdGEuZG9tYWluICsgXCIuY29uZlwiLGZpbGVQYXRoOnBhdGhzLm5naW54Q29uZkRpcn0pO1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5vayhcImNyZWF0ZWQgbmdpbnggY29uZmlnIGZvciBcIiArIGNvbnRhaW5lckRhdGEuZG9tYWluKTtcbiAgICB9XG4gICAgZG9uZS5yZXNvbHZlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG5cbmV4cG9ydCBsZXQgZ2V0TmdpbnhDb25maWcgPSBmdW5jdGlvbihjb250YWluZXJEYXRhQXJyYXlBcmcpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgcGx1Z2lucy5iZWF1dHlsb2cubG9nKFwibm93IGNyZWF0aW5nIG5naW54IGNvbmZpZ1wiKTtcbiAgICBkZWxldGVPbGRDb25maWcoY29udGFpbmVyRGF0YUFycmF5QXJnKVxuICAgICAgICAudGhlbihjcmVhdGVOZXdDb25maWcpXG4gICAgICAgIC50aGVuKHJlU3RhcnROZ2lueClcbiAgICAgICAgLnRoZW4oZG9uZS5yZXNvbHZlKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufVxuXG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqKioqKioqKioqKiogTmdpbnggQ2hpbGQgUHJvY2VzcyAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5sZXQgbmdpbnhDaGlsZFByb2Nlc3MgPSB1bmRlZmluZWQ7XG5cbmxldCByZVN0YXJ0TmdpbnggPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgaWYodHlwZW9mIG5naW54Q2hpbGRQcm9jZXNzICE9IFwidW5kZWZpbmVkXCIpe1xuICAgICAgICBuZ2lueENoaWxkUHJvY2Vzcy5raWxsKCk7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLmluZm8oXCJraWxsZWQgTmdpbnghXCIpO1xuICAgIH1cbiAgICBuZ2lueENoaWxkUHJvY2VzcyA9IHBsdWdpbnMuY2hpbGRQcm9jZXNzLmV4ZWMoXCJuZ2lueFwiLGZ1bmN0aW9uKGVycm9yLCBzdGRvdXQsIHN0ZGVycil7XG4gICAgICAgIGNvbnNvbGUubG9nKGBzdGRvdXQ6ICR7c3Rkb3V0fWApO1xuICAgICAgICBjb25zb2xlLmxvZyhgc3RkZXJyOiAke3N0ZGVycn1gKTtcbiAgICAgICAgaWYgKGVycm9yICE9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgZXhlYyBlcnJvcjogJHtlcnJvcn1gKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHBsdWdpbnMuYmVhdXR5bG9nLmluZm8oXCJzdGFydGVkIE5naW54IVwiKTtcbiAgICBkb25lLnJlc29sdmUoKTtcbiAgICByZXR1cm4gZG9uZS5wcm9taXNlO1xufTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
