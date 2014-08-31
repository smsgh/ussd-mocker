module.exports = test;

var newline = '\r\n';


function test (req, res, next) {
  var response = {
    Type: 'Response',
    Message: 'Welcome to the Test Service, User.' + newline
      + 'Watch the request\'s Message and Sequence parameters.' + newline
      + '1. Men' + newline
      + '2. Women' + newline
      + '3. Children'
  };
  var release = {
    Type: 'Release',
    Message: 'Thank you for testing me.'
  };
  var body = req.body;
  switch (body.Type) {
    case 'Initiation':
    case 'Response':
      return res.json(response);
    case 'Timeout':
    case 'Release':
      return res.json(release);
    default:
      return res.status(400).json({});
  }
}