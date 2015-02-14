var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    facebook_id : String,
    created_at : {type: Date, default : Date.now},
});

module.exports = mongoose.model('user', userSchema);