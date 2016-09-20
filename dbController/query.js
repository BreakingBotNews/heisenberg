var mysql = require('./mysqlPool').pool;
var helper = require("../helper/helper");

function read (query, callback) {
    mysql.getConnection(function (err, connection){
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        connection.query(query, function (error, results) {
            if (error) {
                console.error('error in sql statement!?: ' + error.stack);
                return;
            }
            if(callback) {
                callback(results);
            }
            connection.release();
        });
    });
};

function write (table, data, callback){
    mysql.getConnection(function (err, connection){
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        connection.query('INSERT INTO '+table+' SET ?', data, function (error, results) {
            if (error) {
                console.error('error in sql statement!?: ' + error.stack);
                return;
            }
            if(callback) {
                callback(results);
            }
            connection.release();
        });
    });
};

function update(table, data, condition, callback){
    mysql.getConnection(function (err, connection){
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        connection.query('UPDATE '+table+' SET ? WHERE '+condition, data, function (error, results) {
            if (error) {
                console.error('error in sql statement!?: ' + error.stack);
                return;
            }
            if(callback) {
                callback(results);
            }
            connection.release();
        });
    });
};

function del(table, condition, callback) {
    mysql.getConnection(function (err, connection){
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        connection.query('DELETE FROM '+table+' WHERE '+condition, function (error, results) {
            if (error) {
                console.error('error in sql statement!?: ' + error.stack);
                return;
            }
            if(callback) {
                callback(results);
            }
            connection.release();
        });
    });
};

function replace (table, data, callback){
    mysql.getConnection(function (err, connection){
        if (err) {
            console.error('error connecting: ' + err.stack);
            return;
        }

        connection.query('REPLACE INTO '+table+' SET ?', data, function (error, results) {
            if (error) {
                console.error('error in sql statement!?: ' + error.stack);
                return;
            }
            if(callback) {
                callback(results);
            }
            connection.release();
        });
    });
};

module.exports = {
    read: read,
    write: write,
    update: update,
    del: del,
    replace: replace
};