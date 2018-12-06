var express = require('express');
var router = express.Router();
var multer = require('multer');

var Post = require('../../models/post');
var User = require('../../models/user');
var Group = require('../../models/group');
var Trash = require('../../models/posttrash');
var Groupposts = require('../../models/groupposts');
var GroupPostTrash = require('../../models/groupposttrashs');


// Get Wall Post Trash
router.get('/walltrashs', function(req, res){
    if (!req.query.member_id) {
        res.status(404).json({error: "Member Id Does not Exists"});
        return;
    }

	User.findOne({member_id: req.query.member_id}, function(err, user){
        console.log(user);
	Trash.aggregate([{$lookup:{from:"posts",localField:"post_id", foreignField:"post_id", as:"trash_details"}},{$sort:{date:-1}},{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"author_details"}},{$project:{"author_details.password":0, "author_details.group_invitation":0, "author_details.friend_requests":0}}]).exec(function(err, trashs){				
        //console.log(posts);
        var flagData = {
            trashPosts:trashs            
        };
		res.send(JSON.stringify(flagData));					
	});
});
});


// Get Group Post Trash
router.get('/:id/trash', function(req, res){
    console.log(req.query.member_id);
    console.log(req.params.id);
    User.findOne({member_id:req.query.member_id},{username:1, user_profile:1, admin:1, isApproved:1}, function(err, user){
        Group.find({group_id: req.params.id}, function(err, createdby){
            //console.log(createdby[0].createdby); 
            //GroupPostTrash.find({group_id: req.params.id}, function(err, posts){
               // GroupPostTrash.aggregate([{$lookup:{from:"groupposts",localField:"post_id", foreignField:"post_id", as:"trash_details"}},{$lookup:{from:"users",localField:"createdby", foreignField:"member_id", as:"user_details"}},{$match:{group_id:req.params.id}}]).exec(function(err, posts){
                GroupPostTrash.aggregate([{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"user_details"}},{$lookup:{from:"groupposts",localField:"post_id", foreignField:"post_id", as:"post_details"}},{$match:{group_id:req.params.id}}]).exec(function(err, posts){
                    if(err) throw err;
               console.log(posts);      
               var groupposttrash = {
                posts: posts, 
                user: user
            }
                    if (err) {
                        res.status(500).send({success: false, msg: "Unable to get Group Flag posts."});        
                    } else {
                        res.send(JSON.stringify({ success: true, groupposttrash: groupposttrash }));            
                    }   
                    // res.render("groups/trash", {posts: posts, createdby:createdby[0].createdby, user:user.member_id, users: user, isApproved: user.isApproved});
            });    
        });
    });
});


module.exports = router;