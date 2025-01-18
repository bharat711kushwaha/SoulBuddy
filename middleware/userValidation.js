const { check, validationResult } = require('express-validator');

/**
 * @description Middleware to validate user input during creation or update
 */
exports.validateUserInput = [
  check('name').notEmpty().withMessage('Name is required'),
  check('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Invalid date format'),
  check('timeOfBirth')
    .optional()
    .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .withMessage('Invalid time format (HH:MM)'),
  check('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other'])
    .withMessage('Gender must be Male, Female, or Other'),
  check('city').optional().isString().withMessage('City must be a string'),
  check('state').optional().isString().withMessage('State must be a string'),
  check('country').optional().isString().withMessage('Country must be a string'),

  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  },
];
