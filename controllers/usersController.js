const usersStorage = require('../storages/usersStorage');
const { body, validationResult } = require('express-validator');
const alphaErr = 'must only contain letters.';
const lengthErr = 'must be between 1 and 10 characters.';
const lengthBioErr = 'must be between 1 and 200 characters.';
const dateErr = 'must be between 18 and 120 years.';
const emailErr = 'must be valid e-mail adress.';

exports.usersListGet = (req, res) => {
  res.render('index', {
    title: 'User list',
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render('createUser', {
    title: 'Create user',
  });
};

const validateUser = [
  body('firstName')
    .trim()
    .isAlpha()
    .withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`First name ${lengthErr}`),
  body('lastName')
    .trim()
    .isAlpha()
    .withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 })
    .withMessage(`Last name ${lengthErr}`),
  body('email').trim().isEmail().withMessage(`E-mail ${emailErr}`),
  body('age')
    .trim()
    .isInt({ gt: 18, lt: 120 })
    .withMessage(`Age ${dateErr}`)
    .optional({ values: 'falsy' }),
  body('bio')
    .trim()
    .optional({ values: 'falsy' })
    .isAlpha()
    .withMessage(`Bio ${alphaErr}`)
    .isLength({ min: 1, max: 200 })
    .withMessage(`Bio ${lengthBioErr}`),
];

// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
  validateUser,
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('createUser', {
        title: 'Create user',
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.addUser({ firstName, lastName, email, age, bio });
    res.redirect('/');
  },
];

// Update existing names
exports.usersUpdateGet = (req, res) => {
  const user = usersStorage.getUser(req.params.id);
  res.render('updateUser', {
    title: 'Update user',
    user: user,
  });
};

exports.usersUpdatePost = [
  validateUser,
  (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('updateUser', {
        title: 'Update user',
        user: user,
        errors: errors.array(),
      });
    }
    const { firstName, lastName, email, age, bio } = req.body;
    usersStorage.updateUser(req.params.id, {
      firstName,
      lastName,
      email,
      age,
      bio,
    });
    res.redirect('/');
  },
];

// Tell the server to delete a matching user, if any. Otherwise, respond with an error.
exports.usersDeletePost = (req, res) => {
  usersStorage.deleteUser(req.params.id);
  res.redirect('/');
};
