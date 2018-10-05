var mongoose = require('mongoose');
var shortid = require('shortid');




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
	isprivate: {
		type: Boolean,
		default: 'false'
	},
	users_joined:[
		{
		type: String
		}
	]
});


var Group = module.exports = mongoose.model('Group', GroupSchema);


module.exports.createGroup = function(newGroup, callback){
    newGroup.save(callback);
}

