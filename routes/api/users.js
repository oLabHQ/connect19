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
        User.find({ "member_id": { $ne: req.user.member_id } }, { "password": 0, "group_invitation": 0, "friend_requests": 0 }, function (err, users) {
            if (err) throw err;
            var userData = {
                user: user,
                users: users
            }
            res.send(JSON.stringify({ users: userData }));
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
    User.find({ "username": { $ne: req.query.username } }, { "password": 0, "group_invitation": 0, "friend_requests": 0 }, function (err, users) {
        console.log(users);
        if (err) throw err;
        var userData = {
            users: users
        }
        res.send(JSON.stringify({ user: userData }));
        //res.render('friends/users', {user_friends: users, users: user, isApproved: user.isApproved, user_id: user.member_id, friend_requests: user.friend_requests, friends: user.friends});	
    });
});

router.post('/signup', function (req, res) {
    if (!req.body.username || !req.body.password || !req.body.email) {
        res.json({ success: false, msg: 'Missing Registration Details (Username / Password / Email)' });
    } else {
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        });
        // save the user
        newUser.save(function (err) {
            if (err) {
                return res.json({ success: false, msg: 'Username already exists.' });
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
                    res.json({ success: true, token: 'JWT ' + token });
                } else {
                    res.status(401).send({ success: false, msg: 'Authentication failed. Wrong password.' });
                }
            });
        }
    });
});

module.exports = router;