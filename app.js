var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const nasaApi = require('./controllers/api');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var server = app.listen(process.env.PORT || 3000, function () {
    var port = server.address().port;
    console.log('App is now running on port', port);
});

function _outputSuccess(req, res, next) { //response
    const {asteroidList} = res.locals;
    res.json({asteroids: asteroidList})
}
function _outputError(err, req, res, next) { //if any error happened, it goes straight to this middleware function
    res.json(err);
}

//App Routes
app.get('/',
    function(req, res, next) {
        res.render('index', { title: 'NASA Asteroids' });
    });
app.post('/',
    nasaApi.validateDistance,
    nasaApi.httpsRequest,
    nasaApi.filterByDistance,
    _outputSuccess,
    _outputError
    );
app.post('/format',
    nasaApi.clientFormat,
    nasaApi.validateDistance,
    nasaApi.httpsRequest,
    nasaApi.filterByDistance,
    _outputSuccess,
    _outputError
    );
module.exports = app;
