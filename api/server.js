var express = require('express');
var bodyParser = require('body-parser');
var config = require('../config/config.json')

var app = express();

app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

var port = process.env.PORT || config.port;

app.use('/api',require('./routes'));

app.listen(port);

console.log("Magic on port "+ port);