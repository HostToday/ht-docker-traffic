/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import paths = require("./traffic.paths");
import TrafficOptions = require("./traffic.options");
import TrafficSsh = require("./traffic.ssh");

export let setupGit = function(){
    let done = plugins.q.defer();
    done.resolve();
};
plugins.shelljs.exec("git config --global user.email 'bot@lossless.com'");
plugins.shelljs.exec("git config --global user.name 'Lossless Bot'");