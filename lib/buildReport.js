var extend = require('extend');

module.exports = function (options) {
    var before = options.before;
    var after = options.after;

    if (before.stats.failures > 0 || after.stats.failures > 0) {
        throw new Error('The test results contains failing tests and can therefore not be used for benchmarking');
    }

    var report = {
        stats: {},
        tests: {}
    };

    before.passes.forEach(function (test) {
        report.tests[test.fullTitle] = {
            title: test.fullTitle,
            before: {
                duration: test.duration,
                iterations: test.metadata.iterations,
                averageDuration: test.metadata.averageDuration,
                operationsPrSecond: test.metadata.operationsPrSecond
            }
        };
    });

    after.passes.forEach(function (test) {
        extend(report.tests[test.fullTitle] || {}, {
            after: {
                duration: test.duration,
                iterations: test.metadata.iterations,
                averageDuration: test.metadata.averageDuration,
                operationsPrSecond: test.metadata.operationsPrSecond
            }
        });
    });

    var testKeys = Object.keys(report.tests);

    testKeys.forEach(function (key) {
        var test = report.tests[key];

        if (test.before && test.after) {
            var difference = test.after.operationsPrSecond - test.before.operationsPrSecond;
            var procentage = difference / test.before.operationsPrSecond;
            var label = 0 < procentage ? 'improvement' : 'decline';
            test.result = Math.round(Math.abs(procentage) * 100) + '% ' + label;
        }
    });


    report.stats.tests = testKeys.length;

    return report;
};
