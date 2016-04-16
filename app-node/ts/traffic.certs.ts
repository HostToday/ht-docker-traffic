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

let setupCertsFromOriginSync = function(){
    TrafficSsh.setupSshFromEnvSync(); //setting up SSH in case SSH is specified;
    plugins.beautylog.log("now getting certificates from certificate origin");
    plugins.shelljs.exec(
        "cd " + paths.certDir + " && git init && git remote add origin " + process.env.CERT_ORIGIN
    );
    pullCertsFromOriginSync();
};

export let setupCerts = function(){
    let done = plugins.q.defer();
    if(TrafficOptions.certOrigin){
        plugins.fs.ensureDirSync(paths.certDir);
        if(TrafficOptions.certOrigin) setupCertsFromOriginSync();
        done.resolve();
    } else {
        done.resolve();
    }
    return done.promise;
};

/**************************************************************
 ************ Routines - RUN DURING CONTAINER LIFETIME ********
 **************************************************************/
let pullCertsFromOriginSync = function(){
    plugins.shelljs.exec("cd " + paths.certDir + " && git pull origin master");
};

let pushCertsToOriginSync = function(){
    plugins.beautylog.log("now syncing certs back to source ");
    plugins.shelljs.exec(
        "cd " + paths.certDir + " && git add -A && git commit -m 'UPDATE CERTS' && git push origin master"
    );
};

let getLeCertSync = function(domainStringArg:string){
    plugins.beautylog.log("now getting certs from Lets Encrypt");
    let resultPath = plugins.path.join(paths.appSslDir,"certs/",domainStringArg);
    plugins.shelljs.exec("cd /app-ssl/ && ./letsencrypt.sh -c -d " + domainStringArg + " -t dns-01 -k './hooks/cloudflare/hook.py'");
    plugins.shelljs.cp("-r",resultPath,paths.certDir);
    plugins.shelljs.rm('-rf', resultPath);
};

let checkCertificate = function(){
    
};

/**************************************************************
 ************ Main exports ************************************
 **************************************************************/

export let getCerts = function(receivingContainersArrayArg:any[]){
    let done = plugins.q.defer();
    getNeededCerts(receivingContainersArrayArg)
        .then(getAvailableCerts)
        .then(getMissingCerts)
        .then(done.resolve);
    return done.promise;
};


let getNeededCerts = function(receivingContainersArrayArg:any[]){
    let done = plugins.q.defer();
    let neededCertsLocal = [];
    for(let containerKey in receivingContainersArrayArg){
        neededCertsLocal.push(receivingContainersArrayArg[containerKey].domain);
    }
    neededCerts = neededCertsLocal;
    plugins.beautylog.log("We need the following certificates:");
    console.log(neededCertsLocal);
    done.resolve(neededCertsLocal);
    return done.promise;
};

let getAvailableCerts = function(neededCertsArg:string[]){
    let done = plugins.q.defer();
    plugins.smartfile.get.folders(paths.certDir)
        .then(function(foldersArrayArg){
            availableCerts = foldersArrayArg.filter(function(folderString:string){
                return folderString != ".git" //make sure that the .git directory is not listed as domain
            });
            plugins.beautylog.log("The following certs are available:");
            console.log(availableCerts);
            missingCerts = plugins.lodash.difference(neededCertsArg,availableCerts);
            plugins.beautylog.log("The following certs missing:");
            console.log(missingCerts);
            done.resolve(missingCerts);
        });
    
    return done.promise;
};

let getMissingCerts = function(missingCertsArg:string[]){
    let done = plugins.q.defer();
    for(let domainStringKey in missingCertsArg){
        getLeCertSync(missingCertsArg[domainStringKey]);
    };
    done.resolve();
    return done.promise;
};