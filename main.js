var db = require("./dbController/query");
var helper = require("./helper/helper");
var axios = require('axios');

var testObjekt = {
    query: {
        condition: "id = 1"
        },
    fields: [
        "name",
        "id",
        "fbID"
        ]
    };


axios.post('http://localhost:8080/api/user?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });

