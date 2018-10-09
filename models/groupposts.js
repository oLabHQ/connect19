var mongoose = require('mongoose');
var shortid = require('shortid');


// Group post Schema
var GroupPostSchema = mongoose.Schema({
	group_id: {
		type: String
	},
	description: {
        type: String,
        default: "Please enter some description"
    },
    postimage:{
        type: String
	},	
	date: {
		type: Date,
		default: Date.now
	},
	createdby: {
		type: String
	},
	post_id:{
		type: String,
		default: shortid.generate
    },
    group_id: {
        type: String,        
	},
	ispinned:{
		type: Boolean,
		default: 'false'
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
})



var Groupposts = module.exports = mongoose.model('Groupposts', GroupPostSchema);

module.exports.createGroupPosts = function(newGroupPosts, callback){
    newGroupPosts.save(callback);
}

