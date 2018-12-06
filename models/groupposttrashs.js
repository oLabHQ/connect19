var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

// Posts Schema
var GroupPostTrashSchema = mongoose.Schema({
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

var GroupPostTrash = module.exports = mongoose.model('GrouppostTrash', GroupPostTrashSchema);

module.exports.createGrouppostTrash = function(newGroupPostTrash, callback){
    newGroupPostTrash.save(callback);	
}