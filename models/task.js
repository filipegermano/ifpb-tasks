var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
    name: String,
    description : String,
    completed : {type: Boolean, default : false},
    createdBy : {type: mongoose.Schema.Types.ObjectId, ref : 'user'},
    assignedTo :  [{friendId : String, firendName : String}],
//    assignedTo :  [{type: mongoose.Schema.Types.ObjectId, ref : 'user'}],
    created_at : {type: Date, default : Date.now}
});

module.exports = mongoose.model('task', taskSchema);