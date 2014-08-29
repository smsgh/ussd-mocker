var router = require('express').Router()
  , controllers = require('./app/controllers')
  , test = require('./app/controllers/test')
  ;

module.exports = function (app) {
  router.get('/', controllers.index);
  router.post('/', controllers.initiate);
  router.get('/session', controllers.session);

  router.post('/test', test);

  app.use('/', router);
};