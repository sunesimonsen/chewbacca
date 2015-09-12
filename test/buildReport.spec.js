var expend = require('extend');
var expect = require('unexpected');
var buildReport = require('../lib/buildReport');

describe('buildReport', function () {
    it('if the test data contains failures it throws', function () {
        expect(function () {
            buildReport({
                before: {
                    "stats": {
                        "suites": 6,
                        "tests": 13,
                        "passes": 13,
                        "pending": 0,
                        "failures": 0,
                        "start": "2015-09-12T19:14:31.370Z",
                        "end": "2015-09-12T19:14:46.366Z",
                        "duration": 14996
                    }
                },
                after: {
                    "stats": {
                        "suites": 6,
                        "tests": 13,
                        "passes": 12,
                        "pending": 0,
                        "failures": 1,
                        "start": "2015-09-12T19:14:31.370Z",
                        "end": "2015-09-12T19:14:46.366Z",
                        "duration": 14996
                    }
                }
            });
        }, "to throw", "The test results contains failing tests and can therefore not be used for benchmarking");
    });

    describe('on simple test data', function () {
        var testData = {
            "before": {
                "stats": {
                    "suites": 1,
                    "tests": 1,
                    "passes": 1,
                    "pending": 0,
                    "failures": 0,
                    "start": "2015-09-12T19:14:31.370Z",
                    "end": "2015-09-12T19:14:46.366Z",
                    "duration": 275
                },
                "tests": [
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 275,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0275,
                            "operationsPrSecond": 36363.63636363636
                        }
                    }
                ],
                "pending": [],
                "failures": [],
                "passes": [
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 275,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0275,
                            "operationsPrSecond": 36363.63636363636
                        }
                    }
                ]
            },

            "after": {
                "stats": {
                    "suites": 1,
                    "tests": 1,
                    "passes": 1,
                    "pending": 0,
                    "failures": 0,
                    "start": "2015-09-12T19:15:53.776Z",
                    "end": "2015-09-12T19:16:03.365Z",
                    "duration": 134
                },
                "tests": [
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 134,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0134,
                            "operationsPrSecond": 74626.86567164179
                        }
                    }
                ],
                "pending": [],
                "failures": [],
                "passes": [
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 134,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0134,
                            "operationsPrSecond": 74626.86567164179
                        }
                    }
                ]
            }
        };

        it('produces a performance report', function () {
            expect(testData, 'when passed as parameter to', buildReport, 'to equal', {
                "stats": {
                    "tests": 1,
                },
                "tests": {
                    "benchmark: to be truthy on numbers": {
                        "title": "benchmark: to be truthy on numbers",
                        "before": {
                            "duration": 275,
                            "iterations": 10000,
                            "averageDuration": 0.0275,
                            "operationsPrSecond": 36363.63636363636
                        },
                        "after": {
                            "duration": 134,
                            "iterations": 10000,
                            "averageDuration": 0.0134,
                            "operationsPrSecond": 74626.86567164179
                        },
                        "result": "105% improvement"
                    }
                }
            });
        });
    });

    describe('on real test data', function () {
        var testData = {
            "before": {
                "stats": {
                    "suites": 6,
                    "tests": 13,
                    "passes": 13,
                    "pending": 0,
                    "failures": 0,
                    "start": "2015-09-12T19:14:31.370Z",
                    "end": "2015-09-12T19:14:46.366Z",
                    "duration": 14996
                },
                "tests": [
                    {
                        "title": "to call the callback async",
                        "fullTitle": "benchmark: to call the callback async",
                        "duration": 595,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0595,
                            "operationsPrSecond": 16806.722689075632
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 275,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0275,
                            "operationsPrSecond": 36363.63636363636
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be truthy on strings",
                        "duration": 261,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0261,
                            "operationsPrSecond": 38314.17624521073
                        }
                    },
                    {
                        "title": "on object",
                        "fullTitle": "benchmark: to be truthy on object",
                        "duration": 301,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0301,
                            "operationsPrSecond": 33222.591362126244
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be on numbers",
                        "duration": 559,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0559,
                            "operationsPrSecond": 17889.087656529515
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be on strings",
                        "duration": 545,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0545,
                            "operationsPrSecond": 18348.623853211007
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to be on same object",
                        "duration": 600,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.06,
                            "operationsPrSecond": 16666.666666666668
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to equal on numbers",
                        "duration": 770,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.077,
                            "operationsPrSecond": 12987.012987012986
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to equal on strings",
                        "duration": 734,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0734,
                            "operationsPrSecond": 13623.978201634878
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to equal on objects",
                        "duration": 1252,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.1252,
                            "operationsPrSecond": 7987.220447284345
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to equal on same object",
                        "duration": 877,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0877,
                            "operationsPrSecond": 11402.508551881414
                        }
                    },
                    {
                        "title": "on a small string",
                        "fullTitle": "benchmark: to match on a small string",
                        "duration": 803,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0803,
                            "operationsPrSecond": 12453.300124533
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to satisfy on objects",
                        "duration": 7396,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.7396,
                            "operationsPrSecond": 1352.0822065981613
                        }
                    }
                ],
                "pending": [],
                "failures": [],
                "passes": [
                    {
                        "title": "to call the callback async",
                        "fullTitle": "benchmark: to call the callback async",
                        "duration": 595,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0595,
                            "operationsPrSecond": 16806.722689075632
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 275,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0275,
                            "operationsPrSecond": 36363.63636363636
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be truthy on strings",
                        "duration": 261,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0261,
                            "operationsPrSecond": 38314.17624521073
                        }
                    },
                    {
                        "title": "on object",
                        "fullTitle": "benchmark: to be truthy on object",
                        "duration": 301,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0301,
                            "operationsPrSecond": 33222.591362126244
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be on numbers",
                        "duration": 559,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0559,
                            "operationsPrSecond": 17889.087656529515
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be on strings",
                        "duration": 545,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0545,
                            "operationsPrSecond": 18348.623853211007
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to be on same object",
                        "duration": 600,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.06,
                            "operationsPrSecond": 16666.666666666668
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to equal on numbers",
                        "duration": 770,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.077,
                            "operationsPrSecond": 12987.012987012986
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to equal on strings",
                        "duration": 734,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0734,
                            "operationsPrSecond": 13623.978201634878
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to equal on objects",
                        "duration": 1252,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.1252,
                            "operationsPrSecond": 7987.220447284345
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to equal on same object",
                        "duration": 877,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0877,
                            "operationsPrSecond": 11402.508551881414
                        }
                    },
                    {
                        "title": "on a small string",
                        "fullTitle": "benchmark: to match on a small string",
                        "duration": 803,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0803,
                            "operationsPrSecond": 12453.300124533
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to satisfy on objects",
                        "duration": 7396,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.7396,
                            "operationsPrSecond": 1352.0822065981613
                        }
                    }
                ]
            },

            "after": {
                "stats": {
                    "suites": 6,
                    "tests": 13,
                    "passes": 13,
                    "pending": 0,
                    "failures": 0,
                    "start": "2015-09-12T19:15:53.776Z",
                    "end": "2015-09-12T19:16:03.365Z",
                    "duration": 9589
                },
                "tests": [
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 134,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0134,
                            "operationsPrSecond": 74626.86567164179
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be truthy on strings",
                        "duration": 136,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0136,
                            "operationsPrSecond": 73529.41176470587
                        }
                    },
                    {
                        "title": "on object",
                        "fullTitle": "benchmark: to be truthy on object",
                        "duration": 178,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0178,
                            "operationsPrSecond": 56179.77528089888
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be on numbers",
                        "duration": 302,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0302,
                            "operationsPrSecond": 33112.58278145696
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be on strings",
                        "duration": 283,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0283,
                            "operationsPrSecond": 35335.6890459364
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to equal on numbers",
                        "duration": 492,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0492,
                            "operationsPrSecond": 20325.20325203252
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to equal on strings",
                        "duration": 487,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0487,
                            "operationsPrSecond": 20533.88090349076
                        }
                    },
                ],
                "pending": [],
                "failures": [],
                "passes": [
                    {
                        "title": "to call the callback async",
                        "fullTitle": "benchmark: to call the callback async",
                        "duration": 425,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0425,
                            "operationsPrSecond": 23529.411764705885
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be truthy on numbers",
                        "duration": 134,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0134,
                            "operationsPrSecond": 74626.86567164179
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be truthy on strings",
                        "duration": 136,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0136,
                            "operationsPrSecond": 73529.41176470587
                        }
                    },
                    {
                        "title": "on object",
                        "fullTitle": "benchmark: to be truthy on object",
                        "duration": 178,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0178,
                            "operationsPrSecond": 56179.77528089888
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to be on numbers",
                        "duration": 302,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0302,
                            "operationsPrSecond": 33112.58278145696
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to be on strings",
                        "duration": 283,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0283,
                            "operationsPrSecond": 35335.6890459364
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to be on same object",
                        "duration": 341,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0341,
                            "operationsPrSecond": 29325.513196480937
                        }
                    },
                    {
                        "title": "on numbers",
                        "fullTitle": "benchmark: to equal on numbers",
                        "duration": 492,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0492,
                            "operationsPrSecond": 20325.20325203252
                        }
                    },
                    {
                        "title": "on strings",
                        "fullTitle": "benchmark: to equal on strings",
                        "duration": 487,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0487,
                            "operationsPrSecond": 20533.88090349076
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to equal on objects",
                        "duration": 952,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0952,
                            "operationsPrSecond": 10504.20168067227
                        }
                    },
                    {
                        "title": "on same object",
                        "fullTitle": "benchmark: to equal on same object",
                        "duration": 631,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0631,
                            "operationsPrSecond": 15847.860538827259
                        }
                    },
                    {
                        "title": "on a small string",
                        "fullTitle": "benchmark: to match on a small string",
                        "duration": 538,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.0538,
                            "operationsPrSecond": 18587.360594795537
                        }
                    },
                    {
                        "title": "on objects",
                        "fullTitle": "benchmark: to satisfy on objects",
                        "duration": 4657,
                        "err": {},
                        "metadata": {
                            "iterations": 10000,
                            "averageDuration": 0.4657,
                            "operationsPrSecond": 2147.305132059266
                        }
                    }
                ]
            }
        };

        it('produces a performance report', function () {
            expect(testData, 'when passed as parameter to', buildReport, 'to equal', {
                stats: { tests: 13 },
                tests: {
                    'benchmark: to call the callback async': {
                        title: 'benchmark: to call the callback async',
                        before: {
                            duration: 595,
                            iterations: 10000,
                            averageDuration: 0.0595,
                            operationsPrSecond: 16806.722689075632
                        },
                        after: {
                            duration: 425,
                            iterations: 10000,
                            averageDuration: 0.0425,
                            operationsPrSecond: 23529.411764705885
                        },
                        result: '40% improvement'
                    },
                    'benchmark: to be truthy on numbers': {
                        title: 'benchmark: to be truthy on numbers',
                        before: {
                            duration: 275,
                            iterations: 10000,
                            averageDuration: 0.0275,
                            operationsPrSecond: 36363.63636363636
                        },
                        after: {
                            duration: 134,
                            iterations: 10000,
                            averageDuration: 0.0134,
                            operationsPrSecond: 74626.86567164179
                        },
                        result: '105% improvement'
                    },
                    'benchmark: to be truthy on strings': {
                        title: 'benchmark: to be truthy on strings',
                        before: {
                            duration: 261,
                            iterations: 10000,
                            averageDuration: 0.0261,
                            operationsPrSecond: 38314.17624521073
                        },
                        after: {
                            duration: 136,
                            iterations: 10000,
                            averageDuration: 0.0136,
                            operationsPrSecond: 73529.41176470587
                        },
                        result: '92% improvement'
                    },
                    'benchmark: to be truthy on object': {
                        title: 'benchmark: to be truthy on object',
                        before: {
                            duration: 301,
                            iterations: 10000,
                            averageDuration: 0.0301,
                            operationsPrSecond: 33222.591362126244
                        },
                        after: {
                            duration: 178,
                            iterations: 10000,
                            averageDuration: 0.0178,
                            operationsPrSecond: 56179.77528089888
                        },
                        result: '69% improvement'
                    },
                    'benchmark: to be on numbers': {
                        title: 'benchmark: to be on numbers',
                        before: {
                            duration: 559,
                            iterations: 10000,
                            averageDuration: 0.0559,
                            operationsPrSecond: 17889.087656529515
                        },
                        after: {
                            duration: 302,
                            iterations: 10000,
                            averageDuration: 0.0302,
                            operationsPrSecond: 33112.58278145696
                        },
                        result: '85% improvement'
                    },
                    'benchmark: to be on strings': {
                        title: 'benchmark: to be on strings',
                        before: {
                            duration: 545,
                            iterations: 10000,
                            averageDuration: 0.0545,
                            operationsPrSecond: 18348.623853211007
                        },
                        after: {
                            duration: 283,
                            iterations: 10000,
                            averageDuration: 0.0283,
                            operationsPrSecond: 35335.6890459364
                        },
                        result: '93% improvement'
                    },
                    'benchmark: to be on same object': {
                        title: 'benchmark: to be on same object',
                        before: {
                            duration: 600,
                            iterations: 10000,
                            averageDuration: 0.06,
                            operationsPrSecond: 16666.666666666668
                        },
                        after: {
                            duration: 341,
                            iterations: 10000,
                            averageDuration: 0.0341,
                            operationsPrSecond: 29325.513196480937
                        },
                        result: '76% improvement'
                    },
                    'benchmark: to equal on numbers': {
                        title: 'benchmark: to equal on numbers',
                        before: {
                            duration: 770,
                            iterations: 10000,
                            averageDuration: 0.077,
                            operationsPrSecond: 12987.012987012986
                        },
                        after: {
                            duration: 492,
                            iterations: 10000,
                            averageDuration: 0.0492,
                            operationsPrSecond: 20325.20325203252
                        },
                        result: '57% improvement'
                    },
                    'benchmark: to equal on strings': {
                        title: 'benchmark: to equal on strings',
                        before: {
                            duration: 734,
                            iterations: 10000,
                            averageDuration: 0.0734,
                            operationsPrSecond: 13623.978201634878
                        },
                        after: {
                            duration: 487,
                            iterations: 10000,
                            averageDuration: 0.0487,
                            operationsPrSecond: 20533.88090349076
                        },
                        result: '51% improvement'
                    },
                    'benchmark: to equal on objects': {
                        title: 'benchmark: to equal on objects',
                        before: {
                            duration: 1252,
                            iterations: 10000,
                            averageDuration: 0.1252,
                            operationsPrSecond: 7987.220447284345
                        },
                        after: {
                            duration: 952,
                            iterations: 10000,
                            averageDuration: 0.0952,
                            operationsPrSecond: 10504.20168067227
                        },
                        result: '32% improvement'
                    },
                    'benchmark: to equal on same object': {
                        title: 'benchmark: to equal on same object',
                        before: {
                            duration: 877,
                            iterations: 10000,
                            averageDuration: 0.0877,
                            operationsPrSecond: 11402.508551881414
                        },
                        after: {
                            duration: 631,
                            iterations: 10000,
                            averageDuration: 0.0631,
                            operationsPrSecond: 15847.860538827259
                        },
                        result: '39% improvement'
                    },
                    'benchmark: to match on a small string': {
                        title: 'benchmark: to match on a small string',
                        before: {
                            duration: 803,
                            iterations: 10000,
                            averageDuration: 0.0803,
                            operationsPrSecond: 12453.300124533
                        },
                        after: {
                            duration: 538,
                            iterations: 10000,
                            averageDuration: 0.0538,
                            operationsPrSecond: 18587.360594795537
                        },
                        result: '49% improvement'
                    },
                    'benchmark: to satisfy on objects': {
                        title: 'benchmark: to satisfy on objects',
                        before: {
                            duration: 7396,
                            iterations: 10000,
                            averageDuration: 0.7396,
                            operationsPrSecond: 1352.0822065981613
                        },
                        after: {
                            duration: 4657,
                            iterations: 10000,
                            averageDuration: 0.4657,
                            operationsPrSecond: 2147.305132059266
                        },
                        result: '59% improvement'
                    }
                }
            });
        });
    });
});
