var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: './dist/images' });


var User = require('../../models/user');
var Group = require('../../models/group');
var Groupposts = require('../../models/groupposts');


// Get Groups
router.get('/', function(req,res){
    var member_id = req.query.member_id;
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

module.exports = router;