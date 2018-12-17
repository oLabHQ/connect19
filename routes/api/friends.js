var express = require('express');
var router = express.Router();
var authenticateFirst = require('../../utilities/auth').authenticateFirst;
var User = require('../../models/user');



// Get friends list
// router.get('/', function(req, res){
// 	User.aggregate([{$unwind: "$friends"},{$lookup:{from:"users",localField:"friends", foreignField:"member_id", as:"user_details"}},{$match:{member_id:user_id}},{$project:{"user_details.isApproved": 1, "user_details.username": 1,"user_details.member_id": 1,"username":1, "member_id":1}}]).exec(function(err, friends){                
//         if(err) throw err;    
//         var friends = {
//                 friends: friends
//             }
//         res.send(JSON.stringify({ friends: friends }));
// 		//res.render('friends/index',{user:users, users: user, isApproved: user.isApproved})
// 		});	
// });

router.get('/', authenticateFirst, function (req, res) {
    User.aggregate([{ $unwind: "$friends" }, { $lookup: { from: "users", localField: "friends", foreignField: "member_id", as: "user_details" } }, { $match: { member_id: req.user.member_id } }, { $project: { "user_details.isApproved": 1, "user_details.username": 1, "user_details.member_id": 1, "user_details.user_profile.profilepic": 1, "user_details.user_profile.description": 1, "username": 1, "member_id": 1 } }]).exec(function (err, friends) {
        if (err) {
            res.status(500).send(JSON.stringify({ success: false, msg: "Error Getting Friends." }));
        } else {
            res.send(JSON.stringify({ success: true, friends: friends }));
        }
        //res.render('friends/index',{user:users, users: user, isApproved: user.isApproved})
    });
});



// Post friend Request
router.post('/send-friend-request', authenticateFirst, function (req, res) {
    var sender_user_id = req.user.member_id;
    var receiver_user_id = req.body.receiver_member_id;
    console.log(sender_user_id);
    console.log(receiver_user_id);

    User.findOne({ "member_id": sender_user_id }, function (err, sending_user) {
        if (err) {
            res.status(500).send({ success: false, msg: "Server error. Please try again." });
            return;
        }
        console.log(sending_user);
        User.findOne({ "member_id": receiver_user_id }, function (err, potential_friend) {
            console.log(potential_friend);
            if (err) {
                res.status(500).send({ success: false, msg: "Server error. Please try again." });
                return;
            }

            sending_user.update({ $push: { "friend_requests_sent": receiver_user_id } }).exec(function (err, friend_requests_sent) {
                //   console.log(friend_requests_sent);
                potential_friend.update({ $push: { "friend_requests": sending_user.member_id } }).exec(function (err, friend_requests) {
                    //console.log(friend_requests);
                    res.send(JSON.stringify({ friendrequests: friend_requests, friend_requests_sent: friend_requests_sent }));
                });
            });
        });
    });
});

// Pending Requests
// On Accept Friend Request should delete friend request for both records
router.get('/friend-requests', authenticateFirst, function (req, res) {
    User.findOne({ member_id: req.user.member_id }, function (err, user) {
        //User.findOne({username:req.user.username}, function(err, friendrequests){	
        User.aggregate([{ $unwind: "$friend_requests" }, { $lookup: { from: "users", localField: "friend_requests", foreignField: "member_id", as: "user_details" } }, { $match: { member_id: req.user.member_id } }, { $project: { "user_details.username": 1, "user_details.member_id": 1, "user_details.user_profile": 1, "user_details.isApproved": 1, } }]).exec(function (err, friendrequests) {
            if (err) {
                res.status(500).send({ success: false, msg: "Unable to retrieve friend requests. Please try again" });
            } else {
                res.send(JSON.stringify({ success: true, friendrequests: friendrequests }));
            }
            //res.render('friends/pendingrequests', {friendrequests: friendrequests.friend_requests});
            //res.render('friends/pendingrequests', {friendrequests: friendrequests, users: user, isApproved: user.isApproved});
        });
    });
});


// Accept Friend request
router.post('/accept-friend-request', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    var other_member_id = req.body.other_member_id;
    User.find({ 'member_id': member_id }, function (err, user) {
        //console.log(user);
        User.find({ "member_id": other_member_id }, function (err, accepted_friend_user) {
            user[0].update({ $push: { friends: accepted_friend_user[0].member_id }, $pull: { "friend_requests_sent": other_member_id, "friend_requests": other_member_id } }, function (err) {
                accepted_friend_user[0].update({ $push: { friends: user[0].member_id }, $pull: { "friend_requests_sent": user[0].member_id, "friend_requests": user[0].member_id } }, function (err) {
                    if (err) {
                        res.status(500).send({ success: false, msg: "Unable to accept friend request." });
                        return;
                    } else {
                        res.json({ success: true, msg: "Accepted friend request!" });
                        return;
                    }
                });
            });
        });
    });
});

// Remove Friend Request
router.post('/remove-friend-request', authenticateFirst, function (req, res) {
    var sentUser = req.body.other_member_id
    var member_id = req.user.member_id
    User.findOne({ 'member_id': member_id }, function (err, user) {
        User.findOne({ 'member_id': sentUser }, function (err, sentuser) {
            user.updateOne({ $pull: { "friend_requests": sentUser } }, function (err) {
                if (err) {
                    res.status(500).send({ success: false, msg: "Server error. Please try again." });
                    return;
                }

                sentuser.updateOne({ $pull: { 'friend_requests_sent': member_id } }, function (err) {
                    if (err) {
                        res.status(500).send({ success: false, msg: "Unable to remove friend request." });
                        return;
                    } else {
                        res.json({ success: true, msg: 'Removed friend successfully' });
                        return;
                    }
                });
            });
        });
    });
});


module.exports = router;