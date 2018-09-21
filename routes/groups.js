var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });




var User = require('../models/user');
var Group = require('../models/group');


// Get Groups
router.get('/', ensureAuthenticated, function(req,res){    
    Group.find({}, function(err, group){
        //console.log(group);
        if(err) throw err;
        res.render('groups/index', {group: group});
    });    
});


// Create Group
router.post('/', ensureAuthenticated, function(req, res){	
    var title = req.body.title;
    var description = req.body.description;	
    var date = new Date();
    
    console.log(title);
    console.log(description);
    console.log(date);
    
    // validation
    req.checkBody('title', 'Title is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        Group.find({}, function(err, group){
		res.render('groups', {
            errors: errors,
            group: group
        });
    });
	}
	else {
        Group.findOne({groupname: { "$regex": "^" + title + "\\b", "$options": "i"}}, function(err, groupname){
            //console.log(groupname)
            if(groupname){
                Group.find({}, function(err, group){
                res.render("groups", {groupname: groupname, group: group})
                });
            }else{

                var newGroup = new Group({
                    groupname: title,					
                    description: description,
                    date: date,		
                    createdby: req.user.username,
                });
        
                Group.createGroup(newGroup, function(err, group){
                    if(err) throw err;
                });
                    req.flash('success', 'Your Group is published');
                    res.redirect('/groups');

            }
        });
    }
});



router.get('/:id', ensureAuthenticated, function(req, res){    
    Group.find({group_id: req.params.id}, function(err, posts){
        console.log(posts);
        res.render("groups/posts", {posts: posts});
    })
});




router.post('/addposts', ensureAuthenticated,  upload.single('postimage'), function(req, res){	
    console.log("hi");
	
	if(req.file){
		var postimage = req.file.filename;
	}
	

    var description = req.body.description;	
	var date = new Date();		
	var postimage = postimage;
    var	author = req.user.username;
    var groupid = req.body.groupid;
	var authorpic = req.user.user_profile[0].profilepic;
	

	Group.update({group_id:groupid },{$push: {"group_posts": {"description": description, "postimage": postimage, "author": author, "authorpic": authorpic}}}, function(err){
        if(err) throw err;
        console.log('updated the data')
    res.redirect("/groups/"+groupid); 
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