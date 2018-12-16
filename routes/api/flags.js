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
router.get('/wallflags', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
	}
	Flag.aggregate([{$lookup:{from:"posts",localField:"post_id", foreignField:"post_id", as:"flag_details"}},  { $sort:{ date:-1 } }, { $lookup : { from : "users", localField : "author_id", foreignField : "member_id", as:"author_details" } }, { $project : { "flag_details" : 1, "author_details.username" : 1, "author_details.user_profile" : 1 } }]).exec(function(err, flags){
        //console.log(posts);
        var flagData = {
            posts:flags
        };
        if (err) {
            res.status(500).send({success: false, msg: "Unable to get Flag posts."});
        } else {
            res.send(JSON.stringify({ success: true, flagData: flagData }));
        }
    });
});


// Post Wall Flags
router.post('/', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
	}
    var flagid =  req.body.post_id;
    var authorid = req.body.author_id;
    var flaggedBy = req.body.flagged_by;
    var flaggedValue = req.body.flagVal;
    var newFlag = new Flag({
        post_id: flagid,
        author_id:	authorid,
        flagged_by: flaggedBy
    });
    Post.findOneAndUpdate({ "post_id" : flagid },{ $set : { isFlagged : flaggedValue }}, {new: true}, function(err, post){
    Flag.createFlag(newFlag, function(err, flag){
        if(err) throw err;
            if (err) {
                res.status(500).send({ success: false, msg: "Unable Flag posts." });
            } else {
                res.send(JSON.stringify({ success: true, msg: "Post Flagged.", flag: flag }));
            }
        });
    });

});

// Undo flag post
router.post('/undoflag', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
	}
    var flagid =  req.body.post_id;
    var flaggedValue = req.body.flagVal;
    Post.findOneAndUpdate({ "post_id" : flagid },{ $set : { isFlagged : flaggedValue }}, {new: true}, function(err, post){
        if(err) throw err;
        Flag.findOneAndDelete({ "post_id": flagid }, function (err, post) {
            if(err) throw err;
            if (err) {
                res.status(500).send({success: false, msg: "Unable to UnFlag posts."});
            } else {
                res.send(JSON.stringify({ success: true, msg: "Post unflagged", post: post }));
            }
        });
    });
});


// Get Group Post flags
router.get('/:id/grouppostflags',authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
	}
    User.findOne({ member_id:member_id }, function(err, user){
    Group.find({ group_id: req.params.id }, function(err, createdby){
        //Groupposts.find({group_id: req.params.id}, function(err, posts){
            Groupposts.aggregate([{ $lookup:{ from : "users", localField : "createdby", foreignField : "member_id", as : "user_details" } }, { $match:{ group_id:req.params.id  } }, { $project : { group_id:1, flag : 1 , user_details : 1 } }]).exec(function(err, posts){
                console.log(posts);
                var grouppostflags = {
                    posts: posts,
                }
                if (err) {
                    res.status(500).send({success: false, msg: "Unable to get Group Flag posts."});
                } else {
                    res.send(JSON.stringify({ success: true, grouppostflags: grouppostflags }));
                }
        });
    });
    });
});


// Group Post flags
router.post('/:id', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
	}
    var flagid =  req.body.post_id;
    var authorid = req.body.author_id;
    var groupid = req.params.id;

    var newGroupPostFlag = new Grouppostflags({
        post_id: flagid,
        author_id:	authorid,
        group_id: groupid
    });

    Grouppostflags.createGroupPostFlag(newGroupPostFlag, function(err){
        if(err) throw err;
        if (err) {
            res.status(500).send({success: false, msg: "Unable Flag posts."});
        } else {
            res.send(JSON.stringify({ success: true }));
        }
    });
});




module.exports = router;