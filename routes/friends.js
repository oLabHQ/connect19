var express = require('express');
var router = express.Router();
var mongo = require("mongodb").MongoClient;
var objectId = require('mongodb').ObjectID;
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


// Get Users
router.get('/users', ensureAuthenticated, function(req,res){    
	User.findOne({member_id:req.user.member_id}, function(err, user){
   		User.find({"email": {$ne: req.user.email}}, function(err, users){	 
		if(err) throw err;	
		//console.log(users[0].friend_requests[0].member_id)
		//var friend_request_sent = users[0].friend_requests[0].member_id;
		//console.log(friend_request_sent);
		//res.render('friends/index', {user_friends: users, friend_request_sent : friend_request_sent});			
		//console.log(user.friend_requests);
		console.log(user.friends)
		res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
   });
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
			
			potential_friend[0].update({$push: {"friend_requests": sending_user[0].member_id}}).exec()
					req.flash('success_msg', 'You have send friend request to ' +potential_friend[0].username);
					res.send(); 
					//res.send({memberid: potential_friend[0].friend_requests[0].member_id});
		});
	});
});

// Pending Requests
router.get('/friend-requests', ensureAuthenticated, function(req, res){
	User.findOne({member_id:req.user.member_id}, function(err, user){
	//User.findOne({username:req.user.username}, function(err, friendrequests){	
	User.aggregate([{$unwind: "$friend_requests"},{$lookup:{from:"users",localField:"friend_requests", foreignField:"member_id", as:"user_details"}},{$match:{member_id:req.user.member_id}}]).exec(function(err, friendrequests){
		//console.log(friendrequests);
		if(err) throw err;
		//res.render('friends/pendingrequests', {friendrequests: friendrequests.friend_requests});
		res.render('friends/pendingrequests', {friendrequests: friendrequests, users: user, isApproved: user.isApproved});
	});
});
});

// Accept friends requests
router.post('/friend-requests', ensureAuthenticated, function(req, res){
	User.find({'email': req.user.email}, function(err, user){
		//console.log(user);
		User.find({"member_id": req.body.member_id}, function(err, accepted_friend_user){
			console.log(req.body.member_id);
			console.log(accepted_friend_user);			
			user[0].update({$push: {friends: accepted_friend_user[0].member_id}, $pull: {"friend_requests":req.body.member_id}}, function(err){
				accepted_friend_user[0].update({$push: {friends: user[0].member_id}}, function(err){
					if(err) throw err;    				
					res.send(req.body); 
				});				
			});  
		});
	});
});


// Get friends list
router.get('/', ensureAuthenticated, function(req, res){
	User.findOne({member_id:req.user.member_id}, function(err, user){
		//console.log(friends);  
		//User.find({member_id:friends.friend[0].member_id}, function(err, friend){
		//console.log(friend);
	User.aggregate([{$unwind: "$friends"},{$lookup:{from:"users",localField:"friends", foreignField:"member_id", as:"user_details"}},{$match:{member_id:req.user.member_id}}]).exec(function(err, users){
		console.log(users);
		res.render('friends/index',{user:users, users: user, isApproved: user.isApproved})
		});
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