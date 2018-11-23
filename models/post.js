var mongoose = require('mongoose');
var shortid = require('shortid');
var mongoosePaginate = require('mongoose-paginate');

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
	},
	post_id:{
		type: String,
		default: shortid.generate
	},	
	trash:[
		{
			"post_id": String,
			"description": String,
			"postimage": String,
			"author":String,
			"date": Date
		}
	],
	trashed: {
		type: String,
		default: "N"
	}
});

PostSchema.plugin(mongoosePaginate);

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.createPost = function(newPost, callback){
	        newPost.save(callback);	
}