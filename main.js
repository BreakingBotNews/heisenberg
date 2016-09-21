var db = require("./dbController/query");
var helper = require("./helper/helper");
var axios = require('axios');

/*var testObjekt = {
    query: {
        condition: "id = 1"
        },
    fields: [
        "name",
        "id",
        "fbID"
        ]
    };
*/
var testObjekt = {
    delete: {
        condition: "id = 5"
    }
};


/*axios.post('https://bot2.shaula.uberspace.de/heisenberg/api/user?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });**/

axios.post('http://localhost:65241/api/user?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });