/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficEvents = require("./traffic.events");
import TrafficDockersock = require("./traffic.dockersock");
import TrafficCerts = require("./traffic.certs");
import TrafficNginx = require("./traffic.nginx");

/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/

export let relevantContainersBefore = []; // containers at the last check cycle
export let relevantContainers = []; // all certs that are currently missing
export let receivingContainers = []; // containers that receive traffic

/**************************************************************
 ************ SETUPS - RUN ON FIRST START *********************
 **************************************************************/

export let checkDebug = function(){
    let done = plugins.q.defer();
    if(process.env.DEBUG === "true"){
        plugins.beautylog.log("Showing Debug Messages, because ENV: DEBUG === 'true'");
        plugins.beautylog.log("checking shell tools:");
        plugins.beautylog.info("python available: " + plugins.shelljs.which("python"));
        plugins.beautylog.info("openssl available: " + plugins.shelljs.which("openssl"));
        plugins.beautylog.info("git available: " + plugins.shelljs.which("git"));
        done.resolve(true);
    } else {
        done.resolve(false);
    };
    return done.promise;
};

export let checkDockersock = function(){
    try {
        plugins.smartfile.checks.fileExistsSync("/var/run/docker.sock");
        plugins.beautylog.log("great, docker.sock is available!");
        return true;
    }
    catch(err){
        plugins.beautylog.warn("docker.sock is unavailable.");
        return false;
    }
};

export let checkSshKeySync = function(){
    if(process.env.CERT_ORIGIN_SSH){
        return true
    } else {
        return false;
    }
};

export let checkCertOriginSync = function(){
    if(process.env.CERT_ORIGIN){
        plugins.beautylog.ok("Allright, CERT_UPDATE is set");
        return true;
    } else {
        plugins.beautylog.warn("CERT_UPDATE is not set! You are not in a Cluster?");
        return false;
    };
};

export let checkCertLeSync = function(){
    if(process.env.CERT_LE){
        plugins.beautylog.ok("Allright, CERT_LE is set");
        return true;
    } else {
        plugins.beautylog.warn("CERT_LE is not set! You are not in a Cluster?");
        return false;
    };
};



export let checkCfUpdateSync = function(){
    let cfSync:boolean;
    if(process.env.CF_UPDATE === "true"){
        plugins.beautylog.ok("Allright, CF_UPDATE is true. Now checking for credentials.");
        if(process.env.CF_EMAIL && process.env.CF_KEY){
            plugins.beautylog.ok("Found Cloudflare Credentials");
            cfSync = true;
        } else {
            plugins.beautylog.error("Bummer! Cloudflare Credentials are missing!");
            cfSync = false;
        }
    } else {
        plugins.beautylog.warn("CF_UPDATE is false! You are not in a Cluster?");
        cfSync = false;
    };
    return cfSync;
};

/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
let containerChangeNotify;

export let handleContainerChange = function(){
    let done = plugins.q.defer();
    TrafficDockersock.getContainerData("detailed")
        .then(function(containerDataArg:any[]){
            let detailedContainerData = containerDataArg
                .map(function(containerObject){
                    return {
                        "id":containerObject.Id,
                        "domain":plugins.smartstring.docker.makeEnvObject(containerObject.Config.Env).VIRTUAL_HOST,
                        "ip":containerObject.NetworkSettings.Networks.bridge.IPAddress
                    }
                });
            let receivingContainersLocal = detailedContainerData.filter(function(containerObjectArg){
                return containerObjectArg.domain ? true : false;
            });
            receivingContainers = receivingContainersLocal;
            console.log(detailedContainerData);
            TrafficCerts.getCerts(receivingContainersLocal)
                .then(function(){TrafficNginx.getNginxConfig(receivingContainersLocal)})
                .then(done.resolve);
        });
    return done.promise;
};

export let detectContainerChange = function(){
    console.log("checking for container change");
    TrafficDockersock.getContainerData("overview")
        .then(function(containerDataArg:any[]){
            relevantContainers = containerDataArg.map(function(containerObjectArg){
                return {
                    "Id":containerObjectArg.Id,
                    "Created":containerObjectArg.Created
                };
            });
            if(plugins.lodash.isEqual(relevantContainers,relevantContainersBefore)){
                relevantContainersBefore = relevantContainers;
                console.log("no change");
            } else {
                console.log("change detected");
                TrafficEvents.stopTicker();
                handleContainerChange()
                    .then(function(){
                        relevantContainersBefore = relevantContainers;
                        TrafficEvents.startTicker();
                    });

            };
        });
};