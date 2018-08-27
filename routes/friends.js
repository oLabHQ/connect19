var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');


// Get Users
router.get('/', ensureAuthenticated, function(req,res){    
   User.find({"email": {$ne: req.user.email}}, function(err, users){
        //console.log(users.user_profile);
        res.render('friends/index', {user_friends: users, user_profile: users.user_profile});
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