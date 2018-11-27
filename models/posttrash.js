var mongoose = require('mongoose');
var shortid = require('shortid');

// Posts Schema
var TrashSchema = mongoose.Schema({
    post_id:{
			type: String,		
        },
    author_id:{
            type: String
        }
});

var Trash = module.exports = mongoose.model('Trash', TrashSchema);

module.exports.createTrash = function(newTrash, callback){
    newTrash.save(callback);	
}

