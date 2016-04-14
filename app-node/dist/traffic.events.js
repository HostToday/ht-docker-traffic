"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
var TrafficEnvironment = require("./traffic.environment");
var TrafficDockersock = require("./traffic.dockersock");
var tickerObs = plugins.rx.Observable
    .interval(5000).repeat();
exports.noTicker = false;
exports.startTicker = function () {
    var done = plugins.q.defer();
    exports.tickerSub = tickerObs.subscribe(function (x) {
        console.log('TickerCycle#: ' + x);
        TrafficDockersock.getContainerData()
            .then(function (containerDataArg) {
            TrafficEnvironment.detectContainerChange(containerDataArg);
        });
    }, function (err) {
        console.log('Error: ' + err);
    }, function () {
        console.log('Completed');
    });
    console.log("subscribed ticker");
    if (exports.noTicker)
        exports.tickerSub.dispose();
    return done.promise;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWZmaWMuZXZlbnRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0Q0FBNEM7QUFDNUMsSUFBTyxPQUFPLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztBQUM5QyxJQUFPLGtCQUFrQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDN0QsSUFBTyxpQkFBaUIsV0FBVyxzQkFBc0IsQ0FBQyxDQUFDO0FBRTNELElBQUksU0FBUyxHQUFHLE9BQU8sQ0FBQyxFQUFFLENBQUMsVUFBVTtLQUNoQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUM7QUFHbEIsZ0JBQVEsR0FBRyxLQUFLLENBQUM7QUFDakIsbUJBQVcsR0FBRztJQUNyQixJQUFJLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQzdCLGlCQUFTLEdBQUcsU0FBUyxDQUFDLFNBQVMsQ0FDM0IsVUFBVSxDQUFDO1FBQ1AsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNsQyxpQkFBaUIsQ0FBQyxnQkFBZ0IsRUFBRTthQUMvQixJQUFJLENBQUMsVUFBUyxnQkFBZ0I7WUFDM0Isa0JBQWtCLENBQUMscUJBQXFCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztRQUMvRCxDQUFDLENBQUMsQ0FBQztJQUNYLENBQUMsRUFDRCxVQUFVLEdBQUc7UUFDVCxPQUFPLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxHQUFHLENBQUMsQ0FBQztJQUNqQyxDQUFDLEVBQ0Q7UUFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQzdCLENBQUMsQ0FDSixDQUFDO0lBQ0YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO0lBQ2pDLEVBQUUsQ0FBQyxDQUFDLGdCQUFRLENBQUM7UUFBQyxpQkFBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2xDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO0FBQ3hCLENBQUMsQ0FBQyIsImZpbGUiOiJ0cmFmZmljLmV2ZW50cy5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IFRyYWZmaWNFbnZpcm9ubWVudCA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuZW52aXJvbm1lbnRcIik7XG5pbXBvcnQgVHJhZmZpY0RvY2tlcnNvY2sgPSByZXF1aXJlKFwiLi90cmFmZmljLmRvY2tlcnNvY2tcIik7XG5cbmxldCB0aWNrZXJPYnMgPSBwbHVnaW5zLnJ4Lk9ic2VydmFibGVcbiAgICAuaW50ZXJ2YWwoNTAwMCkucmVwZWF0KCk7XG5cbmV4cG9ydCBsZXQgdGlja2VyU3ViO1xuZXhwb3J0IGxldCBub1RpY2tlciA9IGZhbHNlO1xuZXhwb3J0IGxldCBzdGFydFRpY2tlciA9IGZ1bmN0aW9uKCl7XG4gICAgbGV0IGRvbmUgPSBwbHVnaW5zLnEuZGVmZXIoKTtcbiAgICB0aWNrZXJTdWIgPSB0aWNrZXJPYnMuc3Vic2NyaWJlKFxuICAgICAgICBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ1RpY2tlckN5Y2xlIzogJyArIHgpO1xuICAgICAgICAgICAgVHJhZmZpY0RvY2tlcnNvY2suZ2V0Q29udGFpbmVyRGF0YSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oY29udGFpbmVyRGF0YUFyZyl7XG4gICAgICAgICAgICAgICAgICAgIFRyYWZmaWNFbnZpcm9ubWVudC5kZXRlY3RDb250YWluZXJDaGFuZ2UoY29udGFpbmVyRGF0YUFyZyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdFcnJvcjogJyArIGVycik7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdDb21wbGV0ZWQnKTtcbiAgICAgICAgfVxuICAgICk7XG4gICAgY29uc29sZS5sb2coXCJzdWJzY3JpYmVkIHRpY2tlclwiKTtcbiAgICBpZiAobm9UaWNrZXIpIHRpY2tlclN1Yi5kaXNwb3NlKCk7XG4gICAgcmV0dXJuIGRvbmUucHJvbWlzZTtcbn07XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
