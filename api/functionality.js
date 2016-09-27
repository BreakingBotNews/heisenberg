var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');

function summaryGlobalImportance(length, callback) {
    var query = 'SELECT * FROM article ORDER BY importance DESC LIMIT 0,'+length;
    db.read(query,function (result) {
        callback(result);
    });
}

module.exports = {
    summaryGlobalImportance: summaryGlobalImportance
};