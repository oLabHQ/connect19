var express = require('express');
var router = express.Router();

var User = require('../../models/user');

// Get Users
router.get('/', function(req,res){   
    if (!req.query.member_id) {
        res.status(404).json({error: "Member Id Does not Exists"});
        return;
    } 
	User.findOne({member_id:req.query.member_id}, function(err, user){   		
        User.find({"member_id": {$ne: req.query.member_id}},{"password":0, "group_invitation":0, "friend_requests":0}, function(err, users){	
            if(err) throw err;	
        var userData = {
            user: user,
            users:users
        }
        res.send(JSON.stringify({ users: userData }));
		//res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
   });
});
});

// Get User By Username

router.get('/username', function(req,res){
    if (!req.query.username) {
        res.status(404).json({error: "Username Does not Exists"});
        return;
    } 
        User.find({"username": {$ne: req.query.username}},{"password":0, "group_invitation":0, "friend_requests":0}, function(err, users){	
        console.log(users);
            if(err) throw err;
        var userData = {
            users:users
        }
        res.send(JSON.stringify({ user: userData }));
		//res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
   });
});


module.exports = router;