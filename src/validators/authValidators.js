
const {body}=require('express-validator');
const loginValidator=[
    body('email').notEmpty().withMessage("Email is required")
                .isEmail().withMessage("Provide email is not valid"),
    body('password').notEmpty().withMessage("Password is required")
                .isLength({min:3}).withMessage("Password must be atleast 3 character "),

];


const resetPasswordValidator = [
    body('email')
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Provide email is not valid"),
        

    body('otp')
        .notEmpty().withMessage("OTP is required")
        .isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digit")
        .isNumeric().withMessage("OTP must be numeric"),

    body('password')
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 3 }).withMessage("Password must be atleast 3 character"),
];




module.exports={loginValidator,resetPasswordValidator};
