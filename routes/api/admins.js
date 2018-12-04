var express = require('express');
var router = express.Router();
var authenticateFirst = require('../../utilities/auth').authenticateFirst;

var User = require('../../models/user');
var Post = require('../../models/post');


// Get Users
router.get('/', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.findOne({ "member_id": req.user.member_id }, function (err, user) {
		User.find({ "member_id": { $ne: req.user.member_id } }, { "username": 1, "member_id": 1, "user_profile.profilepic": 1, "user_profile.description": 1, "isApproved": 1, "admin": 1 }, function (err, users) {
			if (err) {
				res.status(500).send(JSON.stringify({ success: false, msg: "Error Getting Users." }));
			} else {
				res.send(JSON.stringify({ success: true, users: users }));
			}
		});
	});
});


// Make admin
router.post('/', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.findOne({ 'member_id': req.body.member_id }, function (err, user) {
		user.update({ $set: { admin: true } }, function (err) {
			if (err) {
				res.status(500).send({ success: false, msg: "Unable to make admin." });
				return;
			} else {
				res.send({ success: true });
				return;
			}
		});
	});
});

router.post('/revoke-admin', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.findOne({ 'member_id': req.body.member_id }, function (err, user) {
		user.update({ $set: { admin: false } }, function (err) {
			if (err) {
				res.status(500).send({ success: false, msg: "Unable to revoke admin." });
				return;
			} else {
				res.send({ success: true });
				return;
			}
		});
	});
});


// Approve User
router.post('/approve', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.findOne({ 'member_id': req.body.member_id }, function (err, user) {
		user.update({ $set: { isApproved: true } }, function (err) {
			if (err) {
				res.status(500).send({ success: false, msg: "Unable to Approve user." });
				return;
			} else {
				res.send({ success: true });
				return;
			}
		});
	});
});

// Revoke User Approval
router.post('/revoke-approval', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.findOne({ 'member_id': req.body.member_id }, function (err, user) {
		user.update({ $set: { isApproved: false } }, function (err) {
			if (err) {
				res.status(500).send({ success: false, msg: "Unable to revoke user approval." });
				return;
			} else {
				res.send({ success: true });
				return;
			}
		});
	});
});


// Delete User
router.delete('/delete-user', authenticateFirst, function (req, res) {
	if (!req.user.admin) {
		res.status(403).send({ success: false, msg: "You are not allowed to access this functionality." });
		return;
	}

	User.remove({ 'member_id': req.query.member_id }, function (err, user) {
		Post.remove({'author':req.query.member_id}, function(err, post){
			if (err) {
				res.status(500).send({ success: false, msg: "Unable to Delete user." });
				return;
			} else {
				res.send({ success: true });
				return;
			}
		});
	});
});

module.exports = router;
