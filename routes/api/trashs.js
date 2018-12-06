var express = require('express');
var router = express.Router();
var multer = require('multer');
var authenticateFirst = require('../../utilities/auth').authenticateFirst;

var Post = require('../../models/post');
var User = require('../../models/user');
var Group = require('../../models/group');
var Trash = require('../../models/posttrash');
var Groupposts = require('../../models/groupposts');
var Groupposttrash = require('../../models/groupposttrashs');



// Get Wall Post Flags
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




// Group Post Trash
router.post('/:id/trash', function(req, res){
          
    var flagid =  req.body.post_id;
    var authorid = req.body.author_id;
    var groupid = req.params.id;
       
    var newGroupPostTrash = new Groupposttrash({						
        post_id: flagid,
        author_id:	authorid,
        group_id: groupid
    });

    Groupposttrash.createGrouppostTrash(newGroupPostTrash, function(err, trash){
        Groupposts.findOneAndUpdate({post_id:flagid},{$set: {"trashed":"Y"}}, function(err){
            if(err) throw err;
            if (err) {
                res.status(500).send({success: false, msg: "Unable Trash posts."});        
            } else {
                res.send(JSON.stringify({ success: true}));            
            }     	
        });
    }); 
});



// Get specific Group  Trash Posts
router.get('/:id/trash', function(req, res){
    User.findOne({member_id:req.query.member_id}, function(err, user){
    Group.findOne({group_id: req.params.id}, function(err, createdby){
        //Groupposts.find({group_id: req.params.id}, function(err, posts){
            Groupposttrash.aggregate([{$lookup:{from:"groupposts",localField:"post_id", foreignField:"post_id", as:"trash_details"}},{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"user_details"}},{$match:{group_id:req.params.id}},{$project:{"user_details.password":0, "user_details.group_invitation":0, "user_details.friend_requests":0, "user_details.friends":0}}]).exec(function(err, posts){
                console.log(posts);     
                var trashposts = {
                    posts: posts, 
                    createdby: createdby.createdby,
                    isApproved: user.isApproved
                }
                if (err) {
                    res.status(500).send({success: false, msg: "Unable to get Group Trash posts."});        
                } else {
                    res.send(JSON.stringify({ success: true, trashposts: trashposts }));            
                }       
            });     
        });
    });
});


// Group Post Undo-Trash
router.post('/:id/undotrash', function(req, res){
    var post_id = req.body.post_id;			
		Groupposttrash.deleteOne({post_id: post_id}, function(err, trashpost){         
            Groupposts.findOneAndUpdate({'post_id': post_id}, {$set:{trashed: 'N'}}, function(err){                   
                if (err) {
                    res.status(500).send({success: false, msg: "Unable to undo Group Trash posts."});        
                } else {
                    res.send(JSON.stringify({ success: true}));
                }   
            });
        });
    });
    

    
// Delete Group Trash Post
router.post('/:id/delete', function(req, res){
	//console.log(req.body.trashed_post_id);
    Groupposttrash.remove({'post_id': req.body.post_id}, function(err, groupposttrash){
        Groupposts.remove({'post_id': req.body.post_id}, function(err, post){
            if (err) {
                res.status(500).send({success: false, msg: "The Group post has been deleted"});        
            } else {
                res.send(JSON.stringify({ success: true}));
            }   
        });
    });
});

module.exports = router;