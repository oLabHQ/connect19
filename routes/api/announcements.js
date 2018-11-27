var express = require('express');
var router = express.Router();

var User = require('../../models/user');
var Announcement = require('../../models/announcement');


router.get('/', function(req, res){
    if (!req.query.member_id) {
        res.status(404).json({error: "Member Id Does not Exists"});
        return;
    }

	User.findOne({member_id: req.query.member_id}, function(err, user){
       // console.log(user);
		Announcement.aggregate([{$lookup:{from:"users",localField:"author", foreignField:"member_id", as:"user_details"}},{$project:{"user_details.password":0, "user_details.group_invitation":0, "user_details.friend_requests":0}}]).exec(function(err, announcement){            
        if(err) throw err;
        res.send(JSON.stringify({ announcements: announcement }));
		//res.render('announcement/index', {announcement:announcement, users: users, admin: users.admin, isApproved: users.isApproved});					
		});
	});
});

module.exports = router;