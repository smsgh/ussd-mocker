var router = require('express').Router()
  , controllers = require('./app/controllers')
  , test = require('./app/controllers/test')
  ;

module.exports = function (app) {
  router.get('/', controllers.index);
  router.get('/session', controllers.session);
  router.post('/session/initiate', controllers.initiate);
  router.post('/session/response', controllers.response);
  router.get('/session/release', controllers.release);
  router.get('/session/timeout', controllers.timeout);

  router.post('/test', test);

  app.use('/', router);
};