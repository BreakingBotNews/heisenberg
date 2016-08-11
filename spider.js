var request = require ('request');
var cheerio = require ('cheerio');
var URL = require ('url-parse');


var pageToVisit = "http://www.theguardian.com";
console.log("Visiting page " + pageToVisit);
request(pageToVisit, function(error, response, body) {
    if(error) {
        console.log("Error: " + error);
    }
    // Check status code (200 is HTTP OK)
    console.log("Status code: " + response.statusCode);
    if(response.statusCode === 200) {
        // Parse the document body
        var $ = cheerio.load(body);
        console.log("Page title:  " + $('title').text());
        collectArticles($);
    }
});

/*function collectArticles($) {
    var allArticles = [];

    var articles = $("a[data-link-name^='article']");
    articles.each(function() {
        allArticles.push($(this).attr('href'));
    });

    console.log("Found " + allArticles.length + " articles");

    for(var i=0;i<allArticles.length;i++){
        console.log(allArticles[i]);
    }
}
*/ /*
function alreadyThere(element,index,array){

}   */

function collectArticles($) {
    var allArticles = [];
    var articles = $("a[data-link-name^='article']");
    /* for (var i=0; i<=1000; i++){
     allArticles[i] = $(articles[i]).attr('href') ;
     }     */
    //console.log(articles);
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

    console.log("Found " + allArticles.length + " articles");
    for (var i = 0; i < allArticles.length; i++) {
        console.log(allArticles[i]);
    }
}

/*each(function () {
        for (var i=0; i<allArticles.length;i++) {
             if(allArticles[i].attr('href') != ($(this).attr('href'))) {
                 allArticles.push ($(this).attr('href'));
             }
         }
        }
        articles.each(function () {
             for(var i=0;i<allArticles.length;i++) {
                 if(allArticles[i].attr('href') != this.attr('href')) {
                     allArticles.push($(this).attr('href')); }
        }});
    console.log("Found " + allArticles.length + " articles");
    for(var i=0;i<allArticles.length;i++){
        console.log(allArticles[i]);
    }
  /*  console.log(allArticles[0]);
    console.log(allArticles[1]);
    console.log(allArticles[2]);
    console.log(allArticles[3]);                    */

