var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var user = require('../models/user.js');
var task = require('../models/task.js');
var FB = require('fb');
var config = require('./../configurations/config.js');

//function isAuthenticated(req, res, next) {
//    console.log('User '+req.user);
//    console.log(req.isAuthenticated());
//    if (req.isAuthenticated())
//        return next();
//    res.redirect('/');
//};

router.get('/', function(req, res, next) {
    user.find(function(err,users){
        if(err) {
            return next(err);
        }
        res.json(users);
    });
});

router.post('/', function(req,res,next){
    var newUser = req.body;
    console.log('req body '+JSON.stringify(req.body));
    user.findOne({facebook_id : newUser.facebook_id}, function(err, userFound){
        if(err){
            console.error(err);
            res.status(500).json('Sorry, internal error');
        }else if(userFound === null){
            console.log('will save user');

            user.create(newUser, function(err, userCreated){
                if(err){
                    res.status(500).json('Sorry, the new user could not be saved');
                }
                else{
                    res.send(userCreated);
                }
            });

        }else{
            console.log('will not save user');
            user.findByIdAndUpdate(userFound._id, newUser, function(err, userUpdated){
                if(err) return next(err);
                res.send(userUpdated);
            });
        }
    });
});


router.post('/newTask/:id', function(req,res,next){
    user.findOne({facebook_id : req.params.id}, function(err, userFound){
        if(err){
            console.log(err);
            res.status(500).json('Sorry, internal error');
        }else{
            var newTask = req.body;
            newTask.status = 'em aberto';
            newTask.createdBy = userFound._id;
            task.create(newTask, function(err, createdTask){
                if(err){
                    console.log(err);
                    res.status(500).json('Sorry, internal error (task not saved)');
                }else{
                    res.status(201).json('New task created');
                    userFound.tasksCreated.push(createdTask._id);
                    console.log(userFound);
                    userFound.save(function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                   // tagFriends(newTask.name, newTask.description, createdTask._id, newTask.assignedTo);
                }
            });

        }
    });
    console.log(req.body);
});


function tagFriends(taskName, taskDescription,taskId , assignedTo){

    var mentions = '';
    var tags = [];
    for(var key in assignedTo){
        var obj = assignedTo[key];
        mentions += '@['+obj.friendId+'] ';
        tags.push(obj.friendId);
    }

    var tagsSeparatedByComma = tags.join();

    var msg = '['+taskName+'] - ' + taskDescription + ' ' + mentions;


    FB.api('me/ifpb-tasks:create', 'post', {
        task : {
            "og:title" : taskName,
            "og:description" : taskDescription,
            "og:image": "http://i58.tinypic.com/15gqmaf.png",
            "og:url" : "http://localhost:3000/task/"+taskId
        },
        message: msg, 
        tags: tags},
        function(response) {
            if(!response || response.error) {
                console.log(!response ? 'error occurred' : response.error);
                return;
            }

        console.log('Post Id: ' + response.id);

        if(response.id){
            console.log('foi');
        }else{
            console.log('não foi');
        }
    });
}

//router.get('/:id/tasks', function(req,res){
//    var id = req.params.id;
//    console.log(id);
//    task.find({createdBy : req.params.id}, function(err, tasks){
//        if(err) {
//            res.status(500).json(err);
//        }else{
//            res.status(200).json(tasks);
//        }
//    });
//});


router.get('/:id/tasks', function(req,res){
    var id = req.params.id;
    console.log(id);
    task.find({createdBy : req.params.id}).sort({deadline: 'desc'}).exec(
    function(err, tasks){
        if(err) {
            res.status(500).json(err);
        }else{
            res.status(200).json(tasks);
        }
    });
});

router.put('/:id', function(req,res,next){
    user.findByIdAndUpdate(req.params.id, req.body, function(err, users){
        if(err) return next(err);
        res.json(users);
    });
});

router.delete('/:id', function(req,res,next){
    console.log('test');
    user.findByIdAndRemove(req.params.id, function(err, users){
        if(err) return next(err);
        res.status(200).json(users);
    });
});

module.exports = router;
