"use strict";
/// <reference path="./typings/main.d.ts" />
var plugins = require("./traffic.plugins");
exports.setupGit = function () {
    var done = plugins.q.defer();
    done.resolve();
};
plugins.shelljs.exec("git config --global user.email 'bot@lossless.com'");
plugins.shelljs.exec("git config --global user.name 'Lossless Bot'");

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRyYWZmaWMuZ2l0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSw0Q0FBNEM7QUFDNUMsSUFBTyxPQUFPLFdBQVcsbUJBQW1CLENBQUMsQ0FBQztBQUtuQyxnQkFBUSxHQUFHO0lBQ2xCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ25CLENBQUMsQ0FBQztBQUNGLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLG1EQUFtRCxDQUFDLENBQUM7QUFDMUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsOENBQThDLENBQUMsQ0FBQyIsImZpbGUiOiJ0cmFmZmljLmdpdC5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuL3R5cGluZ3MvbWFpbi5kLnRzXCIgLz5cbmltcG9ydCBwbHVnaW5zID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wbHVnaW5zXCIpO1xuaW1wb3J0IHBhdGhzID0gcmVxdWlyZShcIi4vdHJhZmZpYy5wYXRoc1wiKTtcbmltcG9ydCBUcmFmZmljT3B0aW9ucyA9IHJlcXVpcmUoXCIuL3RyYWZmaWMub3B0aW9uc1wiKTtcbmltcG9ydCBUcmFmZmljU3NoID0gcmVxdWlyZShcIi4vdHJhZmZpYy5zc2hcIik7XG5cbmV4cG9ydCBsZXQgc2V0dXBHaXQgPSBmdW5jdGlvbigpe1xuICAgIGxldCBkb25lID0gcGx1Z2lucy5xLmRlZmVyKCk7XG4gICAgZG9uZS5yZXNvbHZlKCk7XG59O1xucGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJnaXQgY29uZmlnIC0tZ2xvYmFsIHVzZXIuZW1haWwgJ2JvdEBsb3NzbGVzcy5jb20nXCIpO1xucGx1Z2lucy5zaGVsbGpzLmV4ZWMoXCJnaXQgY29uZmlnIC0tZ2xvYmFsIHVzZXIubmFtZSAnTG9zc2xlc3MgQm90J1wiKTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=