"use strict";
const plugins = require("./traffic.plugins");
const TrafficEnvironment = require("./traffic.environment");
exports.certOrigin = false; // when true, certificates are synced using git
exports.certLe = false; // when true, new certificates are obtained from Lets Encrypt
exports.cfUpdate = false; // when true, cloudflare is updated for containers on the same node
exports.sshKey = false;
exports.dockerSock = false;
exports.buildOptions = function () {
    let done = plugins.q.defer();
    plugins.beautylog.log("now building options...");
    exports.certOrigin = TrafficEnvironment.checkCertOriginSync();
    exports.certLe = TrafficEnvironment.checkCertLeSync();
    exports.cfUpdate = TrafficEnvironment.checkCfUpdateSync();
    exports.sshKey = TrafficEnvironment.checkSshKeySync();
    if (TrafficEnvironment.checkDockersock()) {
        exports.dockerSock = true;
    }
    else {
        plugins.beautylog.error("no access to docker.sock defeats the purpose of this container, we exit!");
        process.exit(1);
    }
    done.resolve();
    return done.promise;
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhZmZpYy5vcHRpb25zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vdHMvdHJhZmZpYy5vcHRpb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSxNQUFPLE9BQU8sV0FBVyxtQkFBbUIsQ0FBQyxDQUFDO0FBQzlDLE1BQU8sa0JBQWtCLFdBQVcsdUJBQXVCLENBQUMsQ0FBQztBQUVsRCxrQkFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLCtDQUErQztBQUNuRSxjQUFNLEdBQUcsS0FBSyxDQUFDLENBQUMsNkRBQTZEO0FBQzdFLGdCQUFRLEdBQUcsS0FBSyxDQUFDLENBQUMsbUVBQW1FO0FBQ3JGLGNBQU0sR0FBRyxLQUFLLENBQUM7QUFDZixrQkFBVSxHQUFHLEtBQUssQ0FBQztBQUNuQixvQkFBWSxHQUFHO0lBQ3RCLElBQUksSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUM7SUFDN0IsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMseUJBQXlCLENBQUMsQ0FBQztJQUNqRCxrQkFBVSxHQUFHLGtCQUFrQixDQUFDLG1CQUFtQixFQUFFLENBQUM7SUFDdEQsY0FBTSxHQUFHLGtCQUFrQixDQUFDLGVBQWUsRUFBRSxDQUFDO0lBQzlDLGdCQUFRLEdBQUcsa0JBQWtCLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNsRCxjQUFNLEdBQUcsa0JBQWtCLENBQUMsZUFBZSxFQUFFLENBQUM7SUFDOUMsRUFBRSxDQUFDLENBQUMsa0JBQWtCLENBQUMsZUFBZSxFQUFFLENBQUMsQ0FBQSxDQUFDO1FBQ3RDLGtCQUFVLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7SUFBQyxJQUFJLENBQUMsQ0FBQztRQUNKLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLDBFQUEwRSxDQUFDLENBQUM7UUFDcEcsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNwQixDQUFDO0lBQ0QsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2YsTUFBTSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7QUFDeEIsQ0FBQyxDQUFDIn0=