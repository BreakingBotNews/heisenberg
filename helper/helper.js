/**
 * Created by Bernd on 09.08.2016.
 */
var mysql = require('../dbController/mysqlPool').pool;

module.exports = {
    testContentAvailability: function(content){
        if(content){
            return content;
        }
        else{
            return false;
        }
    },
    
    endProgram: function (time) {
        if(!time||time<10000){
            time=10000;
        }
        console.log("init shutdown");
        console.log("time to shutdown: "+time);
        setTimeout(function () {mysql.end(function (err) {
            if(err){
                console.log("error shutting down mysql");
            }
            console.log("mysql shut down");
        })},time-5000);
        setTimeout(
            function(){
                console.log("shut down");
                process.exit(0);
            }, time);
    },
    
    objLength: function(obj){
        var length = 0;
        for (var i in obj){
            length++;
        }
        return length;
    },
    
    arrayDoublets: function(array, nr){
        for (var i=0; i<array.length; i++){
            if(array[i]===nr){
                return true;
            }
        }
        return false;
    }
};