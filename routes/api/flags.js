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
router.get('/wallflags', function(req, res){      
        //console.log(user);             
	Flag.aggregate([{$lookup:{from:"groupposts",localField:"post_id", foreignField:"post_id", as:"flag_details"}},{$sort:{date:-1}},{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"author_details"}},{$project:{"flag_details":1, "author_details.username":1, "author_details.user_profile":1}}]).exec(function(err, flags){				
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
    var flagid =  req.body.post_id;
    var authorid = req.body.author_id;
    console.log(flagid);
    console.log(authorid);
    var newFlag = new Flag({						
        post_id: flagid,
        author_id:	authorid
    });

    Flag.createFlag(newFlag, function(err, flag){
        if(err) throw err;
        if (err) {
            res.status(500).send({success: false, msg: "Unable Flag posts."});        
        } else {
            res.send(JSON.stringify({ success: true, flag: flag }));            
        }     	
    }); 

});


// Get Group Post flags
router.get('/:id/grouppostflags', function(req, res){   
    User.findOne({member_id:req.query.member_id},{username:1, user_profile:1, admin:1, isApproved:1}, function(err, user){
    Group.find({group_id: req.params.id}, function(err, createdby){
      
        //Groupposts.find({group_id: req.params.id}, function(err, posts){
            Grouppostflags.aggregate([{$lookup:{from:"users",localField:"author_id", foreignField:"member_id", as:"user_details"}},{$lookup:{from:"groupposts",localField:"post_id", foreignField:"post_id", as:"post_details"}},{$match:{group_id:req.params.id}}]).exec(function(err, posts){
                console.log(posts);     
                var grouppostflags = {
                    posts: posts, 
                    user: user
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
router.post('/:id', function(req, res){     
    var flagid =  req.body.post_id;
    var authorid = req.body.author_id;
    var groupid = req.body.group_id;

    var newGrouppostFlag = new Grouppostflags({ 
        post_id: flagid,
        author_id:	authorid,
        group_id: groupid
    });

    Grouppostflags.createGrouppostFlag(newGrouppostFlag, function(err, flag){
        if(err) throw err;
        if (err) {
            res.status(500).send({success: false, msg: "Unable Flag posts."});        
        } else {
            res.send(JSON.stringify({ success: true, flag: flag }));            
        }     	
    }); 
});

module.exports = router;