var db = require("./dbController/query");
var helper = require("./helper/helper");

function test (result){
    console.log(result[0].name);
    helper.endProgram();
}
function test2(result){
    db.read('SELECT * FROM `user` WHERE `id` =3', test );
}

var data = {
    name: "nichtBernd",
    fbId: "fbId",
    id: 1
};

db.del('user',"name='Bernd' AND fbId='dbId3'",function (result) {
    console.log("Delete!")
});
