/// <reference path="./typings/main.d.ts" />
import plugins = require("./traffic.plugins");
import TrafficOptions = require("./traffic.options");

// Directories
export let certDir = "/LE_CERTS";
export let appSslDir = "/app-ssl";
export let nginxConfDir = "/etc/nginx/conf.d/";

//Files
export let nginxTemplate = "/app-nginx/nginx.template";