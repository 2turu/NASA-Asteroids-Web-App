var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const https = require('https');
const _ = require('underscore');

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

//App Routes
app.get('/',
    function(req, res, next) {
        res.render('index', { title: 'NASA Asteroids' });
    });
app.post('/',
    function(req, res, next) { //formatting for the client html form or any incoming requests due to html form not having object setup for input
        if(typeof req.body.within !== 'undefined') {
            next();
        } else { //format client html
            req.body = {
                dateStart: req.body.dateStart,
                dateEnd: req.body.dateEnd,
                within: {
                    units: 'miles',
                    value: req.body.value
                },
            };
            next();
        }
    },
    function(req, res, next) { //check if within.value is a valid number, the rest of the values will be taken care of by NASA api response.
        if(isNaN(req.body.within.value)){
            next({error: true});
        }
        next();
    },
    function(req, res, next) { //Node HTTPS Setup
        const apiKey = 'WUueIxEX3qFXB3TaZDzZ8wqwbC9ggoX0l9GhavhC';
        var options = {
            hostname: 'api.nasa.gov',
            path: `/neo/rest/v1/feed?api_key=${apiKey}&start_date=${req.body.dateStart}&end_date=${req.body.dateEnd}`,
            method: 'GET',
        };
        var request = https.get(options, function(response) {
            var data = '';

            response.on('data', function (chunk) { //data appended in chunks
                data += chunk;
            });
            response.on('end', function() { 
                res.locals.response = JSON.parse(data);
                next();
            });
        }).on('error', function() {
            next({error: true});
        });
        request.end();
    },
    function(req, res, next) { //filter for distance
        const {response} = res.locals;
        const unit = req.body.within.units;
        const distance = parseFloat(req.body.within.value);
        var asteroidList = [];

        if(response.http_error) {
            next({error: true});
        }
        _.mapObject(response.near_earth_objects, function(val, key) { //iterate through the object's keys (dates) which will return an array
            _.each(val, function(asteroid) { //iterate through the array list of asteroids which will return individual asteroid data
                _.find(asteroid.close_approach_data, function(approachData) { //each asteroid's close_approach_data is an array.
                    if(parseFloat(approachData.miss_distance[unit]) <= distance) { //now filter through each approach data by distance provided
                        return asteroidList.push(asteroid.name);
                    }
                });
            });
        });
        res.locals.asteroidList = asteroidList;
        next();
    },
    function(req, res, next) { //response
        const {asteroidList} = res.locals;
        res.json({asteroids: asteroidList})
    },
    function(err, req, res, next) { //if any error happened, it goes straight to this middleware function
        res.json(err);
    });

module.exports = app;
