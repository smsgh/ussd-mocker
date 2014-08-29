var router = require('express').Router()
  , controllers = require('./app/controllers')
  ;

module.exports = function (app) {
  router.get('/', controllers.index);

  app.use('/', router);
};