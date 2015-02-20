var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name: String,
    facebook_id : String,
    tasksCreated : [{type: mongoose.Schema.Types.ObjectId, ref : 'task'}],
    tasksAssigned : [{type: mongoose.Schema.Types.ObjectId, ref : 'task'}],
    created_at : {type: Date, default : Date.now},
    accessToken : String
});

module.exports = mongoose.model('user', userSchema);