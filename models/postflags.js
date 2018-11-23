var mongoose = require('mongoose');
var shortid = require('shortid');

// Posts Schema
var FlagSchema = mongoose.Schema({
    post_id:{
			type: String,		
		}    
});

var Flag = module.exports = mongoose.model('Flag', FlagSchema);

module.exports.createFlag = function(newFlag, callback){
    newFlag.save(callback);	
}

