var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
//var user = require('../models/user.js');
var task = require('../models/task.js');

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
    console.log('test');
    task.findByIdAndRemove(req.params.id, function(err, tasks){
        if(err) return next(err);
        res.status(200).json(tasks);
    });
});

<<<<<<< HEAD
router.get('/task/:id', function(req,res,next){
=======
router.get('/:id', function(req,res,next){
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
    task.findById(req.params.id, function(err, task){
        if(err) return next(err);
        res.status(200).json(task);
    });
});

module.exports = router;