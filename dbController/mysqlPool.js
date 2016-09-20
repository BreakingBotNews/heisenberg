var mysql = require('mysql');
var config = require('../config/config');

var pool  = mysql.createPool({
    host     : config.dbHost,
    user     : config.dbUser,
    password : config.dbPassword,
    database : config.db,
    
    connectionLimit: config.dbConnectionLimit,
    queueLimit: config.queueLimit
});

exports.pool = pool;