/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficEnvironment = require("./traffic.environment");

export let getContainerData = function(){
    var done = plugins.q.defer();
    plugins.request.get("http://unix:/var/run/docker.sock:/containers/json")
        .on("data",function(data){
            let dataString = data.toString("utf8");
            let dataObject = JSON.parse(dataString);
            let detailedDataObject = [];
            let recursiveCounter = 0;
            let makeDetailed = function(){
                if(typeof dataObject[recursiveCounter] != "undefined"){
                    plugins.request.get("http://unix:/var/run/docker.sock:/containers/"
                            + dataObject[recursiveCounter].Id
                            +"/json")
                        .on("data",function(){
                            recursiveCounter++;
                            let dataString = data.toString("utf8");
                            let dataObject = JSON.parse(dataString);
                            detailedDataObject.push(dataObject);
                            makeDetailed();
                        });
                } else {
                    done.resolve(detailedDataObject);
                }
            };
            makeDetailed();
        });
    return done.promise;
};