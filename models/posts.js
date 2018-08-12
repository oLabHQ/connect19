var mongoose = require('mongoose');

// Posts Schema
var PostsSchema = mongoose.Schema({
	title: {
		type: String,		
	},
	description: {
		type: String
    },
    image:{
        type: String
    },
	date: {
		type: Date
	}	
});

var Posts = module.exports = mongoose.model('Posts', PostsSchema);