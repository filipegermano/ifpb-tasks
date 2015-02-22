var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var user = require('../models/user.js');
var task = require('../models/task.js');
var FB = require('fb');
var config = require('./../configurations/config.js');
var path = require('path');

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
                    res.status(201).json('new user');
                }
            });

        }else{
            console.log('will not save user');
            user.findByIdAndUpdate(userFound._id, newUser, function(err, userUpdated){
                if(err) return next(err);
                res.status(200).json('old user');
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
                    userFound.save(function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                    tagFriends(newTask.name, newTask.description, createdTask._id, newTask.assignedTo, newTask.status);
                }
            });

        }
    });

});


function tagFriends(taskName, taskDescription,taskId , assignedTo, status){

    var mentions = '';
    var tags = [];
    for(var key in assignedTo){
        var obj = assignedTo[key];
        mentions += '@['+obj.friendId+'] ';
        tags.push(obj.friendId);
    }

    var tagsSeparatedByComma = tags.join();

    var msg = 'Nova Tarefa ['+taskName+'] - ' + ' Status: ' + status + ' ' + mentions;


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

router.get('/task/facebookRef/:taskId', function(req,res,next){
    console.log('Id on tasks '+ req.params.taskId);
    FB.api('/me', function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }else{
            user.findOne({facebook_id : response.id},function(err,userFound){
                if(err){
                    console.log(err);
                    res.status(500).json('Sorry, internal error');
                }else if(userFound === null){
                    var newUser = {
                        facebook_id : response.id,
                        name : response.name,
                        tasksAssigned : []
                    }
                    newUser.tasksAssigned.push(req.params.taskId);
                    user.create(newUser, function(err, userCreated){
                        if(err){
                            console.log(err);
                            res.status(500).json('Sorry, the new user could not be saved');
                        }
                        else{
                            console.log('user created');
                            console.log('success 1');
                            res.sendFile('receivedTasks.html', {root: path.resolve(__dirname + '/../' + 'public')});
                        }
                    });
                }else{
                    console.log(req.params.taskId);
                    if(userFound.tasksAssigned.indexOf(req.params.taskId) == -1){
                        userFound.tasksAssigned.push(req.params.taskId);
                        userFound.save(function(err){
                            if(err){
                                console.log(err);
                            }else{
                                console.log('success 2');
                            }
                        });
                    }
                    console.log(path.resolve(__dirname + '/../' + 'public'));
                    res.sendFile('receivedTasks.html', {root: path.resolve(__dirname + '/../' + 'public')});
                }
            });    
        }

    });
});


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


router.get('/:id/tasksAssigned', function(req,res){
    var id = req.params.id;
    user.findById(id, function(err, userFoud){
        if(err){
            res.status(500).json(err);
        }else{
            var tasksAssigned = userFoud.tasksAssigned;
            task.find({
                '_id': { $in : tasksAssigned}
            }, function(err, tasks){
                console.log(tasks);
                res.status(200).json(tasks);
            });
        }
    });
});


router.get('/:id/taskAssigned/:taskId', function(req,res){
    var userId = req.params.id;
    var taskId = req.params.taskId;
    
    user.findById(userId, function(err, userFoud){
        if(err){
            res.status(500).json(err);
        }else{
            var tasksAssigned = userFoud.tasksAssigned;
            if(tasksAssigned.indexOf(taskId) > -1){
                task.findById(taskId, function(err, task){
                    if(err){
                        res.status(500).json(err);
                    }else{
                        res.status(200).json(task);        
                    }
                });
            }
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
