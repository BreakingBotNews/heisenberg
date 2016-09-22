var helper = require("../helper/helper");
var axios = require('axios');
var url = 'https://bot.aries.uberspace.de/pinkman/internalApi/webhook/article?apiKey=pK8TyE%26f7PTdu$SkS9jDEETVMkha%26k_xzwV^sGW7FgH3n?DE';

function send(data) {
    axios.post(url,data).then(
        function (response) {
           // console.log(response.data);
        });
}

module.exports = {
    send: send
};
