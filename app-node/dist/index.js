"use strict";
/// <reference path="./typings/main.d.ts" />
console.log("**** Starting ht-docker-traffic ****");
var plugins = require("./traffic.plugins");
var TrafficCerts = require("./traffic.certs");
var TrafficEnvironment = require("./traffic.environment");
var TrafficEvents = require("./traffic.events");
var TrafficGit = require("./traffic.git");
var TrafficOptions = require("./traffic.options");
var TrafficSsh = require("./traffic.ssh");
/**************************************************************
 ************ Initial Start ********
 **************************************************************/
plugins.beautylog.log("Modules loaded! Now running initial checks");
TrafficEnvironment.checkDebug()
    .then(TrafficOptions.buildOptions)
    .then(TrafficSsh.setupSshFromEnv)
    .then(TrafficGit.setupGit)
    .then(TrafficCerts.setupCerts)
    .then(TrafficEvents.startTicker);
//prevent Ticker from executing indefinitely for tests
exports.noTicker = function () {
    TrafficEvents.noTicker = true;
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0Q0FBNEM7QUFDNUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQ0FBc0MsQ0FBQyxDQUFDO0FBQ3BELElBQU8sT0FBTyxXQUFXLG1CQUFtQixDQUFDLENBQUM7QUFHOUMsSUFBTyxZQUFZLFdBQVcsaUJBQWlCLENBQUMsQ0FBQztBQUVqRCxJQUFPLGtCQUFrQixXQUFXLHVCQUF1QixDQUFDLENBQUM7QUFDN0QsSUFBTyxhQUFhLFdBQVcsa0JBQWtCLENBQUMsQ0FBQztBQUNuRCxJQUFPLFVBQVUsV0FBVyxlQUFlLENBQUMsQ0FBQztBQUM3QyxJQUFPLGNBQWMsV0FBVyxtQkFBbUIsQ0FBQyxDQUFDO0FBRXJELElBQU8sVUFBVSxXQUFXLGVBQWUsQ0FBQyxDQUFDO0FBRzdDOztnRUFFZ0U7QUFDaEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsNENBQTRDLENBQUMsQ0FBQztBQUNwRSxrQkFBa0IsQ0FBQyxVQUFVLEVBQUU7S0FDMUIsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7S0FDakMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxlQUFlLENBQUM7S0FDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUM7S0FDekIsSUFBSSxDQUFDLFlBQVksQ0FBQyxVQUFVLENBQUM7S0FDN0IsSUFBSSxDQUFDLGFBQWEsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUVyQyxzREFBc0Q7QUFDM0MsZ0JBQVEsR0FBRztJQUNsQixhQUFhLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUNsQyxDQUFDLENBQUMiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBpbmdzL21haW4uZC50c1wiIC8+XG5jb25zb2xlLmxvZyhcIioqKiogU3RhcnRpbmcgaHQtZG9ja2VyLXRyYWZmaWMgKioqKlwiKTtcbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IHBhdGhzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wYXRoc1wiKTtcblxuaW1wb3J0IFRyYWZmaWNDZXJ0cyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuY2VydHNcIik7XG5pbXBvcnQgVHJhZmZpY0RvY2tlcnNvY2sgPSByZXF1aXJlKFwiLi90cmFmZmljLmRvY2tlcnNvY2tcIik7XG5pbXBvcnQgVHJhZmZpY0Vudmlyb25tZW50ID0gcmVxdWlyZShcIi4vdHJhZmZpYy5lbnZpcm9ubWVudFwiKTtcbmltcG9ydCBUcmFmZmljRXZlbnRzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5ldmVudHNcIik7XG5pbXBvcnQgVHJhZmZpY0dpdCA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuZ2l0XCIpO1xuaW1wb3J0IFRyYWZmaWNPcHRpb25zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5vcHRpb25zXCIpO1xuaW1wb3J0IFRyYWZmaWNOZ2lueCA9IHJlcXVpcmUoXCIuL3RyYWZmaWMubmdpbnhcIik7XG5pbXBvcnQgVHJhZmZpY1NzaCA9IHJlcXVpcmUoXCIuL3RyYWZmaWMuc3NoXCIpO1xuXG5cbi8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuICoqKioqKioqKioqKiBJbml0aWFsIFN0YXJ0ICoqKioqKioqXG4gKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5wbHVnaW5zLmJlYXV0eWxvZy5sb2coXCJNb2R1bGVzIGxvYWRlZCEgTm93IHJ1bm5pbmcgaW5pdGlhbCBjaGVja3NcIik7XG5UcmFmZmljRW52aXJvbm1lbnQuY2hlY2tEZWJ1ZygpXG4gICAgLnRoZW4oVHJhZmZpY09wdGlvbnMuYnVpbGRPcHRpb25zKVxuICAgIC50aGVuKFRyYWZmaWNTc2guc2V0dXBTc2hGcm9tRW52KVxuICAgIC50aGVuKFRyYWZmaWNHaXQuc2V0dXBHaXQpXG4gICAgLnRoZW4oVHJhZmZpY0NlcnRzLnNldHVwQ2VydHMpXG4gICAgLnRoZW4oVHJhZmZpY0V2ZW50cy5zdGFydFRpY2tlcik7XG5cbi8vcHJldmVudCBUaWNrZXIgZnJvbSBleGVjdXRpbmcgaW5kZWZpbml0ZWx5IGZvciB0ZXN0c1xuZXhwb3J0IGxldCBub1RpY2tlciA9IGZ1bmN0aW9uKCl7XG4gICAgVHJhZmZpY0V2ZW50cy5ub1RpY2tlciA9IHRydWU7XG59OyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
