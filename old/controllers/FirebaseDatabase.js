/**
 * Created by Admin on 08.08.2016.
 */
var config = require('./config');
var firebase = require('firebase');
var path = require('path');


/**
 * Here we initilize firebaseUsers and export the database connection.
 */

var firebasePath = path.resolve(__dirname, '../../config/firebase_config.json');

firebase.initializeApp({
    serviceAccount: firebasePath,//'./config/firebase_config.json',
    databaseURL: config.firebaseDatabaseURL
});

const database = firebase.database();


module.exports = database;