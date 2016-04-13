/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficOptions = require("./traffic.options");

export let setupCertsFromOrigin = function(){
    plugins.shelljs.exec(
        "cd /LE_CERTS "
        + "&& git init && git remote add origin"
        + "&& git pull origin master"
    );
};

export let pullCertsFromOrigin = function(){

};

export let pushCertsToOrigin = function(){

}

export let getLeCerts = function(){

};

export let getMissingCertsFromLe = function(){

};

export let setupCerts = function(){
    let done = plugins.q.defer();
    if(TrafficOptions.certOrigin || TrafficOptions.certLe){
        plugins.fs.ensureDirSync("/LE_CERTS");

    }
    done.resolve();
    return done.promise;
};