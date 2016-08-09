/**
 * Created by Admin on 08.08.2016.
 */
//modify db in guardian, modify module (publication vs modify date etc), clear code make it beautiful
var request = require('request');
var config = require('./config/config');
var firebase = require('./api/controllers/FirebaseDatabase');

var baseUrl="http://content.guardianapis.com/search?";
var query="show-tags=all&show-elements=all&show-references=all&show-fields=all";
var apiKey="&api-key="+config.guardianAPI;

function callGuardian(lastDb){
    request(baseUrl+query+apiKey, function (error, res, body) {
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
                    ref.push().set({
                        id: testContentAvailability(result.id),
                        url: testContentAvailability(result.webUrl),
                        type: testContentAvailability(result.type),
                        sectionId: testContentAvailability(result.sectionId),
                        headline: testContentAvailability(result.fields.headline),
                        trailText: testContentAvailability(result.fields.trailText),
                       // author issue: more than one and we could link to author page
                        byline: testContentAvailability(result.fields.byline),
                        wordcount: testContentAvailability(result.fields.wordcount),
                        webPublicationDate: testContentAvailability(result.webPublicationDate),
                        firstPublicationDate: testContentAvailability(result.fields.firstPublicationDate),
                        lastModified: testContentAvailability(result.fields.lastModified),
                        productionOffice: testContentAvailability(result.fields.productionOffice),
                        publication: testContentAvailability(result.fields.publication),
                        shortUrl: testContentAvailability(result.fields.shortUrl),
                        thumbnail: testContentAvailability(result.fields.thumbnail),
                        language: testContentAvailability(result.fields.lang)
                        //categories, tags, place, country etc. missing
                    })
                }
            }
            console.log("Guardian: written to db");
        }
    })
};

function testContentAvailability (content){
    if(content){
        return content;
    }
    else{
        return false;
    }
    
};

var ref = firebase.ref('news/guardian/');

ref.orderByKey().limitToLast(parseInt(config.articleLoadedFromDbLimit)).once("value", function(snapshot) {
    var db = snapshot.val();
    
    callGuardian(db);
}, function (errorObject) {
    console.log("The read failed: " + errorObject.code);
});