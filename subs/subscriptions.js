var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');
var webhook = require('../api/webhook');
var functionality = require('../api/functionality')

function sendSummarys() {
    console.log('sendSummarys invoked');
    var date = new Date();
    var currentHour = date.getHours();
    var query = 'SELECT user.fbId FROM subscriptions JOIN user ON subscriptions.user=user.id WHERE subscriptions.time = '+currentHour;

    db.read(query, function (user) {
        functionality.summaryGlobalImportance(5,function (articles) {
            for (var i=0; i<user.length; i++){
                
                var data = {
                    fbId:user[i].fbId,
                    template: true,
                    articles: articles
                };
                webhook.send(data);
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