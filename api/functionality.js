var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');

function summaryGlobalImportance(length, callback) {
    var query = 'SELECT * FROM article ORDER BY importance DESC LIMIT 0,'+length;
    db.read(query,function (result) {
        callback(result);
    });
}

function saveFbData(fbData, user, callback) {
    db.update('user',{hometown:fbData.hometown.location.city},'id='+user,function (result) {
       //console.log("hometown written");
    });
    db.update('user',{currentResidenz:fbData.location.location.city},'id='+user,function (result) {
       //console.log("currentResidenz written");
    });
    saveLikeData(fbData.likes.data,user,callback);
}

function saveLikeData(likes,user,callback) {
    for(var i=0; i<likes.length;i++){
        if(i<likes.length-2){
            getLikeEntity(likes[i],user,callback);
            console.log("Gave out real callback");
        }else{
            getLikeEntity(likes[i],user,false);
        }
    }
}

function getLikeEntity(like,user,callback) {
    var query = 'SELECT id FROM likeEntities WHERE externalId='+like.id;
    db.read(query,function (result) {
        if(result[0]){
            writeUserLikes(result[i].id,user,callback);
        }
        else{
            getLikeCategory(like,user,callback)
        }
    })
}

function writeUserLikes(entity,user,callback) {
    var data = {
        user: user,
        likeEntity: entity
    };
    db.write('userLikes',data,function (result) {
        //console.log("userLikes written");
        if(callback){
            callback();
        }
    })
}

function getLikeCategory(like,user,callback) {
    var query = 'SELECT * FROM likeCategories WHERE name='+like.category;
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
    saveFbData: saveFbData
};