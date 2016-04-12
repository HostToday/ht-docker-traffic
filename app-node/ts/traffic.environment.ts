/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");

export let checkDebug = function(){
    let done = plugins.q.defer();
    if(process.env.DEBUG === "true"){
        plugins.beautylog.log("Showing Debug Messages, because ENV: DEBUG === 'true'");
    };
    done.resolve();
    return done.promise;
};

export let checkSsl = function(){
    let done = plugins.q.defer();
    plugins.beautylog.log("now checking for SSLSYNC");
    if(process.env.SSLSYNC === "true"){
        plugins.beautylog.log("Allright, SSLSYNC is true");
    } else {
        plugins.beautylog.log("Allright, SSLSYNC is false");
    };
    done.resolve();
    return done.promise;
};

export let checkCloudflare = function(){
    let done = plugins.q.defer();
    if(process.env.CLOUDFLARE === "true"){
        plugins.beautylog.log("Allright, CLOUDFLARE is true");
    } else {
        plugins.beautylog.log("Allright, CLOUDFLARE is false");
    };
    done.resolve();
    return done.promise;
};


