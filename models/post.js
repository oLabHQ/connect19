var mongoose = require('mongoose');
var shortid = require('shortid');

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
	authorpic: {
		type: String,
		default: 'prof-img.png'
	},
	date: {
		type: Date,
		default: Date.now
	},
	post_id:{
		type: String,
		default: shortid.generate
	},
	flag:[
		{
			"post_id": String,
			"description": String,
			"postimage": String,
			"author":String,
			"date": Date
		}
	],
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

var Post = module.exports = mongoose.model('Post', PostSchema);

module.exports.createPost = function(newPost, callback){
	        newPost.save(callback);	
}