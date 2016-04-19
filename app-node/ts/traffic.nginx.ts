/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import paths = require("./traffic.paths");
import TrafficOptions = require("./traffic.options");



let deleteOldConfig = function(containerDataArrayArg){
    let done = plugins.q.defer();
    plugins.shelljs.rm("-r","/etc/nginx/conf.d/*");
    done.resolve(containerDataArrayArg);
    return done.promise;
};

let createNewConfig = function(containerDataArrayArg){
    let done = plugins.q.defer();
    let nginxTemplate:string = plugins.smartfile.local.toStringSync(paths.nginxTemplate);
    let regexContainerDomainName = /{{containerDomainName}}/g
    let regexContainerIp = /{{containerIp}}/g
    for (let containerKey in containerDataArrayArg){
        let containerData = containerDataArrayArg[containerKey];
        let nginxConfig = nginxTemplate
            .replace(regexContainerDomainName,containerData.domain)
            .replace(regexContainerIp,containerData.ip)
        plugins.smartfile.memory.toFsSync(nginxConfig,{fileName:containerData.domain + ".conf",filePath:paths.nginxConfDir});
        plugins.beautylog.ok("created nginx config for " + containerData.domain);
    }
    done.resolve();
    return done.promise;
};

export let getNginxConfig = function(containerDataArrayArg){
    let done = plugins.q.defer();
    plugins.beautylog.log("now creating nginx config");
    deleteOldConfig(containerDataArrayArg)
        .then(createNewConfig)
        .then(reStartNginx)
        .then(done.resolve);
    return done.promise;
}

/**************************************************************
 ************ Nginx Child Process *****************************
 **************************************************************/

let nginxChildProcess = undefined;

let reStartNginx = function(){
    let done = plugins.q.defer();
    if(typeof nginxChildProcess != "undefined"){
        nginxChildProcess.kill();
        plugins.beautylog.info("killed Nginx!");
    }
    nginxChildProcess = plugins.childProcess.exec("nginx",function(error, stdout, stderr){
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        if (error !== null) {
            console.log(`exec error: ${error}`);
        }
    });
    plugins.beautylog.info("started Nginx!");
    done.resolve();
    return done.promise;
};