var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './dist/images' });
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');

var Post = require('../models/post');
var User = require('../models/user');
var Flag = require('../models/postflags');

var POSTS_RETURN_LIMIT = 5;

// Get Homepage
router.get('/', ensureAuthenticated, function (req, res) {
	User.findOne({ member_id: req.user.member_id }, function (err, user) {
		Post.aggregate([{ $lookup: { from: "users", localField: "author", foreignField: "member_id", as: "user_details" } }, { $match: { trashed: "N" } }, { $sort: {ispinned:-1, date: -1 } }, { $limit: POSTS_RETURN_LIMIT }]).exec(function (err, posts) {
			//	Post.find({trashed:"N"},function(err, posts){
			//console.log(req.user.user_profile[0].profilepic);
			//console.log(user);
			//if(err) throw err;
			//console.log(user.admin);
			res.render('index', { posts: posts, user: user.member_id, users: user, isApproved: user.isApproved, isAdmin: user.admin });
		});
	});
});

// Get request for infinite scrolling
router.get('/posts', ensureAuthenticated, function (req, res) {
	var page = parseInt(req.query.page, 10) || 1;

	User.findOne({ member_id: req.user.member_id }, function (err, user) {
		Post.aggregate([{ $lookup: { from: "users", localField: "author", foreignField: "member_id", as: "user_details" } }, { $match: { trashed: "N" } }, { $sort: { date: -1 } }, { $skip: ( (page - 1) * POSTS_RETURN_LIMIT ) + (page > 1 ? 1 : 0) }, { $limit: POSTS_RETURN_LIMIT } ]).exec(function (err, posts) {
			res.send(JSON.stringify({ posts: posts }));
		});
	});
});


// Add Posts
router.post('/add', ensureAuthenticated,  upload.single('postimage'), function(req, res){	
	var description = req.body.description;	
	var	author = req.user.member_id;
	var date = new Date();
	if(req.file){
		var postimage = req.file.filename;
	}
	

	var newPost = new Post({						
		description: description,
		date: date,
		postimage: postimage,
		author: author		
	});

	Post.createPost(newPost, function(err, post){
		if(err) throw err;
		req.flash('success', 'Your post is published');
			res.redirect('/');					
	});
	 
});


// Pin Wall Posts
router.post('/pinpostwall', function(req, res){
    var post_id = req.body.post_id;
    var pin_value = req.body.pin_value;
     console.log(post_id);
    console.log(pin_value);    
    Post.update({post_id:post_id},{$set:{ispinned:pin_value}}, function(err, pinned){
     
        res.render('index', {isPinned: pinned});    
    });
});

// Forgot-Password template
router.get('/forgot-password', function (req, res) {
	//User.findOne({member_id:req.user.member_id}, function(err, user){
	//res.render('forgot-password/forgot-password',{isApproved: user.isApproved});
	res.render('forgot-password/forgot-password');
	//});
});



// Post forgot Password
router.post('/forgot-password', function (req, res, next) {
	async.waterfall([
		function (done) {
			crypto.randomBytes(20, function (err, buf) {
				var token = buf.toString('hex');
				done(err, token);
			});
		},
		function (token, done) {
			User.findOne({ email: req.body.email }, function (err, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/forgot-password');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
				console.log(user);

				user.save(function (err) {
					done(err, token, user);
				});
			});
		},
		function (token, user, done) {
			var smtpTransport = nodemailer.createTransport({
				host: "smtp.gmail.com",
				auth: {
					user: 'connect19test@gmail.com',
					pass: 'connect19@123'
				},
				tls: {
					rejectUnauthorized: false
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'connect19test@gmail.com',
				subject: 'Node.js Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					'http://' + req.headers.host + '/reset-password/' + token + '\n\n' +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n'
			};
			smtpTransport.sendMail(mailOptions, function (err) {
				console.log('mail sent');
				req.flash('success', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
		}
	], function (err) {
		if (err) return next(err);
		res.redirect('/forgot-password');
	});
});

// Get Password Reset Token
router.get('/reset-password/:token', function (req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
		if (!user) {
			req.flash('error', 'Password reset token is invalid or has expired.');
			return res.redirect('/forgot-password');
		}
		res.render('forgot-password/reset-password', { token: req.params.token });
	});
});

// Post Password Reset Token  
router.post('/reset-password/:token', function (req, res) {
	async.waterfall([
		function (done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function (err, user) {
				console.log(user);
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				}
				if (req.body.password === req.body.confirm) {
					//user.setPassword(req.body.password, function(err) {					
					user.resetPasswordToken = undefined;
					user.resetPasswordExpires = undefined;

					var password = req.body.password;

					bcrypt.genSalt(10, function (err, salt) {
						console.log(salt);
						bcrypt.hash(password, salt, function (err, hash) {
							//	console.log(hash);
							user.password = hash
							// Store hash in your password DB.

							//	user.update({$set:{password:hash}}, function (err, user) {
							//		console.log(user);
							//		req.flash('success_msg', 'Your password has been changed');
							//				req.logIn(user, function(err) {
							//		done(err, user);
							//				}); 
							//console.log(user);
							//console.log('3');
							//	});
							user.save({ password: hash }, function (err, user) {
								//	console.log(user);
								req.logIn(user, function (err) {
									done(err, user);
								});
							});
						});
					});
					//	user.save(function(err) {
					//		req.logIn(user, function(err) {
					//		done(err, user);
					//		});

					//	});
					//	})
				} else {
					req.flash("error", "Passwords do not match.");
					return res.redirect('back');
				}
			});
		},
		function (user, done) {
			var smtpTransport = nodemailer.createTransport({
				host: "smtp.gmail.com",
				auth: {
					user: 'connect19test@gmail.com',
					pass: 'connect19@123'
				},
				tls: {
					rejectUnauthorized: false
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'connect19test@gmail.com',
				subject: 'Your password has been changed',
				text: 'Hello,\n\n' +
					'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
			};
			smtpTransport.sendMail(mailOptions, function (err) {
				req.flash('success', 'Success! Your password has been changed.');
				done(err);
			});
		}
	], function (err) {
		res.redirect('/');
	});
});


/*
// Post flags
router.post('/', function (req, res) {
	Post.findOne({ 'post_id': req.body.flag_post_id }, function (err, post) {
		//console.log(post);
		post.update({ $push: { "flag": { "post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date } } }, function (err) {
			res.send();
		})
	});
});


// Get flags
router.get('/flags', ensureAuthenticated, function (req, res) {
	User.find({ username: req.user.username }, function (err, user) {
		//console.log(user[0].admin);
		Post.find({}, { flag: 1 }, function (err, posts) {
			//console.log(req.user.user_profile[0].profilepic);
			//console.log(posts);
			if (err) throw err;
			res.render('flags/index', { posts: posts, user: user[0].admin, users: user, isApproved: user[0].isApproved });
		});
	});
});

*/

// Post Flags
router.post('/', function(req, res){
		var flagid =  req.body.flag_post_id;
		var authorid = req.body.author_id;
		console.log(flagid);
		console.log(authorid);
		var newFlag = new Flag({						
			post_id: flagid,
			author_id:	authorid
		});
	
		Flag.createFlag(newFlag, function(err, flag){
			if(err) throw err;
			req.flash('success', 'Your post is published');
				res.redirect('/');					
		}); 

});



// Get Flags
router.get('/flags', ensureAuthenticated, function(req, res){
	User.find({username: req.user.username}, function(err, user){
	Flag.aggregate([{$lookup:{from:"posts",localField:"post_id", foreignField:"post_id", as:"post_details"}},{$sort:{date:-1}},{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"author_details"}}]).exec(function(err, posts){				
		console.log(posts);
		res.render('flags/index', {posts:posts, user: user[0].admin, users: user, isApproved: user[0].isApproved});					
	});
});
});


// Post Trash
router.post('/flags', function (req, res) {
	Post.findOne({ 'post_id': req.body.trash_post_id }, function (err, post) {
		console.log(post);
		post.update({ $set: { trashed: 'Y' }, $push: { "trash": { "post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date } }, $pull: { "flag": { post_id: req.body.trash_post_id } } }, function (err) {
			res.send();
		})
	});
});


// Get Trash
router.get('/trash', ensureAuthenticated, function (req, res) {
	User.find({ username: req.user.username }, function (err, user) {
		Post.find({}, function (err, posts) {
			//console.log(req.user.user_profile[0].profilepic);
			if (err) throw err;
			res.render('trash/index', { posts: posts, user: user[0].admin, users: user, isApproved: user[0].isApproved });
		});
	});
});

// Post Undo-Trash
router.post('/trash', function (req, res) {
	Post.findOne({ 'post_id': req.body.trash_post_id }, function (err, post) {
		//console.log(post);
		post.update({ $set: { trashed: 'N' }, $pull: { "trash": { post_id: req.body.trash_post_id } } }, function (err) {
			res.send();
		})
	});
});

// Delete-Trash Post
router.post('/trash/delete', function (req, res) {
	console.log(req.body.trashed_post_id);
	Post.remove({ 'post_id': req.body.trashed_post_id }, function (err, post) {
		res.send();
	});
});

// Router for Conference
router.get('/conference-schedule', ensureAuthenticated, function (req, res) {
	res.render('conference/index.hbs', { title: "Conferece Schedule" })
})

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}


module.exports = router;