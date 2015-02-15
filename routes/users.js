var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var user = require('../models/user.js');
var task = require('../models/task.js');

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
    user.findOne({facebook_id : newUser.facebook_id}, function(err, userFoud){
        if(err){
            console.error(err);
            res.status(500).json('Sorry, internal error');
        }else if(userFoud === null){
            console.log('will save user');

            user.create(newUser, function(err){
                if(err){
                    res.status(500).json('Sorry, the new user could not be saved');
                }
                else{
                    res.status(201).json('Saved new user->'+newUser.name);
                }
            });

        }else{
            console.log('will not save user');
            user.findByIdAndUpdate(userFoud._id, newUser, function(err, users){
                if(err) return next(err);
            });

            res.status(204).json('User updated');
        }
    });

});


router.post('newTask', function(){
    
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
