var randomstring = require('randomstring')
  , Validr = require('validr')
  ;

module.exports = {
  index: index,
  initiate: initiate,
  session: session
};


function index (req, res, next) {
  res.clearCookie('session');
  res.render('index');
}

function initiate (req, res, next) {
  var body = req.body;
  var errors = validateInitiate(body);
  if (errors) return res.redirect('/');
  var session = {
    Id: randomstring.generate(32),
    Type: 'Initiation',
    Sequence: 1,
    ClientUrl: body.Url,
    ServiceCode: body.ServiceCode || 714,
    Mobile: body.Mobile || '233244567890',
    Operator: body.Operator || body.Operator.toLowerCase() || 'mtn'
  };
  res.cookie('session', session);
  res.redirect('/session');
}

function session (req, res, next) {
  var session = req.cookies.session;
  if (!session) return res.redirect('/');
  switch (req.method) {
    case 'POST':
      session.Sequence += 1;
      
      break;
  }

  var ussdRequest = generateUssdRequest(session, req.body);

  res.render('session', {
    session: session
  });
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

/**
 * Generate SMSGH USSD request
 * @param  {object} session Cookie session
 * @param  {object} body    session action request body
 * @return {object} 
 */
function generateUssdRequest (session, body) {
  var msg;
  switch (session.Type) {
    case 'Initiation':
      session.Sequence = 1;
      msg = '*'+session.ServiceCode+'#';
      break;
    default:
      session.Sequence += 1;
  }
  return {
    Mobile: session.Mobile,
    SessionId: session.Id,
    ServiceCode: session.ServiceCode,
    Type: session.Type,
    Message: '',
    Operator: session.Operator,
    Sequence: session.Sequence
  };
}