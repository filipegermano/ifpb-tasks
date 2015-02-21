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
app.use(session({secret: 'sessionCookie', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

<<<<<<< HEAD
passport.use('facebook', new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
},                                         
function(accessToken, refreshToken, profile, done) {

=======
passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret
},
                                  function(accessToken, refreshToken, profile, done) {
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
    FB.setAccessToken(accessToken);
    process.nextTick(function() {
        
        sendPostRequestToCreateUser(profile._json.id, profile._json.name, accessToken);

        return done(null, profile);
    });
}   
));

passport.use('facebookRef', new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret
},                                         
function(accessToken, refreshToken, profile, done) {

    FB.setAccessToken(accessToken);
    process.nextTick(function() {
        return done(null, profile);
    });
}   
));

<<<<<<< HEAD

=======
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
function sendPostRequestToCreateUser(id, name, accessToken){
    var user = {
        facebook_id : id,
        name : name,
        accessToken : accessToken
    };

    var userString = JSON.stringify(user);

    var headers = {
        'Content-Type': 'application/json',
        'Content-Length': userString.length
    };

    var options = {
        host: 'localhost',
        port: 3000,
        path: '/users/',
        method : 'POST',
        headers: headers
    };
<<<<<<< HEAD

=======
    
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
    var jsonResponse;
    var req = http.request(options, function(response) {

        response.on('data', function (chunk) {
            jsonResponse = chunk;
        });

        response.on('end', function (str) {
            console.log('Response from create user ' + jsonResponse);
        });
    });

    req.write(userString);
    req.end();
<<<<<<< HEAD

=======
    
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
    return jsonResponse;
    //    app.post('/users', function(req, res, next){
    //        console.log(res.toString());
    //    });

}

//rotas 
//app.get('/auth/facebook', 
//        passport.authenticate(
//    'facebook', {scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']}
//));

app.get('/auth/facebook', function(req,res,next){
<<<<<<< HEAD
    passport.authenticate('facebook',{scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']})
    (req,res,next);
});

app.get('/auth/facebookRef/:id', function(req,res,next){
    passport.authenticate('facebookRef',{callbackURL: config.callback_url + "/task/" + req.params.id,
                                         scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']})
    (req,res,next);
});

//app.get('/auth/facebookRef/:id', function(req,res,next){
//    passport.authenticate(
//        'facebook',
//        {callbackURL : config.callback_url})(req, res, next);
//});

app.get('/auth/facebook/callback', passport.authenticate(
    'facebook', {successRedirect : '/dashboard', faulureRedirect: '/'}),
        function(req,res){
    res.redirect('/');
});

app.get('/auth/facebook/callback/task/:id', function(req,res,next) {
    passport.authenticate(
        'facebookRef',{
            callbackURL: config.callback_url + "/task/" + req.params.id,
            successRedirect:'/users/task/facebookRef/'+req.params.id,
            failureRedirect:'/'
        }
    ) (req,res,next);
});
=======
    passport.authenticate(
        'facebook', 
        {callbackURL: config.callback_url }, 
        {scope: ['email', 'user_friends', 'publish_actions']})(req, res, next);
});

app.get('/auth/facebookRef/:id', function(req,res,next){
    passport.authenticate(
        'facebook', 
        {callbackURL: config.callback_url + '/task/' + req.params.id }, 
        {scope: ['email', 'user_friends', 'publish_actions']})(req, res, next);
});

app.get('/auth/facebook/callback',
        passport.authenticate(
    'facebook',{
        callbackURL : config.callback_url,
        successRedirect: '/dashboard',
        failureRedirect: '/'}),
        function(req, res) {
            res.redirect('/');
});

app.get('/auth/facebook/callback/task/:id', function(req,res,next) {
    console.log('callback test '+req.user);
  passport.authenticate(
    'facebook',{
     callbackURL: config.callback_url + '/task/' + req.params.id,
     successRedirect:'/task/'+req.params.id,
     failureRedirect:'/'
    }
   ) (req,res,next);
});


>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c


//app.get('/checkPermissions', function(req, res){
//    FB.api('me/permissions',function (response) {
//        if (!response || !response.error) {
//        .    console.log(response);
//        
//        }
//        res.status(200).json(response);
//    });
//});

app.get('/dashboard', ensureAuthenticated,function(req,res){
    res.sendFile('public/dashboard.html', {root: __dirname });
});

app.get('/myTasks', ensureAuthenticated,function(req,res){
    res.sendFile('public/myTasks.html', {root: __dirname });
<<<<<<< HEAD
=======
});

app.get('/task/:id', ensureAuthenticatedForTask, function(req,res,next){
    res.sendFile('public/task.html', {root: __dirname });
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
});

app.get('/task/:id', ensureAuthenticatedForTask, function(req,res,next){
    res.redirect('/auth/facebookRef/'+req.params.id);
});


app.get('/friendList', function(req, res){
    FB.api('me/taggable_friends', {fields:'name,picture.width(60).height(60)'}, function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response.data);
    })
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

app.get('/userInfo', ensureAuthenticated,function(req, res){
    user.findOne({facebook_id : req.user.id}, function(err, user){
        if(err){
            res.status(500).json(err);
        }else{
            res.status(200).json(user);
        }
    });
});

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

function ensureAuthenticatedForTask(req, res, next) {
    if (req.isAuthenticated()) { 
        return next();
    }else{
        console.log('ensureAuthenticatedForTask '+req.params.id);
        res.redirect('/auth/facebookRef/'+req.params.id);
    }
}


function ensureAuthenticated(req, res, next) {
<<<<<<< HEAD
    console.log('Authenticated ' + req.isAuthenticated());
=======
>>>>>>> 0f9a586ce3e1fe14f3b4c8229c3c690a3d40bc8c
    if (req.isAuthenticated()) { 
        return next();
    }
    res.redirect('/auth/facebook');
}

module.exports = app;