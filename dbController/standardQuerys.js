var db = require('./query');

function saveArticlesSendToUser(uid,aids) {
    for (var i=0;i<aids.length;i++){
        var data = {
            article: aids[i],
            user: uid
        };
        db.write('articlesSendToUser',data,function (result) {
            //console.log(result);
        })
    }
}

module.exports = {
    saveArticlesSendToUser: saveArticlesSendToUser
};