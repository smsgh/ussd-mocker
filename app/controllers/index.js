var randomstring = require('randomstring')
  , Validr = require('validr')
  , Promise = require('bluebird')
  , request = require('superagent')
  ;

module.exports = {
  index: index,
  session: session,
  initiate: initiate,
  response: response,
  release: release,
  timeout: timeout
};


function index (req, res, next) {
  res.clearCookie('session');
  res.render('index', {
    ClientUrl: req.cookies.ClientUrl || 'http://127.0.0.1:8773/test',
    ServiceCode: req.cookies.ServiceCode || '',
    Mobile: req.cookies.Mobile || '',
    Operator: req.cookies.Operator || '',
    InitiationMessage: req.cookies.InitiationMessage || '',
  });
}

function session (req, res, next) {
  var session = req.cookies.session;
  if (!session) 
    return res.redirect('/');
  session.response.Message = session.response.Message
    .substr(0, 182)
    .replace(/\r\n/g, '<br>')
    .replace(/\n/g, '<br>')
    ;
  res.render('session', {
    session: session
  });
}

function initiate (req, res, next) {
  var body = req.body;
  var errors = validateInitiate(body);
  if (errors) return res.redirect('/');
  var serviceCode = body.ServiceCode || '*714*100#';
  var session = {};
  session.ClientUrl = body.Url;
  session.request = {
    SessionId: randomstring.generate(32),
    Mobile: body.Mobile || '233244567890',
    ServiceCode: serviceCode,
    Type: 'Initiation',
    Message: body.InitiationMessage || serviceCode,
    Operator: body.Operator || body.Operator.toLowerCase() || 'mtn',
    Sequence: 1      
  };
  messageClient(session)
  .then(function (session) {
    res.cookie('session', session);
    res.cookie('ClientUrl', session.ClientUrl);
    res.cookie('ServiceCode', session.request.ServiceCode);
    res.cookie('Mobile', session.request.Mobile);
    res.cookie('Operator', session.request.Operator);
    res.cookie('InitiationMessage', session.request.Message);
    res.redirect('/session');
  }).catch(next);
}

function response (req, res, next) {
  var session = req.cookies.session;
  if (!session) return res.redirect('/');
  session.request.Type = 'Response';
  session.request.Message = req.body.UserInput || '';
  session.request.ClientState = session.response.ClientState || '';
  session.request.Sequence += 1;
  messageClient(session)
  .then(function (session) {
    res.cookie('session', session);
    res.redirect('/session');
  }).catch(next);
}

function release (req, res, next) {
  var session = req.cookies.session;
  if (!session) return res.redirect('/');
  session.request.Type = 'Release';
  session.request.Message = '';
  session.request.ClientState = session.response.ClientState || '';
  session.request.Sequence += 1;
  messageClient(session)
  .then(function (session) {
    res.cookie('session', session);
    res.redirect('/session');
  }).catch(next);
}

function timeout (req, res, next) {
  var session = req.cookies.session;
  if (!session) return res.redirect('/');
  session.request.Type = 'Timeout';
  session.request.Message = '';
  session.request.ClientState = session.response.ClientState || '';
  session.request.Sequence += 1;
  messageClient(session)
  .then(function (session) {
    res.cookie('session', session);
    res.redirect('/session');
  }).catch(next);
}


/*
  Helper functions
  ----------------
 */

/**
 * Validate initiate action
 * @param  {object} body
 * @return {bool}    
 */
function validateInitiate (body) {
  var validr = new Validr(body);
  validr.validate('Url', 'Url must be valid number.')
    .isLength(1).isURL();
  return validr.validationErrors(true);
}

function validateResponse (body) {
  var validr = new Validr(body);
  validr.validate('UserInput', 'User input must be valid number')
    .isLength(1).isNumeric();
  return validr.validationErrors(true);
}

function validateUssdResponse (body) {
  var validr = new Validr(body);
  validr.validate('Type', 'Type is required.')
    .isLength(1);
  validr.validate('Message', 'Message is required.')
    .isLength(1);
  return validr.validationErrors(true);
}

/**
 * Generate SMSGH USSD request
 * @param  {object} session Cookie session
 * @param  {object} body    session action request body
 * @return {object} 
 */
function generateResponseRequest (session, body) {
  return {
    Mobile: session.Mobile,
    SessionId: session.Id,
    ServiceCode: session.ServiceCode,
    Type: session.Type,
    Message: body.UserInput || '',
    Operator: session.Operator,
    Sequence: session.Sequence
  };
}

function messageClient (session) {
  return new Promise(function (resolve, reject) {
    request.post(session.ClientUrl)
    .set('Content-Type', 'application/json')
    .set('Accept', 'application/json')
    .send(session.request)
    .end(function (err, res) {
      if (err) return reject(err);
      if (!res.ok) 
        return reject(new Error("Didn't get a successful response from client at "
          + session.ClientUrl));
      session.response = res.body;
      resolve(session);
    })
  });
}