var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var objectId = require('mongodb').ObjectID;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


// Get Users
router.get('/', ensureAuthenticated, function(req,res){    
   User.find({"email": {$ne: req.user.email}}, function(err, users){
	 //  User.find({user_profile : {"$elemMatch": {"description": "Please enter some description.." }}}, function(err, userprofile){
		if(err) throw err;	
	 //var id = req.body.id;  	 	 		
		//console.log(JSON.stringify(users));

		//var getNestedObject = (nestedObj, pathArr) => {
		//	return pathArr.reduce((obj, key) =>
		//		(obj && obj[key] !== 'undefined') ? obj[key] : undefined, nestedObj);
		//}

				// pass in your object structure as array elements
	//  var name = getNestedObject(users, ['user_profile', 'description']);
	 // console.log(name);
		//var test = JSON.stringify(userprofile);
		console.log(users)
		res.render('friends/index', {user_friends: users});	
//	});
});
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
} 

module.exports = router;