#!/usr/bin/env node

var Promise = require('bluebird');
var promisifiedExec = Promise.promisify(require('child_process').exec);
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

var avg;

function exec(commandLine, quiet) {
    if (typeof quiet === 'function') {
        cb = quiet;
        quiet = false;
    }
    console.log(commandLine);
    return promisifiedExec(commandLine).spread(function (stdout, stderr) {
        if (stderr.length > 0 && !quiet) {
            console.log(stderr.toString('utf-8'));
        }
        return [stdout, stderr];
    });
}

var dirtyWorkingTree = false;
var originalSha;
var originalRef;

function benchmarkRef(ref) {
    return Promise.resolve().then(function () {
        if (ref !== 'working dir') {
            if (dirtyWorkingTree) {
                return exec('git stash').then(function () {
                    return exec('git checkout ' + ref.replace(/^HEAD/, originalSha));
                });
            } else {
                return exec('git checkout ' + ref.replace(/^HEAD/, originalSha), true);
            }
        }
    }).then(function () {
        return exec('./node_modules/.bin/mocha ' +
                    '--no-timeouts ' +
                    '--ui chewbacca/mocha-benchmark-ui ' +
                    '--reporter chewbacca/mocha-benchmark-reporter ' +
                    mochaArgs);
    }).delay(2000).then(function () {
        return exec('./node_modules/.bin/mocha ' +
                    '--no-timeouts ' +
                    '--ui chewbacca/mocha-benchmark-ui ' +
                    '--reporter chewbacca/mocha-benchmark-reporter ' +
                    mochaArgs);
    }).spread(function (stdout) {
        var result = JSON.parse(stdout.toString('utf-8'));
        result.ref = ref;
        return result;
    });
}

exec('git diff-index --quiet HEAD').caught(function (err) {
    if (err.code > 0) {
        dirtyWorkingTree = true;
    } else {
        throw err;
    }
}).then(function () {
    return exec('git rev-parse --abbrev-ref HEAD');
}).spread(function (stdout) {
    originalRef = stdout.toString('utf-8').replace(/\n/, '');
    return exec('git rev-parse HEAD');
}).spread(function (stdout) {
    originalSha = stdout.toString('utf-8').replace(/\n/, '');
    return refs;
}).map(benchmarkRef, { concurrency: 1 }).then(function (results) {
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
                        Math.round(otherResult.metadata.operationsPrSecond),
                        'vs.',
                        Math.round(result.metadata.operationsPrSecond),
                        'ops',
                        (100 * Math.abs(ratio)).toFixed(2) + '%',
                        ratio < 0 ? 'slower' : 'faster'
            );
        }
    });
    avg = sumRatios / numValidResults;
    console.log(results[0].ref,
                'is',
                (100 * Math.abs(avg)).toFixed(2) + '%',
                avg < 0 ? 'slower' : 'faster',
                'than',
                results[1].ref,
                'on average');
    return exec('git checkout ' + (originalRef === 'HEAD' ? originalSha : originalRef), true);
}).then(function () {
    if (dirtyWorkingTree) {
        return exec('git stash pop');
    }
}).then(function () {
    if (typeof argv.threshold === 'number' && argv.threshold <= -avg * 100) {
        console.log('Performance regression higher than threshold');
        process.exit(1);
    }
});
