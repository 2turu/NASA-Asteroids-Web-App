const router = require('express').Router();
const nasaApi = require('../controllers/api');

//App Routes
router.get('/',
    function(req, res, next) {
        res.render('index', { title: 'NASA Asteroids' });
    });
    router.post('/',
    nasaApi.validateDistance,
    nasaApi.httpsRequest,
    nasaApi.filterByDistance,
    nasaApi.outputSuccess,
    nasaApi.outputError
    );
router.post('/format',
    nasaApi.clientFormat,
    nasaApi.validateDistance,
    nasaApi.httpsRequest,
    nasaApi.filterByDistance,
    nasaApi.outputSuccess,
    nasaApi.outputError
    );

module.exports = router;