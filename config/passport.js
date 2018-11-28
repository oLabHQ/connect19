var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;

// load up the user model
var User = require('../models/user');
var config = require('../config/database'); // get db config file

module.exports = function (passport) {
    var opts = {
        // Telling Passport to check authorization headers for JWT
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("jwt"),
        // Telling Passport where to find the secret
        secretOrKey: config.secret,
        passReqToCallback: true
    };
    passport.use(new JwtStrategy(opts, function (req, jwt_payload, done) {
        User.findOne({ id: jwt_payload.id }, function (err, user) {
            if (err) {
                return done(err, false);
            }
            if (user) {
                req.user = user;
                done(null, user);
            } else {
                done(null, false);
            }
        });
    }));
};