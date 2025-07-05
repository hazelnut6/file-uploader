const { Router } = require('express');
const { body } = require('express-validator');
const authRoutes = Router();
const authController = require('../controllers/authController');

authRoutes.get('/sign-up', authController.getSignUp);
authRoutes.post('/sign-up', 
    [
        // sanitization & validation
        body('username')
            .trim()
            .isLength({ min: 1 }).withMessage('Username is required')
            .escape(),
        body('password')
            .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
        body('confirmPassword').custom((value, {req}) => {
            if(value !== req.body.password) {
                throw new Error('Password confirmation does not match password.');
            }

            return true;
        })
    ], 
    authController.postSignUp
);
authRoutes.get('/log-in', authController.getLogIn);
authRoutes.post('/log-in', authController.postLogIn);
authRoutes.post('/log-out', authController.postLogOut);
authRoutes.get('/check-auth', authController.isAuthenticated, (req, res) => {
    res.status(200).json({ isAuthenticated: true, user: req.user });
});

module.exports = authRoutes;