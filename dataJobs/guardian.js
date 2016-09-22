var request = require('request');
var config = require('../config/config');
var helper = require("../helper/helper");
var db = require("../dbController/query");
var breaking = require('../eval/breaking');

var baseUrl="http://content.guardianapis.com/search?";
var query="show-tags=all&show-elements=all&show-references=all&show-fields=all";
var pageSize = "&page-size="+parseInt(config.articleRequestedFromGuardian);
var apiKey="&api-key="+config.guardianAPI;

function callAPI(lastDb) {
   // console.log(lastDb);
    request(baseUrl+query+pageSize+apiKey, function (error, res, body) {
        if (error) {
            console.log("Error in Guardian API call: "+error);
        }
        if (!error && res.statusCode == 200) {
            var data = JSON.parse(body);
            console.log("Guardian: "+data.response.status);
            for(var i=0;i<data.response.results.length; i++){
                var result = data.response.results[i];
                var doublet = false;

                //check for doublets
                for (var k in lastDb){
                    if(lastDb[k].id===result.id){
                        //modify db (ref.update or something on k)
                        doublet=true;
                    }
                }

                //write to db or omit
                if(!doublet){
                    var queryData = {
                        source: 1,
                        externalID: helper.testContentAvailability(result.id),
                        articleURL: helper.testContentAvailability(result.webUrl),
                        headline: helper.testContentAvailability(result.fields.headline),
                        trailText: helper.testContentAvailability(result.fields.trailText),
                        byline: helper.testContentAvailability(result.fields.byline),
                        wordcount: helper.testContentAvailability(result.fields.wordcount),
                        firstPublicationDate: helper.testContentAvailability(result.fields.firstPublicationDate),
                        lastModified: helper.testContentAvailability(result.fields.lastModified),
                        shortUrl: helper.testContentAvailability(result.fields.shortUrl),
                        thumbnailURL: helper.testContentAvailability(result.fields.thumbnail),
                        language: helper.testContentAvailability(result.fields.lang)
                    };
                    writeArticle(result,queryData);
                }
            }
            console.log("Guardian: written to db");
        }
    })
};

function writeArticle(result,queryData) {
    db.write('article',queryData,function(dbResults){
        breaking.evalBreaking(queryData);
        writeTags(dbResults.insertId, result.tags);
        writeSection (dbResults.insertId, result.sectionId);
    });
}

function writeTags(articleId, tags){
    if(tags){
        for (var i in tags){
            checkTagInDb(articleId, tags[i]);
        }
    }
};

function checkTagInDb(articleId, tag){
    var query='SELECT id, externalID FROM tags';
    db.read(query, function (dbResults) {
        var doublet=false;
        for (var k in dbResults){
            if(dbResults[k].externalID===tag.id){ //check for doublets
               writeTagToDb(articleId,dbResults[k].id);
                doublet=true;
            }
        }

        if(!doublet){
            writeNewTag(articleId,tag);
        }
    });
}

function writeTagToDb(articleId, tagId) {
    var data={
        article:articleId,
        tag:tagId
    };
    db.write('tagsOfArticles',data,function(){
       // console.log("new tag written to db");
    })
};

function writeNewTag(articleId, tag){
    var data={
        externalID: helper.testContentAvailability(tag.id),
        sectionID: helper.testContentAvailability(tag.sectionId),
        name: helper.testContentAvailability(tag.webTitle),
        webURL: helper.testContentAvailability(tag.webUrl),
        source:1
    };
    db.write('tags',data,function (dbResults) {
        writeTagTypes(dbResults.insertId, tag.type);
        writeTagToDb(articleId,dbResults.insertId);
    });
};

function writeTagTypes(tagId, type){
    var query='SELECT * FROM tagTypes';
    db.read(query, function (dbResults) {
        var doublet=false;
        for (var k in dbResults){
            if(dbResults[k].name===type){ //check for doublets
                db.update('tags',{type:dbResults[k].id},'id='+tagId,function () {
                    //console.log("tag type written");
                });
                doublet=true;
            }
        }

        if(!doublet){
            var data ={
                name:type
            };
            db.write('tagTypes',data,function (dbResult) {
                db.update('tags',{type:dbResult.insertId},'id='+tagId,function () {
                   // console.log("tag type written");
                });
            })
        }
    });
}

function writeSection(articleId, section){
    var query ='SELECT * FROM sectionIDs';
    db.read(query, function (dbResults) {
        var doublet=false;
        for (var k in dbResults){
            if(dbResults[k].name===section){ //check for doublets
                var data = {sectionID:dbResults[k].id};
                db.update("article",data,'id='+articleId,function () {
                    //console.log("section written");
                });
                doublet=true;
            }
        }

        if(!doublet){
            var data={name:section};
            db.write('sectionIDs',data,function(dbResults){
                db.update("article",{sectionID:dbResults.insertId},'id='+articleId,function () {
                   // console.log("section written and new section added");
                });
            });
        }


    });
};

function startGuardian (){
    var dbQuery='SELECT externalID AS id FROM article WHERE source = 1 ORDER BY creationDate DESC LIMIT 0,'+config.articleLoadedFromDbLimit;
    db.read(dbQuery, callAPI);
};

module.exports = {
    startGuardian: startGuardian
};