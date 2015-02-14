var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//fb
var FB = require('fb');
//Passport
var passport = require('passport');
var config = require('./configurations/config.js');
var FacebookStrategy = require('passport-facebook').Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.serializeUser(function(obj, done) {
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
        //vericar se o token já existe no banco e retornar o profile
        //ou criar um novo

        //como não usa BD não faz nada

        return done(null, profile);
    });
}
                                 ));

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

app.use(passport.initialize());
app.use(passport.session());

//rotas 
app.get('/auth/facebook', passport.authenticate(
    'facebook',
    {scope: ['user_friends, publish_actions, status_update, read_stream, manage_friendlists']}));

app.get('/auth/facebook/callback',
        passport.authenticate(
    'facebook',
    {successRedirect:  '/postme',
     failureRedirect: '/'}),
        function(req, res) {
    res.redirect('/');
});

app.get('/postme', function(req, res){    
    var responseTaggable;

    FB.api('me/taggable_friends', function(response){
        if (!res || res.error) {
            res.render('index', {title: 'Fail', friends: []});
            return;
        }
        responseTaggable = response.data;


//        console.log('res tag ' + responseTaggable);
        var id;
        for(var i=0; i<responseTaggable.length; i++){
            if(responseTaggable[i].name == 'Filipe Germano'){
                id = responseTaggable[i].id;
                break;
            }
        }

        var tags = id;
        console.log(tags);
        var body = 'Teste Projeto POS @['+id+']';
        console.log(body);
        FB.api('me/ifpb-tasks:newtask', 'post', { task: "http://samples.ogp.me/737590196361828", message: body, tags : tags }, function(response) {
            if(!response || response.error) {
                console.log(!response ? 'error occurred' : response.error);
                return;
            }
            console.log(response);
            console.log('Post Id: ' + response.id);
        });
        res.status(200).json('foi!');


    });
})

app.get('/friends', function(req, res){
    FB.api('me/taggable_friends', function(response){
        if(!res || res.error){
            res.render('index', {title : 'Fail', friends : []});
            return;
        }
        res.send(response);
    })
});

app.get('/index', function(req, res){
    fb.api('me', function(response){
        if (!res || res.error) {
            res.render('index', {title: 'Fail', friends: []});
            return;
        }
        res.send(response);
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


module.exports = app;
