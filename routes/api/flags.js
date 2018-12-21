var express = require('express');
var router = express.Router();
var multer = require('multer');
var authenticateFirst = require('../../utilities/auth').authenticateFirst;

var Post = require('../../models/post');
var User = require('../../models/user');
var Flag = require('../../models/postflags');
var Group = require('../../models/group');
var Groupposts = require('../../models/groupposts');
var Grouppostflags = require('../../models/grouppostflags');

// Get Wall Post Flags
router.get('/wallflags', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    Flag.aggregate([{ $lookup: { from: "posts", localField: "post_id", foreignField: "post_id", as: "flag_details" } }, { $lookup: { from: "users", localField: "author_id", foreignField: "member_id", as: "author_details" } }, { $lookup: { from: "users", localField: "flagged_by", foreignField: "member_id", as: "flag_author_details" } }, { $project: { "flag_author_details.username": 1, "flag_author_details.firstname": 1, "flag_author_details.lastname": 1, "flag_details": 1, "author_details.username": 1, "author_details.firstname": 1, "author_details.lastname": 1, "author_details.user_profile": 1, "postimage": 1 } }, { $sort: { "flag_details.date": -1 } }]).exec(function (err, flags) {
        if (err) {
            res.status(500).send({ success: false, msg: "Unable to get Flag posts." });
        } else {
            res.send(JSON.stringify({ success: true, flags: flags }));
        }
    });
});

// Delete Wall Post Flag
router.post('/delete-flag', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id || !req.user.admin) {
        res.status(404).json({ success: false, msg: "Error: User Does not Exists or not an admin!" });
        return;
    }

    if (!req.body.flagId) {
        res.status(404).json({ success: false, msg: "Error: flagId is empty." });
        return;
    }

    Flag.remove({ '_id': req.body.flagId }, function (err, deletedFlag) {
        if (deletedFlag && !err) {
            res.json({ success: true, msg: 'Post Deleted', deletedFlag: deletedFlag });
        } else {
            res.status(500).send({ success: false, msg: 'Not able to delete flagged post' });
        }
    });
});


// Post Wall Flags
router.post('/', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    var flagid = req.body.post_id;
    var authorid = req.body.author_id;
    var flaggedBy = req.body.flagged_by;
    var newFlag = new Flag({
        post_id: flagid,
        author_id: authorid,
        flagged_by: flaggedBy
    });

    Post.findOne({ "post_id": flagid }, function (err, post) {
        var initialFlaggedValue = post.isFlagged;
        console.log("POST ISFLAGGED: ", post.isFlagged);
        if (post) {
            post.update({ $set: { isFlagged: true } }, { new: true }, function (err, post) {
                if (initialFlaggedValue == false) { // Only create a new flag if the post is previously unflagged
                    Flag.createFlag(newFlag, function (err, flag) {
                        if (err) {
                            res.status(500).send({ success: false, msg: "Unable Flag posts." });
                        } else {
                            res.send(JSON.stringify({ success: true, msg: "Post Flagged.", flag: flag }));
                        }
                    });
                }
            });
        } else {
            res.status(500).send({ success: false, msg: "Unable find post." });
        }
    });
});

// Undo flag post
router.post('/undoflag', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    var flagid = req.body.post_id;
    Post.findOneAndUpdate({ "post_id": flagid }, { $set: { isFlagged: false } }, { new: true }, function (err, post) {
        if (err) {
            res.status(500).send({ success: false, msg: "Server error. Please try again." });
            return;
        }

        Flag.findOneAndDelete({ "post_id": flagid }, function (err, post) {
            if (err) {
                res.status(500).send({ success: false, msg: "Unable to UnFlag posts." });
            } else {
                res.send(JSON.stringify({ success: true, msg: "Post unflagged", post: post }));
            }
        });
    });
});

// Group Flags
router.post('/group-flag-post', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User id should not be empty" });
        return;
    }

    var flagid = req.body.post_id;
    var authorid = req.body.author_id;
    var groupid = req.body.group_id;

    var newGroupPostFlag = new Grouppostflags({
        post_id: flagid,
        author_id: authorid,
        group_id: groupid
    });

    Groupposts.findOne({ "post_id": flagid }, function (err, post) {
        var initialFlaggedValue = post.isFlagged;
        if (post) {
            post.update({ $set: { 'isFlagged': true } }, { new: true }, function (err, post) {
                console.log("POST UPDATED!", JSON.stringify(post));

                if (initialFlaggedValue == false || initialFlaggedValue == undefined) { // Only create a new flag if the post is previously unflagged
                    Grouppostflags.createGroupPostFlag(newGroupPostFlag, function (err, flag) {
                        if (err) {
                            res.status(500).send({ success: false, msg: "Unable Flag post." });
                        } else {
                            res.send(JSON.stringify({ success: true, msg: "Post Flagged.", flag: flag }));
                        }
                    });
                }
            });
        } else {
            res.status(500).send({ success: false, msg: "Unable find post." });
        }
    });
});

// Undo flag group post
router.post('/group-post-undoflag', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    var flagid = req.body.post_id;
    Groupposts.findOneAndUpdate({ "post_id": flagid }, { $set: { 'isFlagged': false } }, { new: true }, function (err, post) {
        if (err) {
            res.status(500).send({ success: false, msg: "Server error. Please try again." });
            return;
        }

        Grouppostflags.findOneAndDelete({ "post_id": flagid }, function (err, post) {
            if (err) {
                res.status(500).send({ success: false, msg: "Unable to UnFlag Group post." });
            } else {
                res.send(JSON.stringify({ success: true, msg: "Group post unflagged", post: post }));
            }
        });
    });
});


// Get Group Post flags
router.get('/group-post-flags', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Id Empty" });
        return;
    }

    var groupId = req.query.groupId;

    Groupposts.aggregate([{ "$match": { "group_id": groupId } }, { $lookup: { from: "groupposts", localField: "post_id", foreignField: "post_id", as: "flag_details" } }, { $lookup: { from: "users", localField: "author_id", foreignField: "member_id", as: "author_details" } }, { $project: { "flag_author_details.username": 1, "flag_author_details.firstname": 1, "flag_author_details.lastname": 1, "flag_details": 1, "author_details.username": 1, "author_details.firstname": 1, "author_details.lastname": 1, "author_details.user_profile": 1, "postimage": 1 } }, {$match: {"flag_details.isFlagged": true}}, { $sort: { "flag_details.date": -1 } }]).exec(function (err, posts) {
        if (err) {
            res.status(500).send({ success: false, msg: "Unable to get Group Flag posts." });
        } else {
            res.send(JSON.stringify({ success: true, grouppostflags: posts }));
        }
    });
});


// Delete Wall Post Group Flag
router.post('/group-delete-flag-post', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id || !req.user.admin) {
        res.status(404).json({ success: false, msg: "Error: User Does not Exists or not an admin!" });
        return;
    }

    if (!req.body.flagId) {
        res.status(404).json({ success: false, msg: "Error: flagId is empty." });
        return;
    }

    Grouppostflags.remove({ '_id': req.body.flagId }, function (err, deletedFlag) {
        if (deletedFlag && !err) {
            res.json({ success: true, msg: 'Post Deleted', deletedFlag: deletedFlag });
        } else {
            res.status(500).send({ success: false, msg: 'Not able to delete flagged post' });
        }
    });
});




module.exports = router;