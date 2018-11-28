var passport = require('passport');
require('../config/passport')(passport);

module.exports.getToken = function (headers) {
    if (headers && headers.authorization) {
        var parted = headers.authorization.split(' ');
        if (parted.length === 2) {
            return parted[1];
        } else {
            return null;
        }
    } else {
        return null;
    }
};

module.exports.authenticateFirst = passport.authenticate('jwt', { session: false});