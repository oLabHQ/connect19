var mongoose = require('mongoose');
var shortid = require('shortid');


// Group post Schema
var groupPostSchema = mongoose.Schema({
	description: {
        type: String,
        default: "Please enter some description"
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
})

// Group Schema
var GroupSchema = mongoose.Schema({
	groupname: {
		type: String,
		index:true
	},
	description: {
		type: String
	},
	group_id:{
		type: String,
		default: shortid.generate
    },
    date: {
		type: Date,
		default: Date.now
	},
	createdby: {
		type: String,		
	},
	users_joined:[
		{
			"member_id": String,
			"username": String,
			"profile_pic": String
		}
	],
	group_posts: [groupPostSchema]
});


var Group = module.exports = mongoose.model('Group', GroupSchema);


module.exports.createGroup = function(newGroup, callback){
    newGroup.save(callback);
}

