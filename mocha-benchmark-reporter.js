/**
 * Module dependencies.
 */

var Base = require('mocha/lib/reporters/base');
var cursor = Base.cursor;
var color = Base.color;

/**
 * Initialize a new `JSON` reporter.
 *
 * @param {Runner} runner
 * @api public
 */

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
            tests: tests.map(clean),
            pending: pending.map(clean),
            failures: failures.map(clean),
            passes: passes.map(clean)
        };

        runner.testResults = obj;

        process.stdout.write(JSON.stringify(obj, null, 2));
    });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */

function clean(test) {
    return {
        title: test.title,
        fullTitle: test.fullTitle(),
        duration: test.duration,
        err: errorJSON(test.err || {}),
        metadata: test.metadata
    }
}

/**
 * Transform `error` into a JSON object.
 * @param {Error} err
 * @return {Object}
 */

function errorJSON(err) {
    var res = {};
    Object.getOwnPropertyNames(err).forEach(function(key) {
        res[key] = err[key];
    }, err);
    return res;
}
