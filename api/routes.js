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

//user endpoint
router.route('/user').post(function (req,res){
    var condition;
    var fields;
    var query;
    var data;

    //query
    if(req.body.query) {
        condition = req.body.query.condition;
        fields = valFields(req.body.fields ,"*");

        query = "SELECT "+fields+" FROM user WHERE "+condition+";";
        db.read(query,function (result) {
            //res.json({success:true});
            res.json(result);
        });
        return;
    }
    
    //write
    if(req.body.write){
        if(req.body.write.data){
            db.write('user',req.body.write.data,function (result) {
                res.json(result); //.insertId 
            });
        }
        return;
    }
    
    //update
    if(req.body.update){
        condition = req.body.update.condition;
        data = req.body.update.data;

        db.update('user',data,condition,function (result) {
            res.json(result);
        });
        return;
    }

    //delete
    if(req.body.delete){
        condition = req.body.delete.condition;

        db.del('user',condition,function (result) {
            res.json(result);
        });
        return;
    }

    //fallback
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

//article endpoint
router.route('/article').post(function (req, res) {

    //keyWordSearch
    if(req.body.keyWordSearch){
        res.json({message:"Sorry this part isn't build yet.(keyWordSearch)"});
        /*
         keyword(""), source (opt), section (opt), sortBy (opt,:latest, popular, important), length
         */
    }

    //summaryRequest
    if(req.body.summaryRequest){
        res.json({message:"Sorry this part isn't build yet. (summaryRequest)"});
        /*
         userId/FbId, length
         */
    }

    //fallback
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

//helper
function valFields(fields, standard) {
    if(fields){
        var array = fields;
        fields = "";
        for(var i=0;i<array.length;i++){
            fields+=array[i];
            if(i<array.length-1){
                fields+=", ";
            }
        }
        return fields;
    }
    else{
        return standard;
    }
}

module.exports = router;