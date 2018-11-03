var mongoose = require('mongoose');
var shortid = require('shortid');
var mongoosePaginate = require('mongoose-paginate');

// Announcement Schema
var AnnouncementSchema = mongoose.Schema({
	description: {
		type: String
    },
    image:{
        type: String
	},
	author: {
		type: String,		
	},	
	date: {
		type: Date,
		default: Date.now
	},
	announcement_id:{
		type: String,
		default: shortid.generate
    }	
});


var Announcement = module.exports = mongoose.model('Announcement', AnnouncementSchema);

module.exports.createAnnouncement = function(newAnnouncement, callback){
				newAnnouncement.save(callback);	
}