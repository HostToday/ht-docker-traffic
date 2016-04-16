/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficOptions = require("./traffic.options");



let deleteOldConfig = function(){
    
};

let createNewConfig = function(){
    
};

export let getNginxConfig = function(){
    let done = plugins.q.defer();
    plugins.beautylog.log("now creating nginx config");
    done.resolve();
    return done.promise;
}