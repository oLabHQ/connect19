var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });




var User = require('../models/user');
var Group = require('../models/group');
var Groupposts = require('../models/groupposts');


// Get Groups
router.get('/', ensureAuthenticated, function(req,res){
    User.findOne({member_id:req.user.member_id}, function(err, user){
        //console.log(user.member_id)
    Group.find({}).sort({ispinned:-1}).exec(function(err, group){
        //console.log(group[0].createdby);
        console.log(group[0].ispinned)
        if(err) throw err;
        res.render('groups/index', {group: group, ispinned: group[0].ispinned, isprivate: group[0].isprivate, createdby: group[0].createdby, user: user.member_id, isadmin: user.admin});
    }); 
});
});


// Create Group
router.post('/', ensureAuthenticated, function(req, res){	
    var title = req.body.title;
    var description = req.body.description;
    var groupstatus = req.body.private;
    var date = new Date();
    
    // console.log(title);
    // console.log(description);
    // console.log(date);
    console.log(groupstatus);
    
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
                    isprivate: groupstatus,
                    date: date,		
                    createdby: req.user.member_id,
                    users_joined: req.user.member_id
                });
        
                Group.createGroup(newGroup, function(err, group){
                    if(err) throw err;
                });
                    req.flash('success', 'Your Group is published');
                    res.location('/groups'); 
                    res.redirect('/groups');

            }
        });
    }
});


// Pin Groups
router.post('/pingroup', function(req, res){
    var group_id = req.body.group_id;
    var pin_value = req.body.pin_value;
    // console.log(group_id);
    //console.log(pin_value);    
    Group.update({group_id:group_id},{$set:{ispinned:pin_value}}, function(err, group_pinned){
     // console.log(group_pinned);
        res.render('groups', {group_pinned: group_pinned});    
    });
});




// Get Group posts
/*
router.get('/:id', ensureAuthenticated, function(req, res){        
    Group.find({group_id: req.params.id}, function(err, posts){
        console.log(posts);
        res.render("groups/posts", {posts: posts});
    })
});
*/


// Get private Group join invitaion page
router.get('/:id/join',ensureAuthenticated, function(req, res){    
    res.render('groups/join');
});

// Send Group join invitation
router.post('/:id/join', ensureAuthenticated, function(req, res){
    var user = req.body.user;
    
    Group.find({group_id:req.params.id}, function(err, group){
        User.findOne({username:user}, function(err, usernew){          
            if(usernew==null || usernew == ''){      
                req.flash('error_msg','No user with this name found');
                res.redirect('/groups/'+req.params.id+'/join');
            }else{
            usernew.update({$addToSet:{group_invitation:group[0].group_id}}, function(err, user){
                req.flash('success_msg','Invitation has been sent to '+usernew.username);
                res.redirect('/groups/'+req.params.id+'/join');
            });
            }
        });
    });   
});


// View Group Invitaions
router.get('/invitations', ensureAuthenticated, function(req, res){
    //console.log(req.user.member_id);
    User.findOne({member_id:req.user.member_id}, function(err, user){
        Group.find({group_id:user.group_invitation}, function(err, group){
            //console.log(user.group_invitation);
           // console.log(group);
            res.render('groups/invitations', {group_invitaions:user.group_invitation, group: group});
        });
    });
});


// Accept Group Invitation
router.post('/invitations', function(req, res){
   // console.log('Group invitation accepted');
   User.findOne({member_id:req.user.member_id}, function(err, user){
       console.log(user);
       //console.log(user.member_id);
        Group.findOne({group_id:user.group_invitation}, function(err, group){
            console.log(group);
            //console.log(group.group_id);       
            user.update({ $push: {"group_joined": group.group_id}, $pull: {"group_invitation": group.group_id}}, function(err){
                if(err) throw err;
                //console.log('user updated');
                group.update({ $push: {"users_joined": user.member_id}}, function(err){
                    if(err) throw err;
                    //console.log("userid added to group schema");
                    res.send()
                });            
            }); 
        });
    });
});


// Get specific group posts
router.get('/:id', ensureAuthenticated, function(req, res){        
    Group.findOne({group_id: req.params.id}, function(err, group){
        //console.log(req.user.member_id);
       // console.log(group.createdby);
        User.find({member_id:req.user.member_id}, function(err, user){
            //console.log(user[0].user_profile[0].profilepic);
       // Groupposts.find({group_id:req.params.id}).sort({ispinned:-1}).exec( function(err, groupposts){        
            Groupposts.aggregate([{$lookup:{from:"users",localField:"createdby", foreignField:"member_id", as:"user_details"}},{$match:{group_id:req.params.id}}]).sort({ispinned:-1}).exec(function(err, user_details){
            //console.log(user_details);
            //res.render("groups/posts", {groupposts: user_details});
            res.render("groups/posts", {groupposts: user_details,groupcreatedby:group.createdby, group: group, user: user[0].member_id, isprivate: group.isprivate});
            });        
        });
    });
}); 


// Add Group Post
router.post('/addposts', ensureAuthenticated,  upload.single('postimage'), function(req, res){	
    //console.log("hi");
	
	if(req.file){
		var postimage = req.file.filename;
	}
	

    var description = req.body.description;	
	var date = new Date();		
	var postimage = postimage;
    var	author = req.user.member_id;
    var groupid = req.body.groupid;
    var authorpic = req.user.user_profile[0].profilepic;
    //console.log(groupid);	

    var newGroupPosts = new Groupposts({
        group_id: groupid,        
        description: description,
        postimage: postimage,
        date: date,
        createdby: author     
    });

    Groupposts.createGroupPosts(newGroupPosts, function(err, groupposts){
        if(err) throw err;
       // console.log('grouppost created');
        res.redirect("/groups/"+groupid);
    });
});



// Pin Groups Posts
router.post('/pinpost', function(req, res){
    var post_id = req.body.post_id;
    var pin_value = req.body.pin_value;
     console.log(post_id);
    console.log(pin_value);    
    Groupposts.update({post_id:post_id},{$set:{ispinned:pin_value}}, function(err, post_pinned){
      console.log(post_pinned);
        res.render('groups', {post_pinned: post_pinned});    
    });
});


// Get Group Post flags
router.get('/:id/flags',ensureAuthenticated, function(req, res){
    User.findOne({member_id:req.user.member_id}, function(err, user){
       // console.log(user.member_id);
    Group.find({group_id: req.params.id},{createdby:1}, function(err, createdby){
        //console.log(createdby[0].createdby); 
        //Groupposts.find({group_id: req.params.id}, function(err, posts){
            Groupposts.aggregate([{$lookup:{from:"users",localField:"createdby", foreignField:"member_id", as:"user_details"}},{$match:{group_id:req.params.id}}, { $project : { flag : 1 , user_details : 1 } }]).exec(function(err, posts){
                //console.log(posts);         
            res.render("groups/flags", {posts: posts, createdby:createdby[0].createdby, user:user.member_id});
        });    
    });
    });
});



// Group Post flags 
router.post('/:id', function(req, res){    
    var groupid = req.params.id;    
    //console.log(req.body.flag_post_id);
    Groupposts.findOne({'post_id': req.body.flag_post_id}, function(err, post){
        //console.log(post);
       post.update({$push: {"flag":  {"post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date}}}, function(err){
            if(err) throw err;
            //console.log('updated the data')
        res.redirect("/groups/"+groupid); 
        });
    });	
});


// Get Group Post Trash
router.get('/:id/trash', function(req, res){
    Groupposts.find({group_id: req.params.id}, function(err, posts){
        //console.log(posts);
        res.render("groups/trash", {posts: posts});
    });    
});


// Group Post Trash
router.post('/:id/flags', function(req, res){
    
    var groupid  = req.params.id;
	Groupposts.findOne({'post_id': req.body.trash_post_id}, function(err, post){
        //console.log(post);
       post.update({$set: {"trashed":"Y"}, $push: {"trash":  {"post_id": post.post_id, "description": post.description, "postimage": post.postimage, "author": post.author, "date": post.date}}, $pull: {"flag": {post_id: req.body.trash_post_id}}}, function(err){
            if(err) throw err;
            //console.log('updated the data')
        res.send(); 
        });
    });	
});

// Group Post Undo-Trash
router.post('/:id/trash', function(req, res){
	Groupposts.findOne({'post_id': req.body.trash_post_id}, function(err, post){
		//console.log(post);
		post.update({$set:{trashed: 'N'},$pull: {"trash": {post_id: req.body.trash_post_id}}}, function(err){
			res.send();
		});
	});
});



// Delete Group Trash Post
router.post('/:id/trash/delete', function(req, res){
	//console.log(req.body.trashed_post_id);
	Groupposts.remove({'post_id': req.body.trashed_post_id}, function(err, post){
		res.send();
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