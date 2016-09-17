/**
 * Created by Bernd on 10.08.2016.
 */
var request = require('request');
//var config = require('./config/config');
var firebase = require('./FirebaseDatabase');
var helper = require("../helper/helper");
//var spider = require("../spider/spider");

function cleanDoublets(dbPath, key){ //key and path: string
    var ref = firebase.ref(dbPath);

    ref.once("value", function (snapshot) {
        var db = snapshot.val();

        for(var item in db){
            var check = db[item][key];
            for(var item2 in db){
                if(item!==item2&&check===db[item2][key]){
                    console.log("doublet!");
                    console.log(item+"!=="+item2+" "+check+"==="+db[item2][key]);
                    //kill db entry, but I will delete everything then.. 
                }
            }
        }
        console.log(helper.objLength(db));
        console.log("end");
        helper.endProgram();
    });
}

//cleanDoublets("meta/guardian/","id");
cleanDoublets("news/guardian/","id");
