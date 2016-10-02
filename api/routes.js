var express = require('express');
var config = require('../config/config.json');
var db = require('../dbController/query');
var functionality = require('./functionality');
var standardQuery = require('../dbController/standardQuerys');

var router = express.Router();

//middleware
router.use(function (req,res,next) {
    //authentication check here
    if(req.query.apiKey===config.apiKey || (req.query.u && req.query.s)){
        next();
    }
    else{
        res.json({error:"Please provide a valid API Key: toplevel"})
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
            var aids = [];
            for(var j=0; j<result.length; j++){
                aids.push(result[j].id);
            }
            standardQuery.saveArticlesSendToUser(summaryRequest.id,aids);
        });
        return;
    }

    //fallback
    console.log(req.body);
    res.json({message:"Message received, but I don't understand your request"});
});

//settings endpoint

    //write fbData into db
router.route('/settings').post(function (req, res) {
    var query = 'SELECT fbId FROM user WHERE id='+req.query.u;
    db.read(query, function (result) {
        if(cutString(result[0].fbId.toString())===req.query.s){ //if result=undefinded ->crash BUG!
            functionality.saveFbData(req.body.fbData, req.body.user, function () {
                res.json({message:"success"});
            })
        }
        else{
            res.json({error:"Please provide a valid API Key"});
            return;
        }
    });
});

    //get themes and last article
router.route('/settings').get(function (req, res) {
    var query = 'SELECT fbId FROM user WHERE id='+req.query.u;
    db.read(query, function (result) {
        if(cutString(result[0].fbId.toString())===req.query.s){
            functionality.getArticleThemes(req.query.u,function (articles,themes) {
                res.json({articles:articles,themes:themes});
            });
        }
        else{
            res.json({error:"Please provide a valid API Key"});
            return;
        }
    });
});

//internal tools
router.route('/tools').post(function (req,res) {
    //security
    if(req.query.u || req.query.s){
        res.json({error:"Please provide a valid API Key 1"});
        return;
    }
    console.log("Tools post");
    //write data
    if(req.body){
        var category = req.body.category;
        var sections = req.body.sections;
        condition = "likeCategorie="+category;

        db.del('sectionLikeCategorieMapping',condition, function (r) {
            for (var i=0; i<sections.length; i++){
                var data = {
                    likeCategorie: category,
                    section: sections[i]
                };
                db.write('sectionLikeCategorieMapping',data,function (result) {
                    //console.log(result");
                });
            }
        });
        res.json({message:"success"});
    }
});

router.route('/tools').get(function (req, res) {
    //security
    if(req.query.u || req.query.s){
        res.json({error:"Please provide a valid API Key 1"});
        return;
    }
    functionality.getIdsAndLikeCat(function (sections, categories) {
       res.json({
           sections: sections,
           categories: categories
       });
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