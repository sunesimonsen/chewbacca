/**
 * Module dependencies.
 */

var Mocha = require('mocha');
var Suite = require('mocha/lib/suite');
var Test  = require('mocha/lib/test');
var Promise = require('rsvp').Promise;

/**
 * BDD-style interface that will loop each test for benchmarking:
 *
 *      describe('Array', function() {
 *        describe('#indexOf()', function() {
 *          it('should return -1 when not present', function() {
 *            // ...
 *          });
 *
 *          it('should return the index when present', function() {
 *            // ...
 *          });
 *        });
 *      });
 *
 * @param {Suite} suite Root suite.
 */
module.exports = Mocha.interfaces['mocha-benchmark-ui'] = function(suite) {
    var suites = [suite];

    suite.on('pre-require', function(context, file, mocha) {
        var common = require('mocha/lib/interfaces/common')(suites, context);

        context.before = common.before;
        context.after = common.after;
        context.beforeEach = function () {
            throw new Error('beforeEach is not supported for benchmarks');
        }
        context.afterEach = function () {
            throw new Error('afterEach is not supported for benchmarks');
        };
        context.run = mocha.options.delay && common.runWithSuite(suite);
        /**
         * Describe a "suite" with the given `title`
         * and callback `fn` containing nested suites
         * and/or tests.
         */

        context.describe = context.context = function(title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.file = file;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
            return suite;
        };

        /**
         * Pending describe.
         */

        context.xdescribe = context.xcontext = context.describe.skip = function(title, fn) {
            var suite = Suite.create(suites[0], title);
            suite.pending = true;
            suites.unshift(suite);
            fn.call(suite);
            suites.shift();
        };

        /**
         * Exclusive suite.
         */

        context.describe.only = function(title, fn) {
            var suite = context.describe(title, fn);
            mocha.grep(suite.fullTitle());
            return suite;
        };

        /**
         * Describe a specification or test-case
         * with the given `title` and callback `fn`
         * acting as a thunk.
         */

        context.it = context.specify = function(title, fn) {
            var suite = suites[0];
            if (suite.pending) {
                fn = null;
            }

            var iterations = 10000;
            var isAsync = fn && fn.length > 0;

            var test = new Test(title, function () {
                var result = null;
                var promise;
                for (var i = 0; i < iterations; i += 1) {
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
                                return promise;
                            });
                        } else {
                            result = promise;
                        }
                    }
                }
                return result;
            });
            test.file = file;
            suite.addTest(test);
            return test;
        };

        /**
         * Exclusive test-case.
         */

        context.it.only = function(title, fn) {
            var test = context.it(title, fn);
            var reString = '^' + escapeRe(test.fullTitle()) + '$';
            mocha.grep(new RegExp(reString));
            return test;
        };

        /**
         * Pending test case.
         */

        context.xit = context.xspecify = context.it.skip = function(title) {
            context.it(title);
        };
    });
};
