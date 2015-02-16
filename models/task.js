var mongoose = require('mongoose');

var taskSchema = new mongoose.Schema({
    name: String,
    description : String,
    completed : Boolean,
    createdBy : {type: mongoose.Schema.Types.ObjectId, ref : 'user'},
    assignedTo :  [String],
//    assignedTo :  [{type: mongoose.Schema.Types.ObjectId, ref : 'user'}],
    created_at : {type: Date, default : Date.now}
});

module.exports = mongoose.model('task', taskSchema);