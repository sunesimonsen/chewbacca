var Base = require('mocha/lib/reporters/base');
var cursor = Base.cursor;
var color = Base.color;

exports = module.exports = function BenchmarkReporter(runner) {
    var self = this;
    Base.call(this, runner);

    var tests = [];
    var pending = [];
    var failures = [];
    var passes = [];

    runner.on('test end', function(test){
        tests.push(test);
    });

    runner.on('pass', function(test){
        passes.push(test);
    });

    runner.on('fail', function(test){
        failures.push(test);
    });

    runner.on('pending', function(test){
        pending.push(test);
    });

    runner.on('end', function(){
        var obj = {
            stats: self.stats,
            tests: tests.map(toJsonOutput),
            pending: pending.map(toJsonOutput),
            failures: failures.map(toJsonOutput),
            passes: passes.map(toJsonOutput)
        };

        runner.testResults = obj;

        process.stdout.write(JSON.stringify(obj, null, 2));
    });
}

function toJsonOutput(test) {
    if (test.metadata && typeof test.metadata.iterations === 'number' && typeof test.duration === 'number') {
        test.metadata.averageDuration = test.duration / test.metadata.iterations;
        test.metadata.operationsPrSecond = test.metadata.iterations / (test.duration / 1000);
    }

    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        err: errorJSON(test.err || {}),
        metadata: test.metadata
    }
}

function errorJSON(err) {
    var res = {};
    Object.getOwnPropertyNames(err).forEach(function(key) {
        res[key] = err[key];
    }, err);
    return res;
}
