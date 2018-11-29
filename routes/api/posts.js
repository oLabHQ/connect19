var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './dist/images' });
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');
var authenticateFirst = require('../../utilities/auth').authenticateFirst;

var Post = require('../../models/post');
var User = require('../../models/user');

var POSTS_RETURN_LIMIT = 5;

router.get('/', authenticateFirst, function (req, res) {
	var page = parseInt(req.query.page, 10) || 1;
	console.log("Got Page: ", req.query.page);
	User.findOne({ member_id: req.user.member_id }, function (err, user) {
		Post.aggregate([{ $lookup: { from: "users", localField: "author", foreignField: "member_id", as: "user_details" } }, { $match: { trashed: "N" } }, { $sort: { date: -1 } }, { $skip: ( (page - 1) * POSTS_RETURN_LIMIT ) + (page > 1 ? 1 : 0) }, { $limit: POSTS_RETURN_LIMIT } ]).exec(function (err, posts) {
			//console.log(JSON.stringify({ posts: posts }))
			res.send(JSON.stringify({ posts: posts }));
		});
	});
});


// Add Posts
router.post('/add', function(req, res){	
	var description = req.body.description;	
	var	author = req.body.member_id;
	var date = new Date();
	
	

	var newPost = new Post({						
		description: description,
		date: date,		
		author: author		
	});

	res.send(JSON.stringify({ post: newPost }));
	 
});


// Delete-Trash Post
router.post('/delete', function (req, res) {
	Post.remove({ 'post_id': req.body.post_id }, function (err, deletePost) {
		console.log(deletePost);
		res.send(JSON.stringify({ post: deletePost }));
	});
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.status(403).json({error: "Access Denied"});
	}
}

module.exports = router;