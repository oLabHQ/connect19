var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: './dist/images' });
var authenticateFirst = require('../../utilities/auth').authenticateFirst;


var User = require('../../models/user');
var Group = require('../../models/group');
var Groupposts = require('../../models/groupposts');
var POSTS_RETURN_LIMIT = 5;


// Add Group Post
router.post('/addpost', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    if (!req.body.description || req.body.description.trim() == "") {
        res.status(400).json({ success: false, msg: "Missing Post Content Message" });
        return;
    }

    var post = {
        description: req.body.description,
        createdby: member_id,
        group_id: req.body.group_id,
        date: new Date()
    }

    if (req.body.imageUrl) {
        post.postimage = req.body.imageUrl;
    }

    var newGroupPosts = new Groupposts(post);

    Groupposts.createGroupPosts(newGroupPosts, function (err, groupPost) {
        if (groupPost && !err) {
            res.json({ success: true, groupPost: groupPost });
        } else {
            res.status(500).json({ success: false, msg: "Error creating post. Please try again" });
        }
    });
});

router.get('/group-detail', authenticateFirst, function (req, res) {
    var group_id = req.query.groupId;

    Group.findOne({ group_id: group_id }, function (err, group) {
        if (group && !err) {
            res.json({ success: true, group: group });
        } else {
            res.status(400).json({ success: false, msg: "Error occured getting group detail. Please try again." });
        }
    });
});

//Get Specific Group Posts
router.get('/groupposts', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ success: false, msg: "User Does not Exists" });
        return;
    }

    var groupId = req.query.groupId;

    if (!groupId) {
        res.status(404).json({ success: false, msg: "Group ID should not be empty" });
        return;
    }

    var page = parseInt(req.query.page, 10) || 1;

    Group.findOne({ group_id: groupId }, function (err, group) {
        //console.log(req.user.member_id);
        // console.log(group.createdby);
        User.find({ member_id: member_id }, function (err, user) {
            //console.log(user[0].user_profile[0].profilepic);
            // Groupposts.find({group_id:req.params.id}).sort({ispinned:-1}).exec( function(err, groupposts){        
            if (page <= 1) {
                Groupposts.aggregate([{ $lookup: { from: "users", localField: "createdby", foreignField: "member_id", as: "user_details" } }, { $match: { group_id: groupId } }, { $project: { "user_details.password": 0, "user_details.friend_requests": 0, "user_details.group_invitation": 0, "user_details.friends": 0, "user_details.group_joined": 0 } }]).sort({ ispinned: -1, date: -1 }).limit(POSTS_RETURN_LIMIT).exec(function (err, groupposts) {
                    if (groupposts && !err) {
                        res.json({ success: true, msg: 'Posts', groupPosts: groupposts });
                    } else {
                        res.status(500).send({ success: false, msg: 'Server Error. Please try again.' });
                    }
                });
            } else {
                Groupposts.aggregate([{ $lookup: { from: "users", localField: "createdby", foreignField: "member_id", as: "user_details" } }, { $match: { group_id: groupId } }, { $project: { "user_details.password": 0, "user_details.friend_requests": 0, "user_details.group_invitation": 0, "user_details.friends": 0, "user_details.group_joined": 0 } }]).sort({ ispinned: -1, date: -1 }).skip(((page - 1) * POSTS_RETURN_LIMIT) + (page > 1 ? 1 : 0)).limit(POSTS_RETURN_LIMIT).exec(function (err, groupposts) {
                    if (groupposts && !err) {
                        res.json({ success: true, msg: 'Posts', groupPosts: groupposts });
                    } else {
                        res.status(500).send({ success: false, msg: 'Server Error. Please try again.' });
                    }
                });
            }
        });
    });
});


// Get Groups
router.get('/', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ success: false, msg: "User Does not Exists" });
        return;
    }

    User.findOne({ member_id: member_id }, function (err, user) {
        Group.find({}).sort({ ispinned: -1 }).exec(function (err, groups) {
            if (err) {
                res.status(500).json({ success: false, msg: "Server Error: Unable to get groups." });
                return;
            } else {
                res.json({ success: true, groups: groups });
                return;
            }
        });
    });
});

router.get('/usergroups', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ success: false, msg: "User Does not Exists" });
        return;
    }

    Group.find({ $or: [{ users_joined: member_id }, { isAdminOnly: true }] }).sort({ ispinned: -1 }).exec(function (err, groups) {
        if (err) {
            res.status(500).json({ success: false, msg: "Server Error: Unable to get groups." });
            return;
        } else {
            res.json({ success: true, groups: groups });
            return;
        }
    });
});


// Create Group
router.post('/creategroup', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ success: false, msg: "User Does not Exists." });
        return;
    }

    if (!req.body.groupname || req.body.groupname.trim() === "") {
        res.status(404).json({ success: false, msg: "Title is required!" });
        return;
    }

    if (!req.body.description || req.body.description.trim() === "") {
        res.status(404).json({ success: false, msg: "Description is required!" });
        return;
    }

    var title = req.body.groupname;
    var description = req.body.description;
    var groupstatus = req.body.isprivate || false;
    var isAdminOnly = false;

    if (req.user.admin) {
        isAdminOnly = req.body.isAdminOnly || false;
    }

    var date = new Date();

    Group.findOne({ groupname: { "$regex": "^" + title + "\\b", "$options": "i" } }, function (err, groupname) {
        //console.log(groupname)
        if (groupname) {
            Group.find({}, function (err, group) {
                res.status(400).send({ success: false, msg: 'Group name already taken' });
                return;
            });
        } else {

            var newGroup = new Group({
                groupname: title,
                description: description,
                isprivate: groupstatus,
                date: date,
                createdby: req.user.member_id,
                users_joined: [req.user.member_id],
                isAdminOnly: isAdminOnly
            });

            Group.createGroup(newGroup, function (err, group) {
                if (err) {
                    console.log(err);
                    res.status(400).send({ success: false, msg: "There was an error creating the group. Please try again." });
                    return;
                }

                User.findOne({ member_id: member_id }, function (err, user) {
                    user.update({ $push: { "group_joined": group.group_id } }, function (err, user) {
                        if (err) {
                            res.status(404).json({ success: false, msg: "Updating user error." });
                            return;
                        } else {
                            res.json({ success: true, msg: 'Group Created', group: group });
                            return;
                        }
                    });
                });
            });
        }
    });
});


// Add User to Group
router.post('/add-user-to-group', authenticateFirst, function (req, res) {
    var member_id = req.body.member_id;
    var group_id = req.body.group_id;
    if (!member_id) {
        res.status(404).json({ success: false, msg: "Member Id should not be empty!" });
        return;
    }

    User.findOne({ member_id: member_id }, function (err, user) {
        var foundUser = user;
        if (err) {
            res.status(404).json({ success: false, msg: "User not found" });
            return;
        }

        Group.findOne({ group_id: group_id }, function (err, group) {
            if (err) {
                res.status(404).json({ success: false, msg: "Group not found" });
                return;
            }

            user.update({ $push: { "group_joined": group.group_id } }, function (err, user) {
                if (err) {
                    res.status(404).json({ success: false, msg: "Updating user error." });
                    return;
                }

                group.update({ $push: { "users_joined": foundUser.member_id } }, function (err, group) {
                    console.log(JSON.stringify(group));
                    if (group && !err) {
                        res.json({ success: true, msg: 'User added to group' });
                    } else {
                        res.status(404).json({ success: false, msg: "Updating group error." });
                        return;
                    }
                });
            });
        });
    });
});


// Pin Groups
router.post('/pingroup', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    var group_id = req.body.group_id;
    var pin_value = req.body.pin_value;
    // console.log(group_id);
    //console.log(pin_value);    
    Group.update({ group_id: group_id }, { $set: { ispinned: pin_value } }, function (err, group_pinned) {
        // console.log(group_pinned);
        if (group_pinned && !err) {
            res.json({ success: true, msg: 'Group Pinned', group_pinned: group_pinned });
        } else {
            res.status(500).send({ success: false, msg: 'Something went wrong!!' });
        }
    });
});

// Get private Group join invitaion page
router.get('/:id/join', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    User.find({ member_id: { $ne: req.user.member_id } }, { "username": 1, "member_id": 1, "group_joined": 1 }, function (err, user) {
        if (user && !err) {
            res.json({ success: true, msg: 'List of Users', user: user });
        } else {
            res.status(500).send({ success: false, msg: 'Something went wrong!!' });
        }
    });
});


// Send Group join invitation
router.post('/:id/join-group', authenticateFirst, function (req, res) {
    var user_id = req.body.member_id;
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    Group.find({ group_id: req.params.id }, function (err, group) {
        User.findOne({ member_id: user_id }, function (err, usernew) {
            console.log(usernew);
            if (usernew == null || usernew == '') {
                res.status(404).json({ error: "No User exist with this name" });
            } else {
                usernew.update({ $addToSet: { group_invitation: group[0].group_id } }, function (err, user) {
                    res.json({ success: true, msg: 'Invitation sent', user: user });
                });
            }
        });
    });
});


// View Group Invitaions
router.get('/invitations', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    User.findOne({ member_id: member_id }, function (err, user) {
        //console.log(user.group_invitation);
        if (err) {
            res.status(500).send({ success: false, msg: "Server error. Please try again." });
            return;
        }

        Group.find({ group_id: user.group_invitation }, { groupname: 1, group_id: 1 }, function (err, group) {
            if (err) {
                res.status(500).send({ success: false, msg: "Server error. Please try again." });
                return;
            }

            var groupInvitation = {
                group_invitaions: user.group_invitation,
                group_names: group,
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
router.post('/invitations', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Does not Exists" });
        return;
    }
    // console.log('Group invitation accepted');
    User.findOne({ member_id: member_id }, function (err, user) {
        console.log(user);
        Group.findOne({ group_id: user.group_invitation }, function (err, group) {
            console.log(group);
            user.update({ $push: { "group_joined": group.group_id }, $pull: { "group_invitation": group.group_id } }, function (err, user) {
                if (err) {
                    res.status(500).send({ success: false, msg: "Server error. Please try again." });
                    return;
                }
                //console.log('user updated');
                group.update({ $push: { "users_joined": user.member_id } }, function (err, group) {
                    var data = {
                        user: user,
                        group: group
                    }
                    if (group && !err) {
                        res.json({ success: true, msg: 'Group invitation accepted', data: data });
                    } else {
                        res.status(500).send({ success: false, msg: 'Something went wrong!!' });
                    }
                });
            });
        });
    });
});


// Pin Groups Posts
// router.post('/pinpost', authenticateFirst, function (req, res) {
//     var member_id = req.user.member_id;
//     if (!member_id) {
//         res.status(404).json({ error: "User Does not Exists" });
//         return;
//     }
//     var post_id = req.body.post_id;
//     var pin_value = req.body.pin_value;
//     //console.log(post_id);
//     //console.log(pin_value);    
//     Groupposts.findOneAndUpdate({ post_id: post_id }, { $set: { ispinned: pin_value } }, { new: true }, function (err, post_pinned) {
//         //console.log(post_pinned);
//         if (post_pinned && !err) {
//             res.json({ success: true, msg: 'Post Pinned', post_pinned: post_pinned });
//         } else {
//             res.status(500).send({ success: false, msg: 'Something went wrong!!' });
//         }
//     });
// });

router.post('/change-pin-status', authenticateFirst, function (req, res) {
    var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "Member ID should not be blank" });
        return;
    }

    var ispinned = req.body.ispinned || false;
    var post_id = req.body.post_id;

    if (!post_id) {
        res.status(404).json({ success: false, msg: "Post ID should not be blank" });
        return;
    }

    Groupposts.findOneAndUpdate({ 'post_id': post_id }, { $set: { 'ispinned': ispinned } }, { new: true }, function (err, post) {
        if (post) {
            res.json({ success: true, msg: 'Post updated successfully' });
        } else {
            res.status(500).send({ success: false, msg: 'Not able to update post / Post does not exists' });
        }
    })
})

// Post Edit Group Post
router.post('/editpost', authenticateFirst, function (req, res) {
	var member_id = req.user.member_id;
    if (!member_id) {
        res.status(404).json({ error: "User Id should not be empty." });
        return;
	}

	var description = req.body.description;
	var post_id = req.body.post_id;

	if (!post_id) {
		res.status(404).json({ success: false, msg: 'Post ID undefined or cannot be empty.'});
		return;
	}

	Groupposts.findOneAndUpdate({ 'post_id': post_id}, {$set : { 'description' : description}}, {new: true}, function (err, post) {
		if(post && !err) {
			res.json({ success: true, msd: 'Post updated successfully', post: post});
		} else {
			res.status(500).send({ success: flase, msg: 'Not able to update post'});
		}
	})
})

// Delete Post
router.post('/delete-post', authenticateFirst, function (req, res) {
	Groupposts.remove({ 'post_id': req.body.post_id }, function (err, deletePost) {
		if(deletePost && !err) {
			res.json({ success: true, msg: 'Post Deleted', deletePost: deletePost});
		} else {
			res.status(500).send({ success: false, msg: 'Not able to Delete post'});
		}
	});
});

// // Get Edit post
// router.get('/:id/getgrouppost', authenticateFirst, function (req, res) {
//     var group_id = req.params.id;
//     var member_id = req.user.member_id;
//     var post_id = req.body.post_id;
//     if (!member_id) {
//         res.status(404).json({ error: "User Does not Exists" });
//         return;
//     }

//     // console.log(group);
//     Groupposts.find({ $and: [{ group_id: group_id }, { post_id: post_id }] }, function (err, post) {
//         Groupposts.findOne({ post_id: req.query.post_id }, function (err, post) {
//             if (post && !err) {
//                 res.json({ success: true, msg: 'Post', post: post });
//             } else {
//                 res.status(500).send({ success: false, msg: 'Something went wrong!!' });
//             }
//         });

//     });
// });


// //  Edit Group Post
// router.post('/:id/editgrouppost', function (req, res) {
//     // var member_id = req.user.member_id;
//     // if (!member_id) {
//     //     res.status(404).json({ error: "User Does not Exists" });
//     //     return;
//     // }

//     var post_id = req.body.post_id;
//     var description = req.body.description;

//     if (!description || description.trim() == "") {
//         res.status(400).json({ success: false, msg: "Missing Post Content Message" });
//         return;
//     }

//     Groupposts.findOneAndUpdate({ 'post_id': post_id }, { $set: { 'description': description } }, { new: true }, function (err, post) {
//         if (post && !err) {
//             res.json({ success: true, msd: 'Post updated successfully', post: post });
//         } else {
//             res.status(500).send({ success: false, msg: 'Not able to update post' });
//         }
//     })

// });


// // Delete Post
// router.post('/:id/deletegrouppost', function (req, res) {
//     Groupposts.remove({ 'post_id': req.body.post_id }, function (err, deletePost) {
//         console.log(deletePost);
//         if (deletePost && !err) {
//             res.json({ success: true, msg: 'Post Deleted', deletePost: deletePost });
//         } else {
//             res.status(500).send({ success: flase, msg: 'Not able to Delete post' });
//         }
//     });
// });

// Delete Group
router.post('/delete-group', authenticateFirst, function (req, res) {
    Group.remove({ 'group_id': req.body.groupId }, function (err, deletedGroup) {
        if (deletedGroup && !err) {
            res.json({ success: true, msg: 'Group Deleted' });
        } else {
            res.status(500).send({ success: false, msg: 'Not able to Delete Group' });
        }
    });
});

module.exports = router;