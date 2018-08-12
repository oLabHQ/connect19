var express = require('express');
var router = express.Router();

var Posts = require('../models/posts');


// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	Posts.find({},function(err, posts){
		console.log(posts);
		if(err) throw err;
		res.render('index', {posts:posts});			
	})
		
	
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