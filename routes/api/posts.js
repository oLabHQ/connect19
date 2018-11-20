var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './dist/images' });
var async = require('async');
var nodemailer = require('nodemailer');
var crypto = require('crypto');
var bcrypt = require('bcryptjs');

var Post = require('../../models/post');
var User = require('../../models/user');

var POSTS_RETURN_LIMIT = 5;

router.get('/', ensureAuthenticated, function (req, res) {
	var page = parseInt(req.query.page, 10) || 1;

	User.findOne({ member_id: req.user.member_id }, function (err, user) {
		Post.aggregate([{ $lookup: { from: "users", localField: "author", foreignField: "member_id", as: "user_details" } }, { $match: { trashed: "N" } }, { $sort: { date: -1 } }, { $skip: ( (page - 1) * POSTS_RETURN_LIMIT ) + (page > 1 ? 1 : 0) }, { $limit: POSTS_RETURN_LIMIT } ]).exec(function (err, posts) {
			console.log(JSON.stringify({ posts: posts }))
			res.send(JSON.stringify({ posts: posts }));
		});
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