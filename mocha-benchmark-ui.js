var Mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test  = require('mocha/lib/test');
var Promise = require('rsvp').Promise;
var escapeRe = require('escape-string-regexp');

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

function nanoSeconds(hrtime) {
    return hrtime[0] * 1e9 + hrtime[1];
}

var iterationCount = 5000;

function updateMetadata(test, iterations) {
    var averageOperationTimeNS = averageWithoutOutliers(iterations);
    test.metadata.iterations = iterationCount;
    test.metadata.duration = averageOperationTimeNS * iterationCount / 1e9;
    test.metadata.averageDurationInNanoSeconds = averageOperationTimeNS;
    test.metadata.operationsPrSecond = averageOperationTimeNS * 1e9;
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
                    var start = process.hrtime();
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
                                iterations[i] = nanoSeconds(process.hrtime(start));
                                return promise;
                            });
                        } else {
                            result = promise.then(function () {
                                iterations[i] = nanoSeconds(process.hrtime(start));
                            });
                        }
                    } else {
                        iterations[i] = nanoSeconds(process.hrtime(start));
                    }
                });

                if (result) {
                    result.then(function () {
                        updateMetadata(test, iterations);
                    });
                } else {
                    updateMetadata(test, iterations);
                }

                return result;
            });
            test.metadata = {};
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
