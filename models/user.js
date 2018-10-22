var mongoose = require('mongoose');
var shortid = require('shortid');
var bcrypt = require('bcryptjs');
var Handlebars = require("handlebars");
var hbsHelpers = require('handlebars-helpers');

// Userprofile Schema
var userProfileSchema = mongoose.Schema({
	description: {
		type: String,
		default: "Please enter some description.."
	},
	interests: {
		type: String,
		default: "None"
	},
	profilepic: {
		type: String,
		default: 'prof-img.png'
	}
})

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	member_id:{
		type: String,
		default: shortid.generate
	},
	admin: {
		type: Boolean,
		default: "false"
	},	
	friends:[
		{
			"member_id": String,		
		}
	],
	friend_requests: [
		{
			"member_id": String,			
		}
	],
	group_invitation:[
		{
			type: String			
		}
	],
	group_joined:[
		{
			type: String
		}
	],
	user_profile: [userProfileSchema]
});


var User = module.exports = mongoose.model('User', UserSchema);


module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}