var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });


var User = require('../models/user');
var Announcement = require('../models/announcement');

router.get('/', ensureAuthenticated, function(req, res){
	User.find({member_id:req.user.member_id}, function(err, users){
		Announcement.aggregate([{$lookup:{from:"users",localField:"author", foreignField:"member_id", as:"user_details"}}]).exec(function(err, announcement){    				
		if(err) throw err;
		res.render('announcement/index', {announcement:announcement, users: users[0].member_id});					
		});
	});  
})


router.post('/addannouncement', ensureAuthenticated,  upload.single('announimage'), function(req, res){	
	var description = req.body.announdescription;
	var	author = req.user.member_id;
	var date = new Date();
	if(req.file){
		var announcementimage = req.file.filename;
	}
	

	var newAnnouncement = new Announcement({						
		description: description,
		date: date,
		image: announcementimage,
		author: author	
	});  

	Announcement.createAnnouncement(newAnnouncement, function(err, announcement){
		console.log(announcement);
		if(err) throw err;
		req.flash('success', 'Your post is published');
			res.redirect('/announcement');					
	});
	 
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

module.exports = router;