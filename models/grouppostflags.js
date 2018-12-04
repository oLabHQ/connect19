var mongoose = require('mongoose');
var Schema = mongoose.Schema; 

// Posts Schema
var GroupPostFlagSchema = mongoose.Schema({
    post_id:{
			type: String,		
        },
    users: {
        type: String
    }
});

var GroupPostFlag = module.exports = mongoose.model('GrouppostFlag', GroupPostFlagSchema);

