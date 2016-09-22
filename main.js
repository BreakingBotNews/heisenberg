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

var testObjekt = {
    keyWordSearch: {
        condition: "id = 5"
    }
};

1043117445737068
*/

var testObjekt = {
    fbId: 1043117445737068,
    headline: "Sack Reis fällt in China um"
};

axios.post('https://bot.aries.uberspace.de/pinkman/internalApi/webhook/article?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });
/*axios.post('https://bot2.shaula.uberspace.de/heisenberg/api/article?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });

/*axios.post('http://localhost:65241/api/article?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE',testObjekt).then(
    function (response) {
        console.log(response.data);
    });*/