/**
 * Created by Bernd on 09.08.2016.
 */
//modify db in callGuardian, modify module (publication vs modify date etc),
var request = require('request');
var config = require('./config/config');
var firebase = require('./api/controllers/FirebaseDatabase');
var helper = require("./helper/helper");

var baseUrl="http://content.guardianapis.com/search?";
var query="show-tags=all&show-elements=all&show-references=all&show-fields=all";
var pageSize = "&page-size="+parseInt(config.articleRequestedFromGuardian);
var apiKey="&api-key="+config.guardianAPI;

function callGuardian(lastDb){
    var ref = firebase.ref('news/guardian/');
    
    request(baseUrl+query+pageSize+apiKey, function (error, res, body) {
        if(error){
            console.log("Error in Guardian API call")
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
                    var key = ref.push();
                    key.set({
                        id: helper.testContentAvailability(result.id),
                        url: helper.testContentAvailability(result.webUrl),
                        type: helper.testContentAvailability(result.type),
                        sectionId: helper.testContentAvailability(result.sectionId),
                        headline: helper.testContentAvailability(result.fields.headline),
                        trailText: helper.testContentAvailability(result.fields.trailText),
                        // author issue: more than one and we could link to author page
                        byline: helper.testContentAvailability(result.fields.byline),
                        wordcount: helper.testContentAvailability(result.fields.wordcount),
                        webPublicationDate: helper.testContentAvailability(result.webPublicationDate),
                        firstPublicationDate: helper.testContentAvailability(result.fields.firstPublicationDate),
                        lastModified: helper.testContentAvailability(result.fields.lastModified),
                        productionOffice: helper.testContentAvailability(result.fields.productionOffice),
                        publication: helper.testContentAvailability(result.fields.publication),
                        shortUrl: helper.testContentAvailability(result.fields.shortUrl),
                        thumbnail: helper.testContentAvailability(result.fields.thumbnail),
                        language: helper.testContentAvailability(result.fields.lang),
                        tags: writeTagsToNews(result.tags)
                    },function(error){
                        if(error){
                            console.log("Guardian: Error writing to db");
                        }
                        else{
                          //  console.log("Guardian: One article written to db");
                        }
                    });
                    //categories, tags, place, country etc. missing
                    //function call and set via key. with promise? .then()?
                }
            }
            console.log("Guardian: written to db");
            helper.endProgram();
        }
    })
};

function writeTagsToNews(data){
    var returnTags=[];

    for (var i=0; i<data.length; i++){
        var tag = data[i];
        checkTagInDb(tag);
        //write data into obj
        returnTags[i]= {
            id: tag.id,
            webTitle: tag.webTitle
        }    
    }
    
    //return obj with all keys and webTitle
    return returnTags;
};

function checkTagInDb(tag) {
    var ref = firebase.ref('meta/guardian/')
    ref.once("value", function (snapshot) {
        var db = snapshot.val();
        var doublet=false;

        //see if tag is in our meta db
        for (var k in db){
            if(k===tag.id){
                //do something like count?
                doublet=true;
            }
        }

        //if no, write it
        if(!doublet){
            ref = firebase.ref('meta/guardian/'+tag.id).set({ //tag.id is a path, so it is actually divided here already
                id: helper.testContentAvailability(tag.id),
                type: helper.testContentAvailability(tag.type),
                sectionId: helper.testContentAvailability(tag.sectionId),
                sectionName: helper.testContentAvailability(tag.sectionName),
                webTitle: helper.testContentAvailability(tag.webTitle),
                webUrl: helper.testContentAvailability(tag.webUrl),
                apiUrl: helper.testContentAvailability(tag.apiUrl),
                references: helper.testContentAvailability(tag.references)
            })
        }
        
    }, function (errorObject) {
        console.log("The read to meta db failed: " + errorObject.code);
    });

};

function startGuardian () {
    var ref = firebase.ref('news/guardian/');

    ref.orderByKey().limitToLast(parseInt(config.articleLoadedFromDbLimit)).once("value", function (snapshot) {
        var db = snapshot.val();

        callGuardian(db);
    }, function (errorObject) {
        console.log("The read failed: " + errorObject.code);
    });
};

module.exports = {
    startGuardian: startGuardian
}