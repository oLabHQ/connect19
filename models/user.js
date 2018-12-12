var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var shortid = require('shortid');
var bcrypt = require('bcryptjs');
var Handlebars = require("handlebars");
var hbsHelpers = require('handlebars-helpers');
var passportLocalMongoose = require("passport-local-mongoose");

// Userprofile Schema
var UserProfileSchema = new Schema({
	description: {
		type: String,		
	},
	interests: {
		type: String,
		default: "None"
	},
	profilepic: {
		type: String,
		default: 'https://i.imgur.com/SK8VYHe.png'
	}
})

// User Schema
var UserSchema = new Schema({
	username: {
		type: String,
		index:true
	},
	email: {
		type: String
	},
	password: {
		type: String
	},
	member_id:{
		type: String,
		default: shortid.generate
	},
	resetPasswordToken: {
		type: String
	},
    resetPasswordExpires: {
		type: Date
	},
	admin: {
		type: Boolean,
		default: "false"
	},
	isApproved: {
		type: Boolean,
		default: "false"
	},
	friends:[
		{
			type: String,		
		}
	],
	friend_requests_sent: [
		{
			type: String,			
		}
	],
	friend_requests: [
		{
			type: String,			
		}
	],
	group_invitation:[
		{
			type: String			
		}
	],
	group_joined:[
		{
			type: String
		}
	],
	user_profile: [UserProfileSchema]
});

// UserSchema.plugin(passportLocalMongoose)




// New UserSchema Methods
// UserSchema.methods.createUser = function(newUser, callback){
// 	bcrypt.genSalt(10, function(err, salt) {
// 	    bcrypt.hash(newUser.password, salt, function(err, hash) {
// 			if (err) throw err;

// 	        newUser.password = hash;
// 	        newUser.save(callback);
// 	    });
// 	});
// }

UserSchema.methods.getUserByUsername = function(username, callback){
	var query = {username: username};
	UserSchema.findOne(query, callback);
}

UserSchema.methods.getUserById = function(member_id, callback){
	var query = {member_id: member_id};
	UserSchema.findOne(query, callback);
}

UserSchema.methods.comparePassword = function (passw, cb) {
    bcrypt.compare(passw, this.password, function (err, isMatch) {
        if (err) {
            return cb(err);
        }
        cb(null, isMatch);
    });
};


UserSchema.pre('save', function (next) {
	var user = this;
    if (this.isModified('password') || this.isNew) {
        bcrypt.genSalt(10, function (err, salt) {
            if (err) {
                return next(err);
            }
            bcrypt.hash(user.password, salt, function (err, hash) {
                if (err) {
                    return next(err);
				}
                user.password = hash;
                next();
            });
        });
    } else {
        return next();
    }
});

// UserSchema.pre('update', function (next) {
// 	var user = this;
// 	console.log("Updating password");
//     if (this.isModified('password') || this.isNew) {
//         bcrypt.genSalt(10, function (err, salt) {
//             if (err) {
//                 return next(err);
//             }
//             bcrypt.hash(user.password, salt, function (err, hash) {
//                 if (err) {
//                     return next(err);
// 				}
//                 user.password = hash;
//                 next();
//             });
//         });
//     } else {
//         return next();
//     }
// });

// Legacy
// var User = module.exports = mongoose.model('User', UserSchema);


//module.exports.createPassword = function(newpassword, callback){
//	bcrypt.genSalt(10, function(err, salt) {
//	    bcrypt.hash(newpassword.password, salt, function(err, hash) {
//	        newpassword.password = hash;
//	        newpassword.save(callback);
///	    });
//	});
//}

// Retaining it here for legacy code

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
			if (err) throw err;

	        newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.getUserByUsername = function(username, callback){
	var query = {username: username};
	UserSchema.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	UserSchema.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}

module.exports = mongoose.model('User', UserSchema);


