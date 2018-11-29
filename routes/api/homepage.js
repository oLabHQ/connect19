var express = require('express');
var router = express.Router();
var multer = require('multer');
var authenticateFirst = require('../../utilities/auth').authenticateFirst;
var Post = require('../../models/post');
var User = require('../../models/user');

var POSTS_RETURN_LIMIT = 5;


router.get('/', authenticateFirst, function (req, res) {
    User.findOne({ member_id: req.user.member_id}, function (err, user) {
        Post.aggregate([{ $lookup: { from: "users", localField: "author", foreignField: "member_id", as: "user_details" } }, { $match: { trashed: "N" } }, { $sort: { date: -1 } }, { $limit: POSTS_RETURN_LIMIT }]).exec(function (err, posts) {
            var homepageData = {
                posts: posts,
                // user: user.member_id,
                // users: user,
                // isApproved: user.isApproved,
                // isAdmin: user.admin
            };

            res.send(JSON.stringify(homepageData));
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