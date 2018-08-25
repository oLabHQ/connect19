var mongoose = require('mongoose');

// Posts Schema
var PostSchema = mongoose.Schema({	
	description: {
		type: String
    },
    postimage:{
        type: String
	},
	author: {
		type: String,		
	},
	date: {
		type: Date,
		default: Date.now
	}
});

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.createPost = function(newPost, callback){
	        newPost.save(callback);	
}