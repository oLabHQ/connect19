var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

// Posts Schema
var GroupPostFlagSchema = mongoose.Schema({
    post_id:{
			type: String,		
        },
    author_id: {
        type: String
    },
    group_id: {
        type: String
    }
});

var GroupPostFlag = module.exports = mongoose.model('GrouppostFlag', GroupPostFlagSchema);

module.exports.createGroupPostFlag = function(newGroupPostFlag, callback){
    newGroupPostFlag.save(callback);	
}

