var request = require ('request');
var cheerio = require ('cheerio');
var firebase = require('../api/controllers/FirebaseDatabase');
var helper = require("../helper/helper");
var config = require("../config/spiderConfig")

function start(){
    for (var i=0; i<config.sitesToVisit.length; i++){
        var site = config.sitesToVisit[i];
        var notLast = i<config.sitesToVisit.length-1;

        spider(site.url,site.dbPath,site.slicePath, notLast);
    }
}

function spider(pageToVisit, dbPath, slicePath, notLast) {
    console.log("Visiting page " + pageToVisit);
    request(pageToVisit, function (error, response, body) {
        if (error) {
            console.log("Error: " + error);
        }
        // Check status code (200 is HTTP OK)
        console.log("Status code: " + response.statusCode);
        if (response.statusCode === 200) {
            // Parse the document body
            var $ = cheerio.load(body);
            console.log("Page title:  " + $('title').text());
            collectArticles($, dbPath, slicePath, notLast);
        }
    });
}

function collectArticles($, dbPath, slicePath, notLast) {
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

    writeDB(allArticles, dbPath, slicePath, notLast);
}

function writeDB(articles, dbPath, slicePath, notLast){
    var ref = firebase.ref(dbPath);

    //rewrite all https:// to http://
    for (var item in articles){
        articles[item]=articles[item].replace("https","http");
    }
    //change articles to ids
    for (var item in articles){
        articles[item]=articles[item].replace(slicePath,"");
    }

    var key = ref.push(articles);
    ref = firebase.ref(dbPath+key.key);
    ref.update({
        dateUTC: Date.now()
    })
    if(!notLast){
        helper.endProgram();
        console.log("End Program");
    }
}

start();

module.exports = {
    spider: spider,
    start: start
};