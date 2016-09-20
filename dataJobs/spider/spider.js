var request = require ('request');
var cheerio = require ('cheerio');
var db = require('../../dbController/query');
var helper = require("../../helper/helper");
var config = require("../../config/config.json");

function start(){
    var dbQuery='SELECT * FROM frontpages';
    db.read(dbQuery,function (result) {
        //console.log(result.length);
        for (var i=0; i<result.length; i++){
            var site = result[i];
            var notLast = i<result.length-1;
            
            spider(site, notLast);
        }
    });
}

function spider(site, notLast) {
    var data = {frontpage:site.id};
    db.write('frontpagesRuns',data,function (result) {
        site.run = result.insertId;
        console.log("Visiting page " + site.fullURL);
        request(site.fullURL, function (error, response, body) {
            if (error) {
                console.log("Error: " + error);
            }
            // Check status code (200 is HTTP OK)
            console.log("Status code: " + response.statusCode);
            if (response.statusCode === 200) {
                // Parse the document body
                var $ = cheerio.load(body);
                console.log("Page title:  " + $('title').text());
                collectArticles($, site, notLast);
            }
        });
    });
}

function collectArticles($, site, notLast) {
    var allArticles = [];
    var articles = $("a[data-link-name^='article']");

    for (var item in articles) {
        if (item >= 0) { //test if string is number to only get articles
            //console.log(articles[item].attribs.href);
            var found = false;
            for (var i = 0; i < allArticles.length; i++) {
                var elementOfArticles = articles[item].attribs.href;
                var elementOfAllArticles = (allArticles[i]);
                if (elementOfArticles === elementOfAllArticles) {
                    found = true;
                }
            }
            if (found == false) {
                allArticles.push(articles[item].attribs.href);
            }
        }
    }

    getArticlesFromDB(allArticles, site, notLast);
}

function getArticlesFromDB(articles,site,notLast) {
    //rewrite all https:// to http://
    for (var item in articles){
        articles[item]=articles[item].replace("https","http");
    }
    //change articles to ids
    for (var item in articles){
        articles[item]=articles[item].replace(site.slicePath,"");
    }

    var query = 'SELECT externalID, id FROM article WHERE source = '+site.source+' ORDER BY creationDate DESC LIMIT 0,'+config.articleLoadedFromDbLimit;
    db.read(query, function (results) {
        //figure out which article ids!
        var articleIds=[];
        
        for (var i=0; i<articles.length; i++){

            for (var k in results){
                if(results[k].externalID===articles[i]){
                    var a = {
                        run: site.run,
                        article: results[k].id,
                        position: i
                    };
                    articleIds.push(a);
                }
            }
        }
        writeDB(articleIds,notLast);
    })
}

function writeDB(articleIds, notLast){
    //work needed: writeDB: articlesOnFrontpages
    for(var i=0; i<articleIds.length; i++){
        db.write('articlesOnFrontpages',articleIds[i],function (result) {
            //console.log("New Entry in articlesOnFrontpages");
        })
    }
    
    if(!notLast){
        helper.endProgram(20000);
    }
}

module.exports = {
    start: start
};