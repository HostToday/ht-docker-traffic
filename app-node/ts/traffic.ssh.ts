/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficOptions = require("./traffic.options");

export let setupSshFromEnv = function(){
    let done = plugins.q.defer();
    if(TrafficOptions.sshKey){
        plugins.beautylog.ok("found SSH Key for CERT_ORIGIN. Setting it up now...");
        plugins.fs.ensureDirSync("/root/.ssh");
        plugins.shelljs.exec("echo $CERT_ORIGIN_SSH > /root/.ssh/id_rsa64");
        plugins.shelljs.exec("openssl base64 -d -A -in /root/.ssh/id_rsa64 -out /root/.ssh/id_rsa");
        plugins.shelljs.exec("chmod 400 /root/.ssh/id_rsa");
    } else {
        plugins.beautylog.warn("Did not find SSH Key for CERT_ORIGIN.");
    }
    done.resolve();
    return done.promise;
};