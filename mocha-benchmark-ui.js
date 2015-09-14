var Mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test  = require('mocha/lib/test');
var Promise = require('rsvp').Promise;
var escapeRe = require('escape-string-regexp');
var microtime = require('microtime');

function filterOutliers(data) {
    // The smallest numbers are the most stable because of garbage collection
    var sorted = data.slice().sort(function(a,b){return a - b; });
    sorted = sorted.slice(0, Math.round(sorted.length / 4));
    return sorted;
}

function averageWithoutOutliers(data) {
    var values = filterOutliers(data);
    var sum = values.reduce(function (result, duration) {
        return result + duration;
    }, 0);
    return sum / values.length;
}


module.exports = Mocha.interfaces['mocha-benchmark-ui'] = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {
        var common = require('mocha/lib/interfaces/common')(suites, context);

        context.before = common.before;
        context.after = common.after;
        context.beforeEach = function () {
            throw new Error('beforeEach is not supported for benchmarks');
        };
        context.afterEach = function () {
            throw new Error('afterEach is not supported for benchmarks');
        };
        context.run = mocha.options.delay && common.runWithSuite(suite);

        context.describe = context.context = function(title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.file = file;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
            return suite;
        };

        context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.pending = true;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
        };

        context.describe.only = function(title, fn) {
            var suite = context.describe(title, fn);
            mocha.grep(suite.fullTitle());
            return suite;
        };

        context.it = context.specify = function(title, fn) {
            var suite = suites[0];
            if (suite.pending) {
                fn = null;
            }

            var iterationCount = 10000;
            var isAsync = fn && fn.length > 0;

            var iterations = new Array(iterationCount);
            for (var i = 0; i < iterationCount; i += 1) {
                iterations[i] = 0;
            }
            var indexes = Object.keys(iterations);
            var test = new Test(title, function () {
                var result = null;
                var promise;
                indexes.forEach(function (i) {
                    var start = microtime.now();
                    if (isAsync) {
                        promise = new Promise(function (resolve, reject) {
                            fn(function (err) {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            });
                        });
                    } else {
                        promise = fn();
                    }

                    if (promise && typeof promise.then === 'function') {
                        if (result) {
                            result = result.then(function () {
                                iterations[i] = microtime.now() - start;
                                return promise;
                            });
                        } else {
                            result = promise.then(function () {
                                iterations[i] = microtime.now() - start;
                            });
                        }
                    } else {
                        iterations[i] = microtime.now() - start;
                    }
                });

                if (result) {
                    result.then(function () {
                        test.metadata.duration = averageWithoutOutliers(iterations) * iterationCount / 1000;
                    });
                } else {
                    test.metadata.duration = averageWithoutOutliers(iterations) * iterationCount / 1000;
                }

                return result;
            });
            test.metadata = {
                iterations: iterationCount
            };
            test.file = file;
            suite.addTest(test);
            return test;
        };

        context.it.only = function(title, fn) {
            var test = context.it(title, fn);
            var reString = '^' + escapeRe(test.fullTitle()) + '$';
            mocha.grep(new RegExp(reString));
            return test;
        };

        context.xit = context.xspecify = context.it.skip = function(title) {
            context.it(title);
        };
    });
};
