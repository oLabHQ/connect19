var express = require('express');
var router = express.Router();

var User = require('../models/user');



// Get Users
router.get('/', ensureAuthenticated, function(req,res){    
	User.find({"email": {$ne: req.user.email}}, function(err, users){	 
		 if(err) throw err;	
		 //console.log(users[0].friend_requests[0].member_id)
		 //var friend_request_sent = users[0].friend_requests[0].member_id;
		 //console.log(friend_request_sent);
		 //res.render('friends/index', {user_friends: users, friend_request_sent : friend_request_sent});	
		 res.render('admin/index', {user_friends: users});	
 });
 });
 

 // Make admin
router.post('/', function(req, res){
	User.findOne({'member_id': req.body.admin_user_id}, function(err, user){		
		console.log(req.body.admin_user_id);
		var admin_value = req.body.admin_value;
		console.log(admin_value);
			user.update({$set:{admin: admin_value}}, function(err){
			res.send();
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