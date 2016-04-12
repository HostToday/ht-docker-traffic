/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");

export let setupSSL = function(){
    let done = plugins.q.defer();
    plugins.fs.ensureDirSync("/LE_CERTS");
    done.resolve();
    return done.promise;
};