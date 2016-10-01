var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');
var webhook = require('../api/webhook');
var functionality = require('../api/functionality');
var standardQuery = require('../dbController/standardQuerys');

function sendSummarys() {
    console.log('sendSummarys invoked');
    var date = new Date();
    var currentHour = date.getHours();
    var query = 'SELECT user.fbId, user.id FROM subscriptions JOIN user ON subscriptions.user=user.id WHERE subscriptions.time = '+currentHour;

    db.read(query, function (user) {
        functionality.summaryGlobalImportance(5,function (articles) {
            var aids = [];

            for(var j=0; j<articles.length; j++){
                aids.push(articles[j].id);
            }

            for (var i=0; i<user.length; i++){
                
                var data = {
                    fbId:user[i].fbId,
                    template: true,
                    articles: articles
                };
                webhook.send(data);

                standardQuery.saveArticlesSendToUser(user[i].id,aids);

                if(i>user.length-2){
                    setTimeout(function () {
                        helper.endProgram();
                    },15000);
                }
            }
        });
    });
}

sendSummarys();

module.exports = {
    sendSummarys: sendSummarys
};