const { body } = require('express-validator');

const loginValidator = [
    body('email').isEmail().withMessage('Invalid email format')
    .notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')

];
module.exports = { 
    loginValidator 
};