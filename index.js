const path = require('path');
var localGit = {
    simplePull: function (workingDir, callback) {
        const git = require('simple-git')(workingDir);
        git.pull(function (err, update) {
            if (err) {
                console.error("Error in git pull:\r", err);
                return callback(err);
            }
            console.log("Git pull success:", update);
            callback(null, update);
        })
    },
    commitFile: function (filePath, message, options, callback) {
        var files = typeof filePath === 'string' ? [filePath] : filePath;
        if (callback === undefined && typeof options === 'function') {
            callback = options;
        }
        const basePath = path.basename(filePath)(basePath);
        const git = require('simple-git');
        git.commit(message, files, options, function (err, result) {
            console.log("Commit result:", err, result);
            if (!err) {
                if (result && result.commit) {
                    git(basePath).push();
                    callback ? callback(err, result) : null;
                }
                else {
                    callback ? callback(err, result) : null;
                }
            }
            else {
                callback ? callback(err, result) : null;
            }
        });
    },
    cloneRepo: function (repoPath, options, callback) {
        options = options || {};
        const url = repoPath.split('#')[0];
        const branchName = repoPath.split('#')[1] || null;
        const cloneTo = options.dest || __repos + (new Date().getTime());
        const git = require('simple-git')(cloneTo);
        const gitClone = require('git-clone');

        function onComplete(err) {
            err && console.log('onComplete err:', err);
            return callback && callback(err, cloneTo);
        }

        console.log('Cloning '+repoPath+' to '+cloneTo);
        gitClone(url, cloneTo, null, function (err) {
            if (!err) {
                console.log('git clone success!');
                if (branchName) {
                    //check if branch exists
                    return git.branch(function (err, branches) {
                        //if error in getting branch name, checkout anyway
                        if (err) return git.checkout(branchName, onComplete);
                        var existingBranch;
                        for (var i = 0; i < branches.all.length && !existingBranch; i++) {
                            if (branches.all[i].indexOf(branchName) >= 0) {
                                existingBranch = branches.all[i];
                            }
                        }
                        existingBranch && console.log('Found branch:', existingBranch);
                        if (!existingBranch) {
                            console.log("Brand was NOT found.");
                            return onComplete({
                                code: 'INVALID_BRANCH',
                                message: "The branch is not present in the branch list of this repository."
                            })
                        }
                        git.checkout(existingBranch, onComplete);
                    });
                }
            }
            onComplete(err);
        });
    }
};
module.exports = localGit;