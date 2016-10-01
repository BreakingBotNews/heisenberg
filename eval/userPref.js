var db = require('../dbController/query');
var helper = require('../helper/helper');
var config = require('../config/config.json');

function evalUserPrefs(user,callback) {
    var query = 'SELECT likeEntities.category FROM likeEntities INNER JOIN (SELECT * FROM userLikes WHERE user='+user+' ) u ON likeEntities.id=u.likeEntity';
    //var query2 = 'SELECT sectionLikeCategorieMapping.section FROM sectionLikeCategorieMapping WHERE sectionLikeCategorieMapping.likeCategorie=('+query+');';

    db.read(query,function (result) {
        countSections(result, user, callback);
    });
}

function countSections(categories, user, callback) {
    var query = 'SELECT section FROM sectionLikeCategorieMapping WHERE likeCategorie=';
    var sectionCount = [];
    var categorieCount = categories.length;
    for (var i=0;i<categorieCount;i++){
        if(i>categorieCount-2){
            //last iteration
            db.read(query+categories[i].category,function (result) {
                if(result[0]) {
                    for(var j=0; j<result.length; j++){
                        if(sectionCount[result[j].section]){
                            sectionCount[result[j].section]+=1;
                        }
                        else{
                            sectionCount[result[j].section]=1;
                        }
                    }
                }
                db.del('userSectionPref','user='+user,function (result) {
                    writeUserSectionPref(sectionCount,categorieCount,user, callback);
                });
            });
        }
        else{
            db.read(query+categories[i].category,function (result) {
                if(result[0]) {
                    for(var j=0; j<result.length; j++){
                        if(sectionCount[result[j].section]){
                            sectionCount[result[j].section]+=1;
                        }
                        else{
                            sectionCount[result[j].section]=1;
                        }
                    }
                }
            })
        }
    }
}

function writeUserSectionPref(sectionCount,categorieCount,user, callback) {
    for(var i in sectionCount){
       var percent =(sectionCount[i]*100)/categorieCount;
        percent = Math.round(percent);
        var data = {
            user: user,
            section: i,
            percentage: percent
        };
        if(i>sectionCount.length-2){
            db.write('userSectionPref', data, function (result) {
                callback();
            });
        }else{
            db.write('userSectionPref', data, function (result) {
                //console.log(result);
            });
        }
    }
}

module.exports = {
    evalUserPrefs: evalUserPrefs
};

