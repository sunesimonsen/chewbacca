var Mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test  = require('mocha/lib/test');
var escapeRe = require('escape-string-regexp');

function nanoSeconds(hrtime) {
    return hrtime[0] * 1e9 + hrtime[1];
}

var iterationCount = 5000;
var iterations = new Array(iterationCount);

function updateMetadata(test, bestIterationTime) {
    test.metadata.iterations = iterationCount;
    test.metadata.durationInNanoseconds = bestIterationTime * iterationCount;
    test.metadata.durationInMiliseconds = bestIterationTime * iterationCount / 1000000;
    test.metadata.bestIterationTime = bestIterationTime;
    test.metadata.operationsPrSecond = 1e9 / bestIterationTime;
}

function detectReturningPromise(fn) {
    try {
        var promise = fn();
        if (promise && typeof promise.then === 'function') {
            promise.then(function () {}, function (err) {});
            return true;
        }
    } catch (e) {
        throw e;
    }
    return false;
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
            var returnsPromise = detectReturningPromise(fn);
            var bestIterationTime = Infinity;

            var runIterations;
            if (isAsync) {
                runIterations = function (i, done) {
                    if (i >= iterationCount) {
                        return done();
                    }

                    var start = process.hrtime();
                    fn(function (err) {
                        if (err) {
                            done(err);
                        } else {
                            bestIterationTime = Math.min(bestIterationTime, nanoSeconds(process.hrtime(start)));
                            runIterations(i + 1, done);
                        }
                    });
                };
            } else if (returnsPromise) {
                runIterations = function(i, done) {
                    if (i >= iterationCount) {
                        return done();
                    }

                    var start = process.hrtime();
                    var promise = fn().then(function () {
                        bestIterationTime = Math.min(bestIterationTime, nanoSeconds(process.hrtime(start)));
                        runIterations(i + 1, done);
                    }).catch(done);
                };
            } else {
                runIterations = function (_, done) {
                    for (var i = 0; i < iterationCount; i += 1) {
                        var start = process.hrtime();
                        fn();
                        bestIterationTime = Math.min(bestIterationTime, nanoSeconds(process.hrtime(start)));
                    }
                    done();
                };
            }

            var test = new Test(title, function (done) {
                runIterations(0, function (err) {
                    updateMetadata(test, bestIterationTime);
                    done(err);
                });
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
