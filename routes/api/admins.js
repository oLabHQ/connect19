var express = require('express');
var router = express.Router();
var authenticateFirst = require('../../utilities/auth').authenticateFirst;

var User = require('../../models/user');


// Get Users
router.get('/',authenticateFirst, function(req,res){    
	User.findOne({"member_id": req.user.member_id}, function(err, user){
		User.find({"member_id": {$ne: req.user.member_id}},{"username":1, "member_id":1, "user_profile.profilepic":1}, function(err, users){	 
			if(err) throw err;	
				console.log(user.admin);				
			var users = {
				users: users,
				username: user.username,
				isAdmin: user.admin, 
				isApproved: user.isApproved	
			}
			if (err) {
				res.status(500).send(JSON.stringify({ success: false, msg: "Error Getting Users." }));
			} else {
				res.send(JSON.stringify({ success: true, users: users }));
			}
		});
	});
 });


  // Make admin
router.post('/', authenticateFirst, function(req, res){
	User.findOne({'member_id': req.body.member_id}, function(err, user){
		var isAdmin = req.body.isAdmin;		
			user.update({$set:{admin: isAdmin}}, function(err){
				if (err) {
					res.status(500).send({success: false, msg: "Unable to make admin."});
					return;
				} else {
					res.send({ success: true });
					return;
				}
		});  
	});
}); 


// Approve User
router.post('/approve', authenticateFirst, function(req, res){
	User.findOne({'member_id': req.body.member_id}, function(err, user){				
		var isApproved = req.body.isApproved;
			user.update({$set:{isApproved: isApproved}}, function(err){
				if (err) {
					res.status(500).send({success: false, msg: "Unable to Approve user."});
					return;
				} else {
					res.send({ success: true});
					return;
				}
		});  
	});
});


// Delete User
router.post('/delete-user', function(req, res){	
	User.remove({'member_id': req.body.member_id}, function(err, user){
		console.log(req.body.member_id);
		if(err) throw err;
		if (err) {
			res.status(500).send({success: false, msg: "Unable to Delete user."});
			return;
		} else {
			res.send({ success: true});
			return;
		}
});
});

 module.exports = router;
 