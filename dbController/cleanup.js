var db = require("../dbController/query");
var helper = require("../helper/helper");

function cleanupTags(){
    var query = 'SELECT id, externalID FROM tags';
    db.read(query,function (result) {
        var doublets = {};
        for (var i=0;i<result.length;i++) {
            for (var j = 0; j < result.length; j++) {
                if (result[i].id !== result[j].id && result[i].externalID === result[j].externalID) {
                    console.log("Doublet in Tags");
                    if (doublets[result[i].externalID]) {
                        if (!helper.arrayDoublets(doublets[result[i].externalID], result[i].id)) {
                            doublets[result[i].externalID].push(result[i].id);
                        }
                        if (!helper.arrayDoublets(doublets[result[i].externalID], result[j].id)) {
                            doublets[result[i].externalID].push(result[j].id);
                        }
                    }
                    else {
                        var array = [result[i].id, result[j].id];
                        doublets[result[i].externalID] = array;
                    }
                }
            }
        }
        safeDeleteTags(doublets);
    });
};

function cleanupSectionIds() {
    var query = 'SELECT * FROM sectionIDs';
    db.read(query,function (result) {
        var doublets = {};
        for (var i=0;i<result.length;i++) {
            for (var j = 0; j < result.length; j++) {
                if (result[i].id !== result[j].id && result[i].name === result[j].name) {
                    console.log("Doublet in Tags");
                    if (doublets[result[i].name]) {
                        if (!helper.arrayDoublets(doublets[result[i].name], result[i].id)) {
                            doublets[result[i].name].push(result[i].id);
                        }
                        if (!helper.arrayDoublets(doublets[result[i].name], result[j].id)) {
                            doublets[result[i].name].push(result[j].id);
                        }
                    }
                    else {
                        var array = [result[i].id, result[j].id];
                        doublets[result[i].name] = array;
                    }
                }
            }
        }
        safeDeleteSectionIds(doublets);
    });
};

function safeDeleteSectionIds(doublets) {
    for(var k in doublets){
        var doublet=doublets[k].sort(function(a, b){return a - b});
        for (var i=0; i<doublet.length; i++){
            if(i!==0){ //0 is first index and the entry we want to stay in db
                getArticleIdForDeleteSectionIds(doublet[i],doublet[0]);
            }
        }
    }
};

function safeDeleteTags(doublets) {
    for(var k in doublets){
        var doublet=doublets[k].sort(function(a, b){return a - b});
        for (var i=0; i<doublet.length; i++){
            if(i!==0){ //0 is first index and the entry we want to stay in db
                getArticleIdForDeleteTags(doublet[i], doublet[0]);
            }
        }
    }
};

function getArticleIdForDeleteTags(oldId, newId) {
    var query='SELECT article FROM tagsOfArticles WHERE tag='+oldId;
    db.read(query,function (results) {
        for (var j=0; j<results.length; j++){
            deleteTag(results[j].article,oldId);
            writeTagToDb(results[j].article,newId);
        }
    });
};

function getArticleIdForDeleteSectionIds(oldId, newId) {
    var query='SELECT id FROM article WHERE sectionID='+oldId;
    db.read(query,function (results) {
        for (var j=0; j<results.length; j++){
            deleteSection(oldId);
            updateArticle(results[j].article,newId);
        }
    });
};

function deleteTag(article,id) {
   // console.log(id);
    db.del('tagsOfArticles',"article='"+article+"' AND tag='"+id+"'",function (res) {
        console.log("Tag deleted in tagsOfArticle");
    });
    db.del('tags',"id='"+id+"'", function (res) {
        console.log("Tag deleted in tags");
    });
};

function deleteSection(id) {
    db.del('sectionIDs',"id='"+id+"'", function (res) {
        console.log("Section deleted");
    });
};

function writeTagToDb(article,id) {
    console.log(id);
    var data = {
        article: article,
        tag: id
    };
    db.replace('tagsOfArticles',data,function (res) {
        console.log("Replaced!");
    })
};

function updateArticle(articleId, sectionId) {
    var data = {sectionID: sectionId};
    db.update('article',data,"id='"+articleId+"'",function (res) {
        console.log("Article updated");
    })
}

module.exports = {
    cleanupTags: cleanupTags,
    cleanupSectionIds: cleanupSectionIds
};