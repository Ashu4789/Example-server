const express = require('express');
const authController = require('../controllers/authController');
const { loginValidator } = require('../validators/authValidators');
const router = express.Router();


router.post('/register', authController.register);
router.post('/login', loginValidator, authController.login);
router.get('/is-user-logged-in', authController.isUserLoggedIn);
router.post('/logout', authController.logout);
router.post('/google-auth', authController.googleSso);

module.exports = router;