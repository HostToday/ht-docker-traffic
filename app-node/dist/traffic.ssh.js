"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.setupSshFromEnvSync = function () {
    if (process.env.CERT_ORIGIN_SSH) {
        plugins.beautylog.ok("found SSH Key for CERT_ORIGIN. Setting it up now...");
        plugins.fs.ensureDirSync("/root/.ssh");
        plugins.shelljs.exec("echo $CERT_ORIGIN_SSH > /root/.ssh/id_rsa64");
        plugins.shelljs.exec("openssl base64 -d -A -in /root/.ssh/id_rsa64 -out /root/.ssh/id_rsa");
        plugins.shelljs.exec("chmod 400 /root/.ssh/id_rsa");
    }
    else {
        plugins.beautylog.warn("Did not find SSH Key for CERT_ORIGIN.");
    }
};

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWZmaWMuc3NoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0Q0FBNEM7QUFDNUMsSUFBTyxPQUFPLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztBQUVuQywyQkFBbUIsR0FBRztJQUM3QixFQUFFLENBQUEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQyxDQUFBLENBQUM7UUFDNUIsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMscURBQXFELENBQUMsQ0FBQztRQUM1RSxPQUFPLENBQUMsRUFBRSxDQUFDLGFBQWEsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUN2QyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyw2Q0FBNkMsQ0FBQyxDQUFDO1FBQ3BFLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLHFFQUFxRSxDQUFDLENBQUM7UUFDNUYsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsNkJBQTZCLENBQUMsQ0FBQztJQUN4RCxDQUFDO0lBQUMsSUFBSSxDQUFDLENBQUM7UUFDSixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO0lBQ3BFLENBQUM7QUFDTCxDQUFDLENBQUMiLCJmaWxlIjoidHJhZmZpYy5zc2guanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLy8gPHJlZmVyZW5jZSBwYXRoPVwiLi90eXBpbmdzL21haW4uZC50c1wiIC8+XG5pbXBvcnQgcGx1Z2lucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMucGx1Z2luc1wiKTtcblxuZXhwb3J0IGxldCBzZXR1cFNzaEZyb21FbnZTeW5jID0gZnVuY3Rpb24oKXtcbiAgICBpZihwcm9jZXNzLmVudi5DRVJUX09SSUdJTl9TU0gpe1xuICAgICAgICBwbHVnaW5zLmJlYXV0eWxvZy5vayhcImZvdW5kIFNTSCBLZXkgZm9yIENFUlRfT1JJR0lOLiBTZXR0aW5nIGl0IHVwIG5vdy4uLlwiKTtcbiAgICAgICAgcGx1Z2lucy5mcy5lbnN1cmVEaXJTeW5jKFwiL3Jvb3QvLnNzaFwiKTtcbiAgICAgICAgcGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJlY2hvICRDRVJUX09SSUdJTl9TU0ggPiAvcm9vdC8uc3NoL2lkX3JzYTY0XCIpO1xuICAgICAgICBwbHVnaW5zLnNoZWxsanMuZXhlYyhcIm9wZW5zc2wgYmFzZTY0IC1kIC1BIC1pbiAvcm9vdC8uc3NoL2lkX3JzYTY0IC1vdXQgL3Jvb3QvLnNzaC9pZF9yc2FcIik7XG4gICAgICAgIHBsdWdpbnMuc2hlbGxqcy5leGVjKFwiY2htb2QgNDAwIC9yb290Ly5zc2gvaWRfcnNhXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHBsdWdpbnMuYmVhdXR5bG9nLndhcm4oXCJEaWQgbm90IGZpbmQgU1NIIEtleSBmb3IgQ0VSVF9PUklHSU4uXCIpO1xuICAgIH1cbn07Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
