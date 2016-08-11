/**
 * Created by Bernd on 09.08.2016.
 */
module.exports = {
    testContentAvailability: function(content){
        if(content){
            return content;
        }
        else{
            return false;
        }
    },
    
    endProgram: function () {
        setTimeout(function(){process.exit(0)}, 10000);
    },
    
    objLength: function(obj){
        var length = 0;
        for (var i in obj){
            length++;
        }
        return length;
    }
};