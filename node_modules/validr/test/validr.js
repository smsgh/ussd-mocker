var _ = require('lodash'),
  Validr = require('..');

var user = require('./fixtures/user');

describe('validr', function () {
  describe('#validate()', function (){

    it('should setup private properties', function() {
      var body = _.cloneDeep(user);
      var validr = new Validr(body);

      validr.validate('name.first', 'First Name is required.');
      validr._param.should.equal('name.first');
      validr._value.should.equal('Samora');
      validr._msg.should.equal('First Name is required.');

      validr.validate(['name', 'last'], 'Last Name is required.');
      validr._param.should.equal('name.last');
      validr._value.should.equal('Dake');
      validr._msg.should.equal('Last Name is required.');

      validr.validate('email', 'Email is required.');
      validr._param.should.equal('email');
      validr._value.should.equal('samora@example.com');
    });

    it('should return validator methods.', function () {
      var body = _.cloneDeep(user);
      body.email = 'invalid.com';
      body.age = '';

      var validr = new Validr(body);

      validr.validate('email', {
        isEmail: 'Email must be valid.'
      }).isEmail();

      validr._errors[0].param.should.equal('email');
      validr._errors[0].value.should.equal('invalid.com');
      validr._errors[0].msg.should.equal('Email must be valid.');

      validr.validate('age', 'Age is required.').isLength(1);

      validr._errors[1].param.should.equal('age');
      validr._errors[1].value.should.equal('');
      validr._errors[1].msg.should.equal('Age is required.');
    });

    it('should validate if object property isnt found and isLength validator is set',
      function () {
        var body = _.cloneDeep(user)

        var validr = new Validr(body)

        validr.validate('sex', 'Sex must be M or F.')
          .isIn(['M', 'F'])
          .isLength(1)

        var errors = validr.validationErrors(true)
        errors.should.be.ok
        errors.sex.should.have.property('msg', 'Sex must be M or F.')
      })

    it('should have chainable validators', function() {
      var body = _.cloneDeep(user);
      body.email = '';

      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }).isLength(1).isEmail();

      validr._errors.length.should.equal(2);
    });
  });

  describe('#validationErrors()', function() {

    it('should return null', function (){
      var body = _.cloneDeep(user);
      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }).isLength(1).isEmail();

      var errors = validr.validationErrors();
      (!errors).should.be.ok;
    });

    it('should return errors array', function (){
      var body = _.cloneDeep(user);
      body.email = '';
      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }).isLength(1).isEmail();

      var errors = validr.validationErrors();
      errors.length.should.equal(2);
      errors[0].should.have.properties({
        param: 'email',
        value: '',
        msg: 'Email is required.'
      });
      errors[1].should.have.properties({
        param: 'email',
        value: '',
        msg: 'Email must be valid.'
      });
    });

    it('should return errors object', function (){
      var body = _.cloneDeep(user);
      body.email = '';
      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }).isLength(1).isEmail();

      var errors = validr.validationErrors(true);
      errors.email.should.have.properties({
        param: 'email',
        value: '',
        msg: 'Email must be valid.'
      });
    });

    it('should return errors if ignoreEmpty but not empty', function (){
      var body = _.cloneDeep(user);
      body.email = 'invalid.com';
      var validr = new Validr(body);


      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }, {
        ignoreEmpty: true
      }).isLength(1).isEmail();

      var errors = validr.validationErrors(true);
      errors.email.should.have.properties({
        param: 'email',
        value: 'invalid.com',
        msg: 'Email must be valid.'
      });

    });

    it('should return null if ignoreEmpty', function (){
      var body = _.cloneDeep(user);
      body.email = '';
      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }, {
        ignoreEmpty: true
      }).isLength(1).isEmail();

      var errors = validr.validationErrors(true);
      (!errors).should.be.ok;
    });

    it('should return null if ignoreEmpty', function (){
      var body = _.cloneDeep(user);
      delete body.email;
      var validr = new Validr(body);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.'
      }, {
        ignoreEmpty: true
      }).isLength(1).isEmail();

      var errors = validr.validationErrors(true);
      (!errors).should.be.ok;
    });
  });

  describe('#extendValidator ', function() {

    var extendValidator = {
      isNotExampleEmail: function(str) {
        return !/@example.com/.test(str);
      }
    };

    it('should find errors', function (){
      var body = _.cloneDeep(user);
      var validr = new Validr(body, extendValidator);

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.',
        isNotExampleEmail: 'Email must NOT be @example.com.'
      }).isLength(1).isEmail().isNotExampleEmail();

      var errors = validr.validationErrors(true);
      errors.email.should.have.properties({
        param: 'email',
        value: 'samora@example.com',
        msg: 'Email must NOT be @example.com.'
      });
    });

    it('should return null', function (){
      var body = _.cloneDeep(user);
      var validr = new Validr(body, extendValidator);

      body.email = 'foo@bar.com';

      validr.validate('email', {
        isLength: 'Email is required.',
        isEmail: 'Email must be valid.',
        isNotExampleEmail: 'Email must NOT be @example.com.'
      }).isLength(1).isEmail().isNotExampleEmail();

      var errors = validr.validationErrors(true);
      (!errors).should.be.ok;
    });

  });
});
