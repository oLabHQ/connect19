var express = require('express');
var router = express.Router();

var User = require('../../models/user');



// Get friends list
router.get('/', function(req, res){
    if (!req.query.member_id) {
        res.status(404).json({error: "Member Id does not Exists"});
        return;
    } 
    var user_id = req.query.member_id;
	
	User.aggregate([{$unwind: "$friends"},{$lookup:{from:"users",localField:"friends", foreignField:"member_id", as:"user_details"}},{$match:{member_id:user_id}},{$project:{"user_details.isApproved": 1, "user_details.username": 1,"user_details.member_id": 1,"username":1, "member_id":1}}]).exec(function(err, friends){                
        if(err) throw err;    
        var friends = {
                friends: friends
            }
        res.send(JSON.stringify({ friends: friends }));
		//res.render('friends/index',{user:users, users: user, isApproved: user.isApproved})
		});	
});



// Post friend Request
router.post('/send-friend-request', function(req, res){
    //console.log(req.payload);
    var sender_user_id = req.body.sender_member_id;
    var receiver_user_id = req.body.receiver_member_id;

	User.findOne({"member_id": sender_user_id}, function(err, sending_user){ 
		if(err) throw err;		
		User.findOne({"member_id": receiver_user_id}, function(err, potential_friend){
		//	console.log(potential_friend);
			if(err) throw err;			
			
			potential_friend.update({$push: {"friend_requests": sending_user.member_id}}).exec(function(err, friend_requests){
                //console.log(friend_requests);
                res.send(JSON.stringify({ friendrequests: friend_requests }));
            })				
			
					//res.send({memberid: potential_friend[0].friend_requests[0].member_id});
		});
	});
});

// Pending Requests
router.get('/friend-requests', function(req, res){
	User.findOne({member_id:req.query.member_id}, function(err, user){        
        var user_id = req.query.member_id;    
	//User.findOne({username:req.user.username}, function(err, friendrequests){	
	User.aggregate([{$unwind: "$friend_requests"},{$lookup:{from:"users",localField:"friend_requests", foreignField:"member_id", as:"user_details"}},{$match:{member_id:user_id}},{$project:{"user_details.username":1, "user_details.member_id":1, "user_details.user_profile":1, "user_details.isApproved":1, }}]).exec(function(err, friendrequests){		
        if(err) throw err;
        var friendrequests = {
            friendrequests: friendrequests,
            isApproved:user.isApproved
        }
        res.send(JSON.stringify({ friendrequests: friendrequests }));
		//res.render('friends/pendingrequests', {friendrequests: friendrequests.friend_requests});
		//res.render('friends/pendingrequests', {friendrequests: friendrequests, users: user, isApproved: user.isApproved});
	});
});
});



module.exports = router;