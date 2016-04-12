/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");

export let get = function(){
    var done = plugins.q.defer();
    plugins.request.get('http://unix:/var/run/docker.sock:/containers/json')
        .on("data",function(data){
            let dataString = data.toString("utf8");
            let dataObject = JSON.parse(dataString);
            done.resolve(dataObject);
        });
    return done.promise;
};

let tickerObs = plugins.rx.Observable
    .interval(5000).repeat();

export let tickerSub;
export let noTicker = false;
export let startTicker = function(){
    tickerSub = tickerObs.subscribe(
        function (x) {
            console.log('Next: ' + x);
        },
        function (err) {
            console.log('Error: ' + err);
        },
        function () {
            console.log('Completed');
        }
    );
    console.log("subscribed ticker");
    if (noTicker) tickerSub.dispose();
    return tickerSub;
};


export let getChange = function(){

};
export let containerChange = plugins.rx.Observable.create(function(observer){
    
});