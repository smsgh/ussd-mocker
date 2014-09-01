/**
 * Module Dependencies.
 */
var _ = require('lodash'),
  util = require('util'),
  validator = require('validator');

/**
 * Generates a validator class that wraps methods of param theValidator.
 *
 * @param {object} the validator
 * @param {object} super validator class to be inherited
 */
function generateValidatorClass(theValidator, superClass) {
  var Class = function() {
    this._errors = [];
  };

  if (superClass) {
    util.inherits(Class, superClass);
  }

  // Setup validators.
  Object.keys(theValidator).forEach(function (method) {

    // Verify valid validator method.
    var notValdator = (method.slice(0, 2) !== 'is'
      && method !== 'equals'
      && method !== 'contains'
      && method !== 'matches');

    if (notValdator) return;

    // Setup validators.
    Class.prototype[method] = function () {
      var args, bool, msg;

      args = Array.prototype.slice.call(arguments);
      args.unshift(this._value);

      bool = theValidator[method].apply(theValidator[method], args);

      // Exit if valid.
      if (bool) return this;

      if (typeof this._msg === 'string')
        msg = this._msg;
      else
        msg = this._msg[method];

      this._errors.push({
        param: this._param,
        msg: msg,
        value: this._value
      });

      return this;
    };
  });

  return Class;
};

// This class is generated once for reuse.
BaseValidator = generateValidatorClass(validator);

/**
 * Constructor.
 * 
 * @param {object} body
 * @param {object} extend validator
 */
function Validr(body, extendValidator){
  var that = this;
  
  // Verify body is object.
  if (!body || typeof body !== 'object')
    throw new Error('Invalid argument. Pass an object.');
  
  // Setup properties.
  that.body = body;
  that._errors = [];
  that._validator = {};
  that._param = undefined;
  that._value = undefined;
  that._msg = undefined;
  that._doNotValidate = undefined;

  if (extendValidator) {
    var newClass = generateValidatorClass(extendValidator, BaseValidator);
    that._validator = new newClass;
  } else {
    that._validator = new BaseValidator();
  }

  this.__defineGetter__('_errors', function() {
    return this._validator._errors;
  });

}

/** 
 * Validr object properties.
 */
Validr.prototype.body;
Validr.prototype._errors;
Validr.prototype._param;
Validr.prototype._value;
Validr.prototype._msg;
Validr.prototype._doNotValidate;
Validr.prototype._validator;
Validr.prototype._sanitizers;


/**
 * Setup this._param, this._value and this._msg 
 * with param and msg. Returns this._validator.
 * 
 * @param {string|array} param
 * @param {string|object} msg
 * @return {object} this._validator
 */
Validr.prototype.validate = function (param, msg){
  var value,
    that = this;

  if (!Array.isArray(param) && typeof param !== 'string') {
    throw new Error('Invalid parameter. '
      + 'Parameter must be string or array.')
  }

  if (typeof param === 'string')
    param = param.split('.');

  var value = _.cloneDeep(this.body);
  param.forEach(function (item) {
    if (Object.prototype.toString.call(value) !== '[object Object]') return
    
    value = value[item];
  });

  that._param = that._validator._param = param.join('.');
  that._value = that._validator._value = value;
  that._msg = that._validator._msg = msg;

  return that._validator;
};

/**
 * Should return an array/object of errors or null.
 * 
 * @param {boolean} mapped
 * @return {array|object|null}
 */
Validr.prototype.validationErrors = function (mapped) {
  if (this._errors.length === 0) return null;

  if (!mapped) return this._errors;

  var errors = {};
  this._errors.forEach(function (error) {
    errors[error.param] = error;
  });
  
  return errors;
};


// Exports
module.exports = Validr;
