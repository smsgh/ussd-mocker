var express = require('express')
  , util = require('util')
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , route = require('./route')
  ;

var app = express();

app.set('port', 8773);
app.set('domain', '127.0.0.1');
app.set('view engine', 'jade');
app.set('views', 'app/views');

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

route(app);

app.use(express.static('public'));

app.listen(app.get('port'), app.get('domain'), function () {
  console.log(util.format('\nPoint your browser to http://%s:%d to start using SMSGH USSD Mocker.\n'
    + 'NOTE: Closing this window will stop the web application\'s server.'
    , app.get('domain'), app.get('port')));
});