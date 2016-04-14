/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import paths = require("./traffic.paths");
import TrafficOptions = require("./traffic.options");
import TrafficSsh = require("./traffic.ssh");

/**************************************************************
 ************ DATA STORAGE ************************************
 **************************************************************/

export let neededCerts = []; //all certs that are currently needed
export let availableCerts = []; //all certs that are currently available
export let missingCerts = []; //all certs that are currently missing 

/**************************************************************
 ************ SETUPS - RUN ON FIRST START *********************
 **************************************************************/

export let setupCertsFromOriginSync = function(){
    TrafficSsh.setupSshFromEnvSync(); //setting up SSH in case SSH is specified;
    plugins.beautylog.log("now getting certificates from certificate origin");
    plugins.shelljs.exec(
        "cd " + paths.certDir + " && git init && git remote add origin " + process.env.CERT_ORIGIN
    );
    pullCertsFromOriginSync();
};

export let setupCertsFromLe = function(){
    let done = plugins.q.defer();
    getNeededCerts()
        .then(getAvailableCerts)
        .then(getMissingCerts)
        .then(done.resolve);
    return done.promise;
};

export let setupCerts = function(){
    let done = plugins.q.defer();
    if(TrafficOptions.certOrigin || TrafficOptions.certLe){
        plugins.fs.ensureDirSync(paths.certDir);
        if(TrafficOptions.certOrigin) setupCertsFromOriginSync();
        if(TrafficOptions.certLe) {
            setupCertsFromLe()
                .then(function(){
                    if(TrafficOptions.certOrigin) pushCertsToOriginSync();
                    done.resolve();
                });
        } else {
            done.resolve();
        };
    } else {
        done.resolve();
    }
    return done.promise;
};

/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
export let pullCertsFromOriginSync = function(){
    plugins.shelljs.exec("cd " + paths.certDir + " && git pull origin master");
};

export let pushCertsToOriginSync = function(){
    plugins.beautylog.log("now syncing certs back to source ");
    plugins.shelljs.exec(
        "cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS' && git push origin master"
    );
};

export let getLeCertSync = function(domainArg:string){
    plugins.beautylog.log("now getting certs from Lets Encrypt");
    plugins.shelljs.exec("cd /app-ssl/ && ./letsencrypt.sh -c -d " + domainArg + " -t dns-01 -k './hooks/cloudflare/hook.py'");
};

export let checkCertificate = function(){
    
};

export let getNeededCerts = function(){
    let done = plugins.q.defer();

    done.resolve();
    return done.promise;
};

export let getAvailableCerts = function(){
    let done = plugins.q.defer();
    plugins.smartfile.get.folders(paths.certDir)
        .then(function(foldersArrayArg){
            neededCerts = foldersArrayArg;
            done.resolve(neededCerts);
        });
    
    return done.promise;
};

export let getMissingCerts = function(){
    let done = plugins.q.defer();
    done.resolve();
    return done.promise;
};