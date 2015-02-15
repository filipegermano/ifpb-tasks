var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var userSchema = new mongoose.Schema({
    name: String,
    facebook_id : String,
    created_at : {type: Date, default : Date.now},
});


userSchema.plugin(findOrCreate);

module.exports = mongoose.model('user', userSchema);