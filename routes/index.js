var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });

var Post = require('../models/post');
var User = require('../models/user');


// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	Post.find({trashed:"N"},function(err, posts){
		//console.log(req.user.user_profile[0].profilepic);
		if(err) throw err;
		res.render('index', {posts:posts, profilepic: req.user.user_profile[0].profilepic});					
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
		author: req.user.username,
		authorpic: req.user.user_profile[0].profilepic
	});

	Post.createPost(newPost, function(err, post){
		if(err) throw err;
		req.flash('success', 'Your post is published');
			res.redirect('/');					
	});
	 
});


// Post flags
router.post('/', function(req, res){
	Post.findOne({'post_id': req.body.flag_post_id}, function(err, post){
		//console.log(post);
		post.update({$push: {"flag": {"post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date}}}, function(err){
			res.send();
		})
	});
});
  

// Get flags
router.get('/flags', ensureAuthenticated, function(req, res){				
	User.find({username: req.user.username}, function(err, user){
		//console.log(user[0].admin);   
		Post.find({},function(err, posts){ 
			//console.log(req.user.user_profile[0].profilepic);
			if(err) throw err;
			res.render('flags/index', {posts:posts, user: user[0].admin});					
		});
	});
});


// Post Trash
router.post('/flags', function(req, res){
	Post.findOne({'post_id': req.body.trash_post_id}, function(err, post){
		//console.log(post);
		post.update({$set:{trashed: 'Y'},$push: {"trash": {"post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date}}, $pull: {"flag": {post_id: req.body.trash_post_id}}}, function(err){
			res.send();
		})
	});
});


// Get Trash
router.get('/trash', ensureAuthenticated, function(req, res){
	User.find({username: req.user.username}, function(err, user){
		Post.find({},function(err, posts){
			//console.log(req.user.user_profile[0].profilepic);
			if(err) throw err;
			res.render('trash/index', {posts:posts, user: user[0].admin});
		});
	});
});

// Post Undo-Trash

router.post('/trash', function(req, res){
	Post.findOne({'post_id': req.body.trash_post_id}, function(err, post){
		//console.log(post);
		post.update({$set:{trashed: 'N'},$pull: {"trash": {post_id: req.body.trash_post_id}}}, function(err){
			res.send();
		})
	});
});

// Delete-Trash Post
router.post('/trash/delete', function(req, res){
	console.log(req.body.trashed_post_id);
	Post.remove({'post_id': req.body.trashed_post_id}, function(err, post){
		res.send();
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