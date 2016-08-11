var request = require ('request');
var cheerio = require ('cheerio');
var URL = require ('url-parse');

var START_URL = "http://www.theguardian.com/uk/sport";
//var SEARCH_WORD = "Yue Lin";

var url = new URL (START_URL);
var baseUrl = url.protocol + "//" + url.hostname;

function collectInternalLinks($) {
    var allRelativeLinks = [];

    var relativeLinks = $("a[href^='/sport']");
    relativeLinks.each(function () {
        allRelativeLinks.push($(this).attr('href'));
    });
    for(var i=0;i<allRelativeLinks.length;i++){
        console.log(allRelativeLinks[i]);
    }
}

var pageToVisit = "http://www.theguardian.com/uk/sport";

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
        //console.log("Page title:  " + $('title').text());
        collectInternalLinks($);
    }
});