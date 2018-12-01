var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });
var authenticateFirst = require('../../utilities/auth').authenticateFirst;


var User = require('../../models/user');
var Group = require('../../models/group');
var Groupposts = require('../../models/groupposts');


// Get Specific Group Posts
router.get('/:id',authenticateFirst, function(req,res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    //if(req.params.id){
    //    res.send("Get the Group posts");
    //    return;
    //}    

    Group.findOne({group_id: req.params.id}, function(err, group){
        //console.log(req.user.member_id);
       // console.log(group.createdby);
        User.find({member_id:req.user.member_id}, function(err, user){
            //console.log(user[0].user_profile[0].profilepic);
       // Groupposts.find({group_id:req.params.id}).sort({ispinned:-1}).exec( function(err, groupposts){        
            Groupposts.aggregate([{$lookup:{from:"users",localField:"createdby", foreignField:"member_id", as:"user_details"}},{$match:{group_id:req.params.id}},{$project: {"user_details.password":0, "user_details.friend_requests":0, "user_details.group_invitation":0}}]).sort({ispinned:-1, date:-1}).exec(function(err, groupposts){
                if(err) throw err;
            //console.log(user_details);
            //res.render("groups/posts", {groupposts: user_details});
            var groupPosts = {
                groupposts: groupposts
            }
            if (groupposts && !err) {
                res.json({ success: true, msg: 'Group Created', groupPosts : groupPosts});                    
            } else {
            res.status(500).send({ success: false, msg: 'Something went wrong!!' });
        }
            });        
        });
    });
});


// Get Groups
router.get('/',authenticateFirst, function(req,res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    
    console.log(member_id);
    User.findOne({member_id:member_id}, function(err, user){        
    Group.find({}).sort({ispinned:-1}).exec(function(err, group){
       console.log(group);

       var group = {
           groups:group
       }
        if(err) throw err;
        res.send(JSON.stringify({ group: group }));
       // res.render('groups/index', {group: group, ispinned: group[0].ispinned, isprivate: group[0].isprivate, createdby: group[0].createdby, user: user.member_id, isadmin: user.admin, users: user, isApproved: user.isApproved});
    }); 
});
});



// Get User By Username

router.get('/groupname',authenticateFirst,  function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    Group.find({},function(err, groupname){
        console.log(groupname);
        if (err) throw err;
        var groupName = {
            groupname: groupname
        }
        res.send(JSON.stringify({ groupname: groupName }));
        //res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
    });
});


// Create Group
router.post('/creategroup', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }	
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
            res.status(400).send({ success: false, msg: 'Group name should not be Empty' ,group:group });
    });
	}
	else {
        Group.findOne({groupname: { "$regex": "^" + title + "\\b", "$options": "i"}}, function(err, groupname){
            //console.log(groupname)
            if(groupname){
                Group.find({}, function(err, group){                
                res.status(400).send({ success: false, msg: 'Group name already taken', group: group, groupname: groupname});
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
                    if (group && !err) {
                        res.json({ success: true, msg: 'Group Created', group : group});                    
                    } else {
                    res.status(500).send({ success: false, msg: 'Something went wrong!!' });
                }
                });
                
                

            }
        });
    }
});


// Pin Groups
router.post('/pingroup', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }	
    var group_id = req.body.group_id;
    var pin_value = req.body.pin_value;
    // console.log(group_id);
    //console.log(pin_value);    
    Group.update({group_id:group_id},{$set:{ispinned:pin_value}}, function(err, group_pinned){
     // console.log(group_pinned);
     if(err) throw err;
     if (group_pinned && !err) {
        res.json({ success: true, msg: 'Group Pinned', group_pinned : group_pinned});                    
    } else {
        res.status(500).send({ success: false, msg: 'Something went wrong!!' });
    }           
    });
});

// Get private Group join invitaion page
router.get('/:id/join', authenticateFirst, function(req, res){  
    var member_id = req.user.member_id;        
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }  
    User.find({member_id:{$ne:req.user.member_id}},{"username":1, "member_id":1, "group_joined":1}, function(err, user){
        if(err) throw err;
        if (user && !err) {
           res.json({ success: true, msg: 'List of Users', user : user});                    
       } else {
           res.status(500).send({ success: false, msg: 'Something went wrong!!' });
       }        
    });
});


// Send Group join invitation
router.post('/:id/join-group', authenticateFirst, function(req, res){
    var user_id = req.body.member_id;
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    Group.find({group_id:req.params.id}, function(err, group){
        User.findOne({member_id:user_id}, function(err, usernew){    
            console.log(usernew);      
            if(usernew==null || usernew == ''){      
                res.status(404).json({ error: "No User exist with this name" });
            }else{
            usernew.update({$addToSet:{group_invitation:group[0].group_id}}, function(err, user){
                res.json({ success: true, msg: 'Invitation sent', user : user});
            });
            }
        });
    });   
}); 


// View Group Invitaions
router.get('/invitations', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }    
    User.findOne({member_id:member_id}, function(err, user){
        //console.log(user.group_invitation);
        if(err) throw err;
        
        Group.find({group_id:user.group_invitation},{groupname:1, group_id:1}, function(err, group){
            if(err) throw err;
            var groupInvitation = {
                group_invitaions:user.group_invitation,
                group_names : group, 
                isApproved: user.isApproved
            }
            if (group && !err) {
                res.json({ success: true, msg: 'Group Invitation List', groupInvitation: groupInvitation });                  
            } else {
                res.status(500).send({ success: false, msg: 'Something went wrong!!' });
            }
            
            //res.render('groups/invitations', {group_invitaions:user.group_invitation, group: group, isApproved: user.isApproved});
        });    
    });
});


// Accept Group Invitation
router.post('/invitations', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }    
    // console.log('Group invitation accepted');
    User.findOne({member_id:member_id}, function(err, user){
        console.log(user);   
         Group.findOne({group_id:user.group_invitation}, function(err, group){
             console.log(group);             
             user.update({ $push: {"group_joined": group.group_id}, $pull: {"group_invitation": group.group_id}}, function(err, user){
                 if(err) throw err;
                 //console.log('user updated');
                 group.update({ $push: {"users_joined": user.member_id}}, function(err, group){
                     if(err) throw err;
                     var data = {
                         user: user,
                         group: group
                     }
                     if (group && !err) {
                        res.json({ success: true, msg: 'Group invitation accepted', data : data});                    
                    } else {
                        res.status(500).send({ success: false, msg: 'Something went wrong!!' });
                    }                              
                 });            
             }); 
         }); 
     });
 });



// Pin Groups Posts
router.post('/pinpost', authenticateFirst, function(req, res){
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    } 
    var post_id = req.body.post_id;
    var pin_value = req.body.pin_value;
     //console.log(post_id);
    //console.log(pin_value);    
    Groupposts.update({post_id:post_id},{$set:{ispinned:pin_value}}, function(err, post_pinned){
      //console.log(post_pinned);
      if(err) throw err;
      if (post_pinned && !err) {
        res.json({ success: true, msg: 'Post Pinned', post_pinned: post_pinned});                    
    } else {
        res.status(500).send({ success: false, msg: 'Something went wrong!!' });
    }                 
    });
});



module.exports = router;