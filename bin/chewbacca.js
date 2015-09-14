#!/usr/bin/env node

var childProcess = require('child_process');
var async = require('async');
var passError = require('passerror');
var argv = require('minimist')(process.argv.slice(2), {
    '--': true
});
var results = [];

function usage() {
    console.log('Usage:');
    console.log('');
    console.log('Compare a ref againt the working dir:');
    console.log('chewbacca <git ref before>');
    console.log('Compare two ref againt each other:');
    console.log('chewbacca <git ref before> <git ref after>');
    console.log('All arguments after -- will be forwarded to mocha');
    console.log('');
    process.exit(0);
}

if (argv._.length === 0 || argv._length > 2) {
    usage();
}

var mochaArgs = argv['--'].join(' ');
var refs = argv._.slice(0, 2);
if (refs.length === 1) {
    refs.unshift('working dir');
}

function exec(commandLine, quiet, cb) {
    if (typeof quiet === 'function') {
        cb = quiet;
        quiet = false;
    }
    console.log(commandLine);
    childProcess.exec(commandLine, function (err, stdout, stderr) {
        if (stderr.length > 0 && !quiet) {
            console.log(stderr.toString('utf-8'));
        }
        cb(err, stdout, stderr);
    });
}

var dirtyWorkingTree = false;
exec('git diff-index --quiet HEAD', function (err, stdout, stderr) {
    if (err) {
        if (err.code > 0) {
            dirtyWorkingTree = true;
        } else {
            throw err;
        }
    }
    exec('git rev-parse --abbrev-ref HEAD', function (err, stdout, stderr) {
        if (err) {
            throw err;
        }
        var originalRef = stdout.toString('utf-8').replace(/\n/, '');
        async.eachLimit(refs, 1, function (ref, cb) {
            if (ref === 'working dir') {
                proceedToRunBenchmark();
            } else {
                if (dirtyWorkingTree) {
                    exec('git stash', passError(cb, function () {
                        exec('git checkout ' + ref.replace(/^HEAD/, originalRef), true, passError(cb, proceedToRunBenchmark));
                    }));
                } else {
                    exec('git checkout ' + ref.replace(/^HEAD/, originalRef), true, passError(cb, proceedToRunBenchmark));
                }
            }
            function proceedToRunBenchmark() {
                exec('./node_modules/.bin/mocha ' +
                     '--no-timeouts ' +
                     '--ui chewbacca/mocha-benchmark-ui ' +
                     '--reporter chewbacca/mocha-benchmark-reporter ' +
                     mochaArgs, passError(cb, function (stdout, stderr) {
                    var result = JSON.parse(stdout.toString('utf-8'));
                    result.ref = ref;
                    results.push(result);
                    cb();
                }));
            }
        }, function (err) {
            if (err) {
                throw err;
            }
            var numValidResults = 0;
            var sumRatios = 0;
            console.log(results.map(function (result) {
                return result.ref;
            }).join(' vs. '));
            results[0].passes.forEach(function (result, i) {
                var otherResult = results[1].passes[i];
                if (otherResult.fullTitle === result.fullTitle) {
                    var difference = result.metadata.operationsPrSecond - otherResult.metadata.operationsPrSecond;
                    var ratio = difference / otherResult.metadata.operationsPrSecond;
                    numValidResults += 1;
                    sumRatios += ratio;
                    console.log(result.fullTitle,
                                Math.round(result.metadata.operationsPrSecond),
                                '/',
                                Math.round(otherResult.metadata.operationsPrSecond),
                                (100 * Math.abs(ratio)).toFixed(2) + '%',
                                ratio < 0 ? 'slower' : 'faster'
                               );
                }
            });
            var avg = sumRatios / numValidResults;
            console.log(results[0].ref,
                        'is',
                        (100 * Math.abs(avg)).toFixed(2) + '%',
                        avg < 0 ? 'slower' : 'faster',
                        'than',
                        results[1].ref,
                        ((avg <= 0) ? results[0].ref : results[1].ref),
                        'on average');
            exec('git checkout ' + originalRef, true, function (err) {
                function onFinish() {
                    if (typeof argv.threshold === 'number' && argv.threshold <= -avg * 100) {
                        console.log('Performance regression higher than threshold');
                        process.exit(1);
                    }
                }
                if (err) {
                    throw err;
                }
                if (dirtyWorkingTree) {
                    exec('git stash pop', function (err) {
                        if (err) {
                            throw err;
                        }
                        onFinish();
                    });
                } else {
                    onFinish();
                }
            });
        });
    });
});
