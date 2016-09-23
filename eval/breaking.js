var db = require("../dbController/query");
var helper = require("../helper/helper");
var axios = require('axios');
var webhook = require('../api/webhook');

function evalBreaking(article){
    /*
    Not at all near to what it should do. (Evaluating if article is breaking news and whom to send to).
    It just sends all articles to all subscribed user.
     */
    var query ='SELECT fbId AS id FROM user WHERE active = 1';
    db.read(query,function (result) {
        for (var i=0;i<result.length;i++){
            var data = {
                fbId:result[i].id,
                headline:article.headline
            };
            webhook.send(data);
        }
    });
}

module.exports = {
    evalBreaking: evalBreaking
};