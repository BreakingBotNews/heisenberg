var express = require('express');
var config = require('../config/config.json');

var router = express.Router();

//middleware
router.use(function (req,res,next) {
    //authentication check here
    if(req.query.apiKey===config.apiKey){
        next();
    }
    else{
        res.json({error:"Please provide a valid API Key"})
    }
});
//routes
router.get('/', function (req, res) {
    res.json({message: "works!"});
});

router.route('/user').post(function (req,res) {
    console.log(req.body.name);
    res.json({message:"Message received"});
}).get(function (req,res) {
    //console.log(req.headers.name); //name is custom written into headers
    console.log(req.params);
    console.log(req.body);
    res.json({message:"get received"});
});

router.route('/user/:fbId').get(function (req,res) {
    console.log(req.params.fbId);
    res.json({message:"I found a fbId"});
});

module.exports = router;