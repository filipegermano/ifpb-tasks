var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
//var user = require('../models/user.js');
var task = require('../models/task.js');
var user = require('../models/user.js');
var FB = require('fb');

router.get('/', function(req,res){
    task.find(function(err,tasks){
        if(err) {
            return next(err);
        }
        res.json(tasks);
    });
});

router.delete('/all', function(req,res){
    task.collection.remove( function (err) {
        if (err) throw err;
        // collection is now empty but not deleted
    });
    res.status(200).json('All taks removed');
})

router.delete('/:id', function(req,res,next){
    task.findByIdAndRemove(req.params.id, function(err, tasks){
        if(err) return next(err);
        res.status(200).json(tasks);
    });
});


router.get('/:id', function(req,res,next){

    task.findById(req.params.id, function(err, task){
        if(err) {
            res.status(500).json({sucess: false});
        }
        res.status(200).json(task);
    });
});

router.put('/:id',function(req,res,next){
    var query = {_id : req.params.id};
    var update = {status: req.body.status};
    var options = {multi: true};
    task.update(query, update, options, function(err, numAffected){
        if(err){
            res.status(500).json(err);
        }else{
            console.log('numAffected ' + numAffected);
            tagFriendChangeTaskStatus(req.params.id);
            res.status(200).json({sucess : true});
        }
    });

    //    task.findById(req.params.id, function (err, taskFound){
    //        if(err){
    //            res.status(500).json(err);
    //        }
    //        else{
    //            taskFound.status = req.body.status;
    //            taskFound.save(function(err1){
    //                if(err1){
    //                    res.status(500).json(err1);
    //                }else{
    //                    res.status(200).json({sucess : true});
    //                    tagFriendChangeTaskStatus(taskFound.createdBy, taskFound.name);
    //                }
    //            });
    //        }
    //    });
});


function tagFriendChangeTaskStatus(taskId){

    var createdById;
    var taskName;
    var taskStatus;
    task.findById(taskId, function(err, taskFound){
        if(err){
            console.log(err);
        }
        createdById = taskFound.createdBy;
        taskName = taskFound.name;
        taskStatus = taskFound.status;

        user.findById(createdById, function(err, userFound){
            if(err){
                console.log(err);
            }
            var message ="A tarefa" +" \""+taskName+"\" mudou o status para \""+taskStatus+"\""; 
            console.log(message);    

            FB.setAccessToken(userFound.accessToken);
            FB.api('me/ifpb-tasks:notify', 'post', {
                task : {
                    "og:title" : "A tarefa" +" \""+taskName+"\" mudou de status",
                    "og:description" : "O novo status é "+ "\""+taskStatus+"\"",
                    "og:image": "http://i58.tinypic.com/15gqmaf.png",
                    "og:url" : "http://localhost:3000/myTasks/facebook"
                },
                message: message,
                tags : userFound.facebook_id,
            },
                   function(response) {
                if(!response || response.error) {
                    console.log(!response ? 'error occurred' : response.error);
                    return;
                }

                console.log(response.id);

                if(response.id){
                    console.log('foi');
                }else{
                    console.log('não foi');
                }
            });
        });

    });
}



module.exports = router;