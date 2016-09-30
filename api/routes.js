var express = require('express');
var config = require('../config/config.json');
var db = require('../dbController/query');
var functionality = require('./functionality');

var router = express.Router();

//middleware
router.use(function (req,res,next) {
    //authentication check here
    if(req.query.apiKey===config.apiKey || (req.query.u && req.query.s)){
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

    //security
    if(req.query.u || req.query.s){
        res.json({error:"Please provide a valid API Key"})
        return;
    }

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

    //subscription
    if(req.body.subscription){
        if(req.body.subscription.delete){
            condition = 'user='+req.body.subscription.user+' AND time='+req.body.subscription.time;
            db.del('subscriptions',condition,function (result) {
                //console.log(result);
                res.json(result);
            })
        }else{
            data = {
                user: req.body.subscription.user,
                time: req.body.subscription.time
            };
            db.replace('subscriptions',data,function (result) {
                //console.log(result);
                res.json(result);
            })
        }
        return;
    }

    //fallback
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

//article endpoint
router.route('/article').post(function (req, res) {
    
    //security
    if(req.query.u || req.query.s){
        res.json({error:"Please provide a valid API Key"})
        return;
    }

    //keyWordSearch
    if(req.body.keyWordSearch){
        res.json({message:"Sorry this part isn't build yet.(keyWordSearch)"});
        /*
         keyword(""), source (opt), section (opt), sortBy (opt,:latest, popular, important), length
         */
        return;
    }

    //summaryRequest
    if(req.body.summaryRequest){
        //res.json({message:"Sorry this part isn't build yet. (summaryRequest)"});
        /*
         userId/FbId, length
         */
        var summaryRequest = req.body.summaryRequest;
        functionality.summaryGlobalImportance(summaryRequest.length, function (result) {
            res.json(result);
        });
        return;
    }

    //fallback
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

router.route('/settings').post(function (req, res) {
    var query = 'SELECT fbId FROM user WHERE id='+req.query.u;
    db.read(query, function (result) {
        if(cutString(result[0].fbId.toString())===req.query.s){
            functionality.saveFbData(req.body.fbData, req.body.user, function () {
                res.json({message:"Success"});
            })
        }
        else{
            res.json({error:"Please provide a valid API Key"+cutString(result[0].fbId.toString())});
            return;
        }
    });
});

router.route('/settings').get(function (req, res) {
    var query = 'SELECT fbId FROM user WHERE id='+req.query.u;
    db.read(query, function (result) {
        if(cutString(result[0].fbId.toString())===req.query.s){
            res.json({message:"results for article and themes are supposed to be here"});
        }
        else{
            res.json({error:"Please provide a valid API Key"+cutString(result[0].fbId.toString())});
            return;
        }
    });
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

function cutString(string) {
    return string.slice(4,8);
}

module.exports = router;