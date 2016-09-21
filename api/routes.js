var express = require('express');
var config = require('../config/config.json');
var db = require('../dbController/query');

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
router.route('/user').post(function (req,res){
    if(req.body.query) {
        var condition = req.body.query.condition;
        var fields = req.body.fields || "*"
        
        if(fields!=="*"){
            var array = fields;
            fields = "";
            for(var i=0;i<array.length;i++){
                fields+=array[i];
                if(i<array.length-1){
                    fields+=", ";
                }
            }
        }

        var query = "SELECT "+fields+" FROM user WHERE "+condition+";";
        db.read(query,function (result) {
            //res.json({success:true});
            res.json(result);
        });
        return;
    }
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

router.route('/article').post(function (req, res) {
    console.log(req.body);
    res.json({message:"Message received"});
});


module.exports = router;