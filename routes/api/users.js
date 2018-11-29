var mongoose = require('mongoose');
var passport = require('passport');
require('../../config/passport')(passport);
var config = require('../../config/database');
var getToken = require('../../utilities/auth').getToken;
var authenticateFirst = require('../../utilities/auth').authenticateFirst;
var express = require('express');
var jwt = require('jsonwebtoken');
var router = express.Router();
var User = require('../../models/user');

// Get Users
router.get('/', authenticateFirst, function (req, res) {
    User.findOne({ member_id: req.user.member_id }, function (err, user) {
        User.find({ "member_id": { $ne: req.user.member_id } }, {"user_details.email": 1, "friend_requests": 1, "user_profile": 1, "username":1, "member_id":1}, function (err, users) {
            if (err) throw err;
            var userData = {
                user: user,
                users: users
            }
            res.send(JSON.stringify( userData ));
            //res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
        });
    });
});

// Get User By Username

router.get('/username', function (req, res) {
    if (!req.query.username) {
        res.status(404).json({ error: "Username Does not Exists" });
        return;
    }

    User.findOne({ username: req.query.username  }, { "password": 0, "group_invitation": 0, "friend_requests": 0 }, function (err, user) {
        if (err) {
            res.status(500).send(JSON.stringify({ success: false, msg: "unable to get user from username" }));
        } else {
            res.send(JSON.stringify({ success: true, user: user }));
        }
        
        //res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
    });
});

router.get('/id', function (req, res) {
    if (!req.query.member_id) {
        res.status(404).json({ error: "Member Id Does not Exists" });
        return;
    }

    User.findOne({ member_id: req.query.member_id }, { "password": 0, "group_invitation": 0, "friend_requests": 0 }, function (err, user) {
        if (err) {
            res.status(500).send(JSON.stringify({ success: false, msg: "unable to get user from member_id" }));
        } else {
            res.send(JSON.stringify({ success: true, user: user }));
        }
        
        //res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
    });
});

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password || !req.body.email) {
        res.status(400).json({ success: false, msg: 'Missing Registration Details (Username / Password / Email)' });
        return;
    } else {
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        // save the user
        newUser.save(function (err) {
            if (err) {
                res.status(400).json({ success: false, msg: 'Username already exists.' });
                return;
            }
            res.json({ success: true, msg: 'Successful created new user.' });
        });
    }
});

router.post('/signin', function (req, res) {
    User.findOne({
        username: req.body.username
    }, function (err, user) {
        if (err) throw err;

        if (!user) {
            res.status(401).send({ success: false, msg: 'Authentication failed. User not found.' });
        } else {
            // check if password matches
            user.comparePassword(req.body.password, function (err, isMatch) {
                if (isMatch && !err) {
                    // if user is found and password is right create a token
                    var token = jwt.sign(user.toJSON(), config.secret);
                    // return the information including token as JSON
                    res.json({ success: true, token: 'JWT ' + token, user: user.toJSON() });
                } else {
                    res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            });
        }
    });
});

// Update profile
router.post('/editprofile', authenticateFirst, function (req, res) {
    var username = req.body.username;
    var description = req.body.description;
    var profilePicUrl = req.body.profilePicUrl;

    req.user.user_profile[0].description = description;

    if (!username || username.trim() == "") {
        res.status(500).json({ success: false, msg: 'Username must be not be empty.' });
        return;
    }

    if (profilePicUrl) {
        req.user.user_profile[0].profilepic = profilePicUrl;
    }

    User.updateOne({ username: req.user.username }, { $set: { "username": username, "user_profile": req.user.user_profile } }, function (err, user) {
        //console.log(user);
        if (err) {
            res.status(500).json({ success: false, msg: 'Error Updating User.' });
            return;
        } else {
            res.json({ success: true, user: user });
            return;
        }
    });
});

module.exports = router;