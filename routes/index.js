var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });

var Post = require('../models/post');


// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	Post.find({},function(err, posts){
		//console.log(posts);
		if(err) throw err;
		res.render('index', {posts:posts, username: req.user.username });			
	})
});

router.post('/add', ensureAuthenticated,  upload.single('postimage'), function(req, res){	
	var description = req.body.description;	
	var date = new Date();
	if(req.file){
		var postimage = req.file.filename;
	}
	

	var newPost = new Post({						
		description: description,
		date: date,
		postimage: postimage,
		author: req.user.username
	});

	Post.createPost(newPost, function(err, post){
		if(err) throw err;
		req.flash('success', 'Your post is published');
			res.redirect('/');					
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