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
                    res.status(201).json(userCreated);
                }
            });

        }else{
            console.log('will not save user');
            user.findByIdAndUpdate(userFound._id, newUser, function(err, userUpdated){
                if(err) return next(err);
                res.status(200).json(userUpdated);
            });
        }
    });
});


router.post('/newTask/:id', function(req,res,next){
    user.findOne({facebook_id : req.params.id}, function(err, userFound){
        if(err || userFound == null){
            console.log(err);
            res.status(500).json({sucess: false});
        }else{
            var newTask = req.body;
            newTask.status = 'em aberto';
            newTask.createdBy = userFound._id;
            task.create(newTask, function(err, createdTask){
                if(err){
                    console.log(err);
                    res.status(500).json({sucess: false});
                }else{
                    userFound.tasksCreated.push(createdTask._id);
                    userFound.save(function(err){
                        if(err){
                            console.log(err);
                        }
                    });
                    tagFriends(newTask.name, newTask.description, createdTask._id, newTask.assignedTo, userFound.accessToken);
                    res.status(201).json(createdTask);
                }
            });

        }
    });

});


function tagFriends(taskName, taskDescription, taskId , assignedTo, accessToken){

    var mentions = '';
    var tags = [];
    for(var key in assignedTo){
        var obj = assignedTo[key];
        mentions += '@['+obj.friendId+'] ';
        tags.push(obj.friendId);
    }

    var tagsSeparatedByComma = tags.join();

    var msg = 'Você tem uma nova tarefa ['+taskName+'] ' + mentions;
    console.log(accessToken);
    FB.setAccessToken(accessToken);
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

//router.get('/task/facebookRef/:taskId', function(req,res,next){
//    FB.setAccessToken(getAccessTokenFromUser(req.params.taskId));
//    FB.api('/me', function(response){
//        if(!res || res.error){
//            res.render('index', {title : 'Fail', friends : []});
//            return;
//        }else{
//            
//            console.log(response);
//            
//            user.findOne({facebook_id : response.id},function(err, userFound){
//                if(err){
//                    console.log(err);
//                    res.status(500).json('Sorry, internal error');
//                }else if(userFound === null){
//                    var newUser = {
//                        facebook_id : response.id,
//                        name : response.name,
//                        tasksAssigned : []
//                    }
//                    newUser.tasksAssigned.push(req.params.taskId);
//                    user.create(newUser, function(err, userCreated){
//                        if(err){
//                            console.log(err);
//                            res.status(500).json('Sorry, the new user could not be saved');
//                        }
//                        else{
//                            console.log('user created here');
//                            res.sendFile('receivedTasks.html', {root: path.resolve(__dirname + '/../' + 'public')});
//                        }
//                    });
//                }else{
//                    console.log(req.params.taskId);
//                    if(userFound.tasksAssigned.indexOf(req.params.taskId) == -1){
//                        userFound.tasksAssigned.push(req.params.taskId);
//                        userFound.save(function(err){
//                            if(err){
//                                console.log(err);
//                            }else{
//                                console.log('success');
//                            }
//                        });
//                    }
//                    console.log(path.resolve(__dirname + '/../' + 'public'));
//                    res.sendFile('receivedTasks.html', {root: path.resolve(__dirname + '/../' + 'public')});
//                }
//            });    
//        }
//
//    });
//});
//
//
//function getAccessTokenFromUser(taskId){
//    task.findById(taskId, function(err, taskFound){
//        if(err) console.log(err);
//        user.findById(taskFound.createdBy, function(err, userFound){
//            if(err) console.log(err);
//            return userFound.accessToken;          
//        });
//    });
//}


router.get('/:id/tasks', function(req,res){
    user.findOne({facebook_id: req.params.id},function(err, userFound){
        if(err || userFound == null){
            res.status(500).json({sucess: false});
        }
        else{
            task.find({createdBy : userFound._id}).sort({deadline: 'desc'}).exec(
                function(err, tasks){
                    if(err) {
                        res.status(500).json({sucess: false});
                    }else{
                        res.status(200).json(tasks);
                    }
                });
        }
    });

});

router.get('/friendList/:id', function(req,res){
    user.findOne({facebook_id: req.params.id}, function(err, userFound){
        if(err || userFound == null){
            res.status(500).json({sucess: false});
        }else{
            FB.setAccessToken(userFound.accessToken);
            FB.api('me/taggable_friends', {fields:'name,picture.width(60).height(60)'}, function(response){
                if(!res || res.error){
                    res.render('index', {title : 'Fail', friends : []});
                    return;
                }
                res.send(response.data);
            });
        }
    }); 
});


router.get('/:id/tasksAssigned', function(req,res){
    user.findOne({facebook_id: req.params.id}, function(err, userFound){
        if(err){
            res.status(500).json({sucess: false});
        }else{
            var tasksAssigned = userFound.tasksAssigned;
            task.find({
                '_id': { $in : tasksAssigned}
            }, function(err, tasks){
                res.status(200).json(tasks);
            });
        }
    });
});

router.delete('/:id', function(req,res,next){
    user.findByIdAndRemove(req.params.id, function(err, users){
        if(err){ 
            res.status(500).json({sucess: false});
        }else{
            res.status(200).json(users);
        }
    });
});

//router.get('/:id/taskAssigned/:taskId', function(req,res){
//    var userId = req.params.id;
//    var taskId = req.params.taskId;
//
//    user.findById(userId, function(err, userFoud){
//        if(err){
//            res.status(500).json({sucess: false});
//        }else{
//            var tasksAssigned = userFoud.tasksAssigned;
//            if(tasksAssigned.indexOf(taskId) > -1){
//                task.findById(taskId, function(err, task){
//                    if(err){
//                        res.status(500).json({sucess: false});
//                    }else{
//                        res.status(200).json(task);        
//                    }
//                });
//            }
//        }
//    });
//});


//router.put('/:id', function(req,res,next){
//    user.findByIdAndUpdate(req.params.id, req.body, function(err, users){
//        if(err) return next(err);
//        res.json(users);
//    });
//});

module.exports = router;
