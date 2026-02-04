
const express = require('express');

const authController = require('../controllers/authController');

const {loginValidator,resetPasswordValidator}=require('../validators/authValidators')

const router = express.Router();



router.post('/register', authController.register);
router.post('/login', loginValidator,authController.login);
router.post('/logout',authController.logout);
router.post('/is-user-logged-in',authController.isUserLoggedIn);
router.post('/google-auth',authController.googleSso);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", resetPasswordValidator,authController.changePassword);


module.exports = router;  

