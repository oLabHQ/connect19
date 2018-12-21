var mongoose = require('mongoose');
var shortid = require('shortid');


// Group post Schema
var GroupPostSchema = mongoose.Schema({
	group_id: {
		type: String
	},
	description: {
        type: String
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
	isFlagged: {
		type: Boolean,
		default: 'false'
	},
	ispinned:{
		type: Boolean,
		default: 'false'
	},
	trashed: {
		type: String,
		default: "N"
	}
})



var Groupposts = module.exports = mongoose.model('Groupposts', GroupPostSchema);

module.exports.createGroupPosts = function(newGroupPosts, callback){
    newGroupPosts.save(callback);
}

