var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
    name: String,
    description : String,
    completed : {type: Boolean, default : false},
    createdBy : {type: mongoose.Schema.Types.ObjectId, ref : 'user'},
    assignedTo :  [{
        friendId : String,
        friendName : String
    }],
    deadline : Date,
    completedDate : Date,
    priority : String,
    created_at : {type: Date, default : Date.now}
});

module.exports = mongoose.model('task', taskSchema);