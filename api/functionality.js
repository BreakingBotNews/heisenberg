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

function summaryPersonalImportance(uId,length,callback) {
    //get top LENGTH categories of user
    var query = 'SELECT * FROM userSectionPref WHERE user='+uId+' ORDER BY count DESC LIMIT 0,'+length;
    db.read(query,function (result) {
        pGetArticles(result,length,callback,0,[]);
    });
}
//get top 10 articles for each Category together -> make list
function pGetArticles(sections,length,callback,i,obj) {
    if(length>i){
        var query = 'SELECT * FROM article WHERE sectionID='+sections[i].section+' ORDER BY importance DESC LIMIT 0,10';
        db.read(query, function (res) {
            obj[i]=res;
            i++;
            pGetArticles(sections,length,callback,i,obj)
        })
    }
    else{
        getTags(obj,sections,length,callback,0,0);
    }
}
//get Tags to Articles //user über sections.user
function getTags(articles, sections, length,callback,i,j) {
    if(length>i){
        if(j<10){
            var query = 'SELECT * FROM tagsOfArticles LEFT JOIN tags ON tagsOfArticles.tag = tags.id WHERE tagsOfArticles.article='+articles[i][j].id;
            db.read(query, function (result) {
                articles[i][j].tags = [];
                for (var x=0; x<result.length; x++){
                    if(result[x].sectionID !=0){
                        articles[i][j].tags.push(result[x]); //maybe just the name?
                    }
                }
                j++;
                getTags(articles, sections, length, callback,i,j);
            })
        }
        else{
            i++;
            getTags(articles, sections, length, callback,i,0);
        }
    }
    else {
        getSendArticles(articles,sections,length,callback);
    }
}
//get sendArticles of user
function getSendArticles(articles,sections,length,callback) {
    var query = 'SELECT article FROM articlesSendToUser WHERE user='+sections[0].user+' ORDER BY timestamp DESC LIMIT 0,100';
    db.read(query,function (result) {
        //remove already send articles from obj
        for (var i=0;i<articles.length;i++){
            for(var j=0;j<articles[i].length;j++){
                for (var x=0;x<result.length;x++){
                    if(articles[i][j]) {
                        if (articles[i][j].id == result[x].article) {
                            articles[i][j] = false;
                            console.log("double"); //doesnt work!?
                        }
                    }
                }
            }
        }
        getUserLikes(articles,sections,length,callback);
    })
}

//determine personal importance
//get users likes (more than 10000 follower)
function getUserLikes(articles,sections,length,callback) {
    var query = 'SELECT * FROM userLikes JOIN likeEntities ON userLikes.likeEntity=likeEntities.id WHERE userLikes.user='+
            sections[0].user+' AND likeEntities.follower>10000';
    db.read(query,function (result) {
        calculateList(articles,sections,result,length,callback);
    })
}

function calculateList(articles,sections,likes,length,callback) {
    var list = [];
    var returnList=[];
    var sectionCounter=0;
    //match likes and meta data -> double article score if match
    for (var i=0; i<articles.length; i++){
        for (var j=0; j<articles[i].length; j++){
            if(articles[i][j]){
                for (var x=0; x<articles[i][j].tags.length; x++){
                    for(var y=0;y<likes.length;y++){
                        if(articles[i][j].tags[x].name.toLowerCase()==likes[y].name.toLowerCase()&&likes[y].name.toLowerCase()!=="the guardian"){
                            articles[i][j].importance = articles[i][j].importance*2;
                            console.log("Corresponding Like and Meta data point: "+articles[i][j].tags[x].name.toLowerCase()+" "+likes[y].name.toLowerCase()+" "+articles[i][j].id);
                        }
                    }
                }
            }
            else {
                console.log("false");
            }
        }
    }
    //divide score by category position (1. 2. ...)
     for(var i=0;i<articles.length;i++){
        sectionCounter = 0;
        for(var j=0;j<articles[i].length;j++){
            if(articles[i][j]){
                articles[i][j].importance=articles[i][j].importance/(i+1);
                //add to list if importance >1
                if(articles[i][j].importance>1&&sectionCounter<3){
                    list.push(articles[i][j]);
                    sectionCounter++;
                }
            }
        }
    }
    /*for(var i=0;i<articles.length;i++){
        for(var j=0;j<articles[i].length;j++){
            console.log(articles[i][j].importance);
        }
        console.log("break")
    }*/
    //order list
    list.sort(function (a,b) {
        return b.importance-a.importance
    });
    returnList=list.slice(0,length);
    /*for(var i=0;i<returnList.length;i++){
        console.log(returnList[i].importance);
    }*/
    callback(returnList);
}


//not yet implemented:
//make sure not more then 2/3? articles per category in result
//in case there arent high profile articles in top sections these sections articles aren't shown in the result


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
    getIdsAndLikeCat: getIdsAndLikeCat,
    summaryPersonalImportance: summaryPersonalImportance
};