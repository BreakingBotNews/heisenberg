/**
 * Created by Admin on 08.08.2016.
 */
var config = require('../../config/config');
var firebase = require('firebase');


/**
 * Here we initilize firebaseUsers and export the database connection.
 */

firebase.initializeApp({
    serviceAccount: './config/firebase_config.json',
    databaseURL: config.firebaseDatabaseURL
});

const database = firebase.database();


module.exports = database;