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
		if(err) throw err;	
		//console.log(users[0].friend_requests[0].member_id)
		//var friend_request_sent = users[0].friend_requests[0].member_id;
		//console.log(friend_request_sent);
		//res.render('friends/index', {user_friends: users, friend_request_sent : friend_request_sent});	
		res.render('friends/index', {user_friends: users});	
});
});

// Post friend Request
router.post('/', ensureAuthenticated, function(req, res){
	//console.log(req.payload);
	User.find({"email": req.user.email}, function(err, sending_user){
		if(err) throw err;
		//console.log(sending_user[0].member_id);
		//console.log(sending_user[0].username);
		//console.log(sending_user[0].user_profile[0].profilepic);
		User.find({"member_id": req.body.member_id}, function(err, potential_friend){
			//console.log(potential_friend[0]);
			if(err) throw err;
			//console.log(potential_friend[0].friend_requests[0].member_id);
			
			potential_friend[0].update({$push: {"friend_requests": {"member_id": sending_user[0].member_id, "friend_name": sending_user[0].username, "profile_pic": sending_user[0].user_profile[0].profilepic}}}).exec()
					req.flash('success_msg', 'You have send friend request to ' +potential_friend[0].username);
					res.send(); 
					//res.send({memberid: potential_friend[0].friend_requests[0].member_id});
		});
	});
});

// Pending Requests
router.get('/friend-requests', ensureAuthenticated, function(req, res){
	User.findOne({username:req.user.username}, function(err, friendrequests){		
		//console.log(friendrequests.friend_requests[].member_id);	 	
		if(err) throw err;
		//res.render('friends/pendingrequests', {friendrequests: friendrequests.friend_requests});
		res.render('friends/pendingrequests', {friendrequests: friendrequests.friend_requests});
	});
});

// Accept friends requests

router.post('/friend-requests', ensureAuthenticated, function(req, res){
	User.find({'email': req.user.email}, function(err, user){
		//console.log(user);
		User.find({"member_id": req.body.member_id}, function(err, accepted_friend_user){
			//console.log(accepted_friend_user);			
			user[0].update({$push: {friends: {"member_id": accepted_friend_user[0].member_id, "friend_name": accepted_friend_user[0].username, "profile_pic": accepted_friend_user[0].user_profile[0].profilepic}}, $pull: {"friend_requests": {member_id: req.body.member_id}}}, function(err){								 
				accepted_friend_user[0].update({$push: {friends: {"member_id": user[0].member_id, "friend_name": user[0].username, "profile_pic": user[0].user_profile[0].profilepic}}}, function(err){
					if(err) throw err;    				
					res.send(req.body); 
				});				
			});  
		});
	});
});
/*
router.post('/friend-requests', ensureAuthenticated, function(req, res){
	User.find({"email": req.user.email}, function(err, user){
		console.log(user);
		User.find({"member_id": req.body.member_id}, function(err, accepted_friend_user){
			console.log(accepted_friend_user);
			user[0].update({$push: {"friends": {"member_id": accepted_friend_user[0].member_id, "friend_name": accepted_friend_user[0].friend_name, "profile_pic": accepted_friend_user[0].profile_pic}}, $pull: {"friend_request": {member_id: req.body.member_id}}}).exec(function(err){
				accepted_friend_user[0].update({$push: {"friends": {"member_id": user[0].member_id, "friend_name": user[0].friend_name, "profile_pic": user[0].profile_pic}}}).exec(function(err){
					res.send(); 
				}); 
			});
		});  
	});
});
*/
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
} 

module.exports = router;