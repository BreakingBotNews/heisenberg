var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');

function evalImportance() {
    console.log("run evalImportance");
    bisectImportance();
}

function bisectImportance() {
    var query = 'UPDATE article SET importance = (importance/2) WHERE importance >2';
    db.read(query,function (result) {
        console.log(result.affectedRows+" affected Rows");
        getFrontpages();
    });
}

function getFrontpages() {
    var query = 'SELECT COUNT(id) AS nr FROM frontpages';
    db.read(query,function (result) {
        var lastHourRuns = result[0].nr*config.dataJobsPerHour;
        getFrontpagesRuns(lastHourRuns);
    })
}

function getFrontpagesRuns(lastHourRuns) {
    var query = 'SELECT f.id, articlesOnFrontpages.article, articlesOnFrontpages.position FROM articlesOnFrontpages INNER JOIN (SELECT frontpagesRuns.id FROM frontpagesRuns ORDER BY frontpagesRuns.id DESC LIMIT 0, '+lastHourRuns+') f ON articlesOnFrontpages.run=f.id';
    db.read(query,function (result) {
        updateArticle(result)
    });
}

function updateArticle(result) {
    for (var i=0; i<result.length; i++){
        if(result[i].position<100) {
            var nr = 100 - result[i].position;
            var query = 'UPDATE article SET importance = (importance+' + nr + ') WHERE id='+result[i].article;
            db.read(query, function (result) {
                //console.log(result.affectedRows);
            })
        }
        if(i>result.length-2){
            setTimeout(function () {
                helper.endProgram();  
            },10000);
        }
    }
}

evalImportance();

module.exports = {
    evalImportance: evalImportance
};