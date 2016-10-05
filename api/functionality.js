var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');
var userPref = require('../eval/userPref');

//article functionality
function summaryGlobalImportance(length, callback) {
    var query = 'SELECT * FROM article ORDER BY importance DESC LIMIT 0,'+length;
    db.read(query,function (result) {
        callback(result);
    });
}

//settings functionality
function getArticlesThemes(user,callback) {
    getArticles(user,callback);
}

function getArticles(user,callback) {
    var query = 'SELECT article.headline, article.trailText, articlesSendToUser.timestamp FROM articlesSendToUser' +
        ' JOIN article ON articlesSendToUser.article=article.id WHERE articlesSendToUser.user='+user+' ORDER BY articlesSendToUser.timestamp DESC LIMIT 0,10;';
    db.read(query,function (result) {
        getThemes(user,result,callback);
    });
}

function getThemes(user,articles,callback) {
    var query = 'SELECT sectionIDs.name FROM userSectionPref JOIN sectionIDs ON userSectionPref.section=sectionIDs.id WHERE userSectionPref.user='+user+' ORDER BY userSectionPref.count DESC LIMIT 0,10;'; //JOIN
    db.read(query, function (result) {
        callback(articles,result);
    });
}

//tools functionality

function getIdsAndLikeCat(callback) {
    var query = 'SELECT * FROM sectionIDs';
    db.read(query,function (result) {
        getLikeCat(result, callback);
    });
}

function getLikeCat(sections, callback) {
    var query = 'SELECT * FROM likeCategories';
    db.read(query, function (result) {
       callback(sections,result); 
    });
}

//fbData functionality
function saveFbData(fbData, user, callback) {
    db.update('user',{hometown:fbData.hometown.location.city},'id='+user,function (result) {
       //console.log("hometown written");
    });
    db.update('user',{currentResidenz:fbData.location.location.city},'id='+user,function (result) {
       //console.log("currentResidenz written");
    });
    db.update('user',{loginId:fbData.id},'id='+user,function (result) {
        //console.log("loginId");
    });
    saveLikeData(fbData.likes.data,user,callback);
}

function saveLikeData(likes,user,callback) {
    for(var i=0; i<likes.length;i++){
        if(i>likes.length-2){
            getLikeEntity(likes[i],user,callback);
            //console.log("Gave out real callback");
        }else{
            getLikeEntity(likes[i],user,false);
        }
    }
}

function getLikeEntity(like,user,callback) {
    var condition = like.id.toString();
    var query = 'SELECT id, externalId FROM likeEntities WHERE externalId='+condition;
    db.read(query,function (result) {
        if(result[0]){
            writeUserLikes(result[0].id,user,callback);
        }
        else{
            getLikeCategory(like,user,callback);
        }
    })
}

function writeUserLikes(entity,user,callback) {
    var data = {
        user: user,
        likeEntity: entity
    };
    db.replace('userLikes',data,function (result) {
        //console.log("userLikes written");
        if(callback){
            userPref.evalUserPrefs(user,callback);
        }
    })
}

function getLikeCategory(like,user,callback) {
    var condition = like.category.toString();
    var query = "SELECT id FROM likeCategories WHERE name='"+condition+"'";
    db.read(query,function (result) {
        if(result[0]){
            writeEntity(like,user,result[0].id,callback);
        }
        else{
            writeCategory(like,user,callback);
        }
    })
}

function writeCategory(like,user,callback) {
    var data = {
        name: like.category
    };
    db.write('likeCategories',data,function (result) {
        writeEntity(like,user,result.insertId,callback);
    });
}

function writeEntity(like,user,cid,callback) {
    var data = {
        externalId: like.id,
        name: like.name,
        category: cid,
        follower: like.fan_count
    };
    db.write('likeEntities',data,function (result) {
        writeUserLikes(result.insertId,user,callback);
    });
}

module.exports = {
    summaryGlobalImportance: summaryGlobalImportance,
    saveFbData: saveFbData,
    getArticleThemes: getArticlesThemes,
    getIdsAndLikeCat: getIdsAndLikeCat
};