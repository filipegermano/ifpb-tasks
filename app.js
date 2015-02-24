var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var session = require('express-session');
var http = require('http');
var user = require('./models/user.js');
//fb
var FB = require('fb');
//Passport
var passport = require('passport');
var config = require('./configurations/config.js');
var FacebookStrategy = require('passport-facebook').Strategy;

//var routes = require('./public/index');
var users = require('./routes/users');
var tasks = require('./routes/tasks');

var app = express();

//--mongo
var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/ifpb-tasks', function(err){
    if(err){
        console.log('connection error', err);
    }else{
        console.log('connection successful');
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//app.use('/', routes);

app.use('/users', users);

app.use('/tasks', tasks);

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true}));

app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use('facebook', new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
},                                         
                                              function(accessToken, refreshToken, profile, done) {
    FB.setAccessToken(accessToken);
    process.nextTick(function() {

        //sendPostRequestToCreateUser(profile._json.id, profile._json.name);
        createOrUpdateUser(profile._json.id, profile._json.name, accessToken);
        return done(null, profile);
    });
}));

passport.use('facebookRef', new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
},                                         
                                                 function(accessToken, refreshToken, profile, done) {
    FB.setAccessToken(accessToken);
    process.nextTick(function() {
        createOrUpdateUser(profile._json.id, profile._json.name, accessToken);
        console.log('2 ' + profile._json.name);

        return done(null, profile);
    });
}));

//function sendPostRequestToCreateUser(id, name){
//    var user = {
//        facebook_id : id,
//        name : name,
//    };
//
//    var userString = JSON.stringify(user);
//
//    var headers = {
//        'Content-Type': 'application/json',
//        'Content-Length': userString.length
//    };
//
//    var options = {
//        host: 'localhost',
//        port: 3000,
//        path: '/users/',
//        method : 'POST',
//        headers: headers
//    };
//
//    var jsonResponse;
//    var req = http.request(options, function(response) {
//
//        response.on('data', function (chunk) {
//            jsonResponse = chunk;
//        });
//
//        response.on('end', function (str) {
//            console.log('Response from create user ' + jsonResponse);
//        });
//    });
//
//    req.write(userString);
//    req.end();
//
//    return jsonResponse;
//    //    app.post('/users', function(req, res, next){
//    //        console.log(res.toString());
//    //    });
//
//}

//rotas 
//app.get('/auth/facebook', 
//        passport.authenticate(
//    'facebook', {scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']}
//));

app.get('/auth/facebook', function(req,res,next){
    passport.authenticate('facebook',{scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']})
    (req,res,next);
});

app.get('/auth/facebookRef/:id', function(req,res,next){
    passport.authenticate('facebookRef',{callbackURL: config.callback_url + "/task/" + req.params.id,
                                         scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']})
    (req,res,next);
});

app.get('/auth/facebook/callback',
        passport.authenticate(
    'facebook',{
        successRedirect: '/dashboard',
        failureRedirect: '/'})
       );

app.get('/auth/facebook/callback/task/:id', function(req,res,next) {
    passport.authenticate(
        'facebookRef',{
            callbackURL: config.callback_url + '/task/' + req.params.id,
            successRedirect:'/assignTask/'+req.params.id,
            failureRedirect:'/'
        }
    ) (req,res,next);
});

app.get('/assignTask/:id',function(req,res){
    assignTask(req.user.id,req.params.id);
    res.redirect('/receivedTasks');
});

app.get('/dashboard', ensureAuthenticated,function(req,res){
    res.sendFile('public/dashboard.html', {root: __dirname });
});

app.get('/myTasks/:facebook', ensureAuthenticated, function(req,res){
    res.redirect('/myTasks');
});

app.get('/myTasks', ensureAuthenticated,function(req,res){
    res.sendFile('public/myTasks.html', {root: __dirname });
});

app.get('/receivedTasks', ensureAuthenticated,function(req,res){
    res.sendFile('public/receivedTasks.html', {root: __dirname });
});

app.get('/task/:id', function(req,res,next){
    console.log(1);
    if(req.isAuthenticated()){
        console.log('1 ' + req.isAuthenticated());
        res.redirect('/assignTask/'+req.params.id);
    }else{
        console.log('1 ' + req.isAuthenticated());
        res.redirect('/auth/facebookRef/'+req.params.id);   
    }
});

app.get('/friendList', function(req, res){
    FB.api('me/taggable_friends', {fields:'name,picture.width(60).height(60)'}, function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response.data);
    });
});

app.get('/friends', function(req, res){
    FB.api('me/taggable_friends', function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response.data);
    })
});


app.get('/me', function(req, res){
    FB.api('/me', function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response);
    })
});

app.get('/userInfo', ensureAuthenticated, function(req, res){
    user.findOne({facebook_id : req.user.id}, function(err, user){
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json(user);
        }
    });
});

function assignTask(facebook_id, taskId){
    user.findOne({facebook_id : facebook_id}, function(err, userFound){
        if(userFound.tasksAssigned.indexOf(taskId) == -1){
            userFound.tasksAssigned.push(taskId);
            userFound.save(function(err){
                if(err){
                    console.log(err);
                }else{
                    console.log('success');
                }
            });
        }
        return true;
    });
}

//function createOrUpdateUserWithTask(facebook_id,name,accessToken,taskId){
//
//    user.findOne({facebook_id : facebook_id}, function(err, userFound){
//        if(err) console.log(err);
//        if(userFound===null){
//            //create user
//            var newUser = {
//                facebook_id : facebook_id,
//                name : name,
//                accessToken : accessToken,
//                tasksAssigned : []
//            }
//            newUser.tasksAssigned.push(taskId);
//            user.create(newUser, function(err, userCreated){
//                if(err){
//                    console.log(err);
//                }
//                else{
//                    console.log('user created here');
//                    //                    res.sendFile('public/receivedTasks.html', {root: __dirname });
//                    return true;
//                }
//            });
//        }else{
//            if(userFound.tasksAssigned.indexOf(taskId) == -1){
//                userFound.tasksAssigned.push(taskId);
//                userFound.save(function(err){
//                    if(err){
//                        console.log(err);
//                    }else{
//                        console.log('success');
//                    }
//                });
//            }
//            return true;
//            //            res.sendFile('receivedTasks.html', {root: path.resolve(__dirname + '/../' + 'public')});
//        }
//
//    }); 
//
//}

function createOrUpdateUser(facebook_id,name,accessToken){
    //Achar uma melhor forma de fazer isso

    var newUser = {
        facebook_id : facebook_id,
        name : name,
        accessToken : accessToken
    };
    user.findOne({facebook_id : newUser.facebook_id}, function(err, userFound){
        if(err){
            console.error(err);
        }else if(userFound === null){
            console.log('will create user');

            user.create(newUser, function(err, userCreated){
                if(err){
                    console.error(err);
                }
                else{
                    console.log({sucess: true});
                }
            });

        }else{
            console.log('will not create new user');
            user.findByIdAndUpdate(userFound._id, newUser, function(err, userUpdated){
                if(err) return next(err);
                console.log({sucess: true});
            });
        }
    });
}

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        user.findOne({facebook_id : req.user.id}, function(err, userFound){
            if(err) console.log(err);
            FB.setAccessToken(userFound.accessToken);        
            return next();
        });
    }else{
        res.redirect('/auth/facebook');
    }
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;