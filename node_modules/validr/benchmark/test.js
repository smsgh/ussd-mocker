var Validr = require('..');

var startTime = new Date();

var body = {
  name: 'validr',
  email: 'validr@example.com'
};

for(var i=0; i<10000; ++i) {

  var validr = new Validr(body);
  validr.validate('name', 'name is required').isLength(1);
  validr.validate('email', {isLength: 'email is required', isEmail: 'invaild email'}).isLength(1).isEmail();

}

var endTime = new Date();

console.log("Cost time: " + (endTime - startTime));
