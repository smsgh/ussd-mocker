# Validr

[![Build Status](https://travis-ci.org/samora/validr.svg)](https://travis-ci.org/samora/validr)

Framework agnostic [Node.js](http://nodejs.org) validations.
Inspired by [validator](https://github.com/chriso/validator.js), [express-validator](https://github.com/ctavan/express-validator) and [validictorian](https://github.com/samora/validictorian).

## Installation

```
npm install validr
```

## Usage

If you have ever used [express-validator](https://github.com/ctavan/express-validator) you should feel right at home.

Here is an example using [Express](expressjs.com). Can be used similarly in any other framework.

```javascript
var express = require('express'),
  Validr = require('validr'),
  trimBody = require('trim-body');

app = express();

app.use(express.bodyParser());
app.use(app.router);

app.post('/user', function (req, res){
  trimBody(req.body);

  // Expected 'req.body' object format
  // {
  //   name: {
  //     first: <first name>,
  //     last: <last name>
  //   },
  //   email: <email>,
  //   age: <age>,
  //   sex: <sex>,
  //   occupation: <occupation>
  // }


  // 1. Create an instance of Validr.

  var validr = new Validr(req.body);


  // 2. Validations

  validr
    // use string with dot-notation to validate nested fields
    .validate('name.first', 'First Name is required.')
    .isLength(1);

  validr
    // you can also use an array to validate nested fields
    .validate(['name', 'last'], 'Last Name is required.')
    .isLength(1);

  validr
    // an object can be used to set separate validation messages for validators.
    .validate('email', {
      isLength: 'Email is required.',
      isEmail: 'Email must be valid.'
    })
    // validators are chainable
    .isLength(1).isEmail(); 

  validr
    // validate method accepts a 3rd parameter which is an options object
    // age will not be validated if '', `null` or undefined
    .validate('age', 'Age must be a number.', {ignoreEmpty: true})
    .isNumeric();

  validr
    .validate('sex', 'Sex must be M (male) or F (female).')
    .isIn(['M', 'F']).isLength(1);


  // 3. Check for errors.

  var errors = validr.validationErrors();

  if (errors) return res.json(errors);



  // ...
  // Process req.body however you want. Example: save to db.
});


app.listen(3000);
```

### Validate

Validating fields is similar to [express-validator](https://github.com/ctavan/express-validator)'s `assert`.

Differences between `validate` and `assert`.
* No `notEmpty` and `len` methods. Use `isLength`.
* Nested fields are targeted with a dot-notation string or array. Example: `'name.first'` or `['name', 'first']`.

You can pass a 3rd parameter to `validate` to ignore validation if field is not supplied. See usage's _age_ validation


### Validation errors

You can get errors in two ways. Similar to [express-validator](https://github.com/ctavan/express-validator#validation-errors).

```javascript
var errors = validr.validationErrors();
var mappedErrors = validr.validationErrors(true);
```

errors:
```json
[
  {param: "email", msg: "Email is required.", value: "<received input>"},
  {param: "email", msg: "Email must be valid.", value: "<received input>"},
  {param: "age", msg: "Age must be a number.", value: "<received input>"}
]
```

mappedErrors:
```json
{
  email: {
    param: "email",
    msg: "Email must be valid.",
    value: "<received input>"
  },
  age: {
    param: "age",
    msg: "Age is required.",
    value: "<received input>"
  }
}
```

### Extending with custom validators

Add custom validator functions to an object, which is the second parameter when instantiating Validr.
```javascript
var validr = new Validr(body, {
  isNotExampleEmail: function(str) {
    return !/@example.com/.test(str);
  }
});

validr.validate('email', {
  isLength: 'Email is required.',
  isEmail: 'Email must be valid',
  isNotExampleEmail: 'Email must NOT be @example.com.'
  }).isLength(1).isEmail().isNotExampleEmail();
```

## Tests

```
npm install -g mocha
```

Then,
```
npm test
```

## Contributors

* Samora Dake - [@papasamo247](https://twitter.com/papasamo247)
* Morgan Cheng - [@morgancheng](https://twitter.com/morgancheng)

## License
MIT
