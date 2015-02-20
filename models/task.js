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
    completedAt : Date,
    priority : {type: String, enum: ['Baixa', 'Média', 'Alta']},
    status : {type: String, enum: ['em aberto', 'em execução', 'finalizada']},
    createdAt : {type: Date, default : Date.now}
});

module.exports = mongoose.model('task', taskSchema);