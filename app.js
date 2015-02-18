var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var users = require('./routes/users');
var session = require('express-session');
var http = require('http');

//--mongo
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/ifpb-tasks', function(err){
    if(err){
        console.log('connection error', err);
    }else{
        console.log('connection successful');
    }
});

//fb
var FB = require('fb');
//Passport
var passport = require('passport');
var config = require('./configurations/config.js');
var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');
var tasks = require('./routes/tasks');

var app = express();

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(obj, done) {
    done(null, obj);
});

passport.use(new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret: config.facebook_api_secret,
    callbackURL: config.callback_url
},
                                  function(accessToken, refreshToken, profile, done) {
    FB.setAccessToken(accessToken);

    process.nextTick(function() {

        sendPostRequestToCreateUser(profile._json.id, profile._json.name);
        return done(null, profile);
    });
}   
                                 ));


function sendPostRequestToCreateUser(id, name){
    var user = {
        facebook_id : id,
        name : name
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


    var req = http.request(options, function(response) {
        var str = '';
        response.on('data', function (chunk) {
            console.log(chunk);
            str += chunk;
        });

        response.on('end', function () {
            console.log(str);
        });
    });

    req.write(userString);
    req.end();

}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/tasks', tasks);
app.use(session({secret: 'sessionCookie', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

//rotas 
app.get('/auth/facebook', 
        passport.authenticate(
    'facebook', {scope: ['email', 'user_friends', 'publish_actions', 'manage_friendlists']}
));

app.get('/auth/facebook/callback',
        passport.authenticate(
    'facebook',
    {successRedirect:  '/loggedin',
     failureRedirect: '/'}),
        function(req, res) {
    res.redirect('/');
});

//app.get('/checkPermissions', function(req, res){
//    FB.api('me/permissions',function (response) {
//        if (!response || !response.error) {
//            console.log(response);
//        
//        }
//        res.status(200).json(response);
//    });
//});

app.get('/loggedin',function(req,res){
    res.sendFile('public/dashboard.html', {root: __dirname })
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

app.get('/userInfo', function(req, res){
    res.status(200).json(req.user);
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


module.exports = app;
