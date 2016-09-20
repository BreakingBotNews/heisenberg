var guardian = require('./guardian');
var helper = require('../helper/helper');
var cleanup = require('../dbController/cleanup');
var spider = require('./spider/spider');

guardian.startGuardian();
setTimeout(function () {
    cleanup.cleanupSectionIds();
    cleanup.cleanupTags();
},10000);
setTimeout(function () {
   spider.start();
},20000);