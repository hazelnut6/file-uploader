const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const passport = require('passport');
const { validationResult } = require('express-validator');


// sign up
exports.getSignUp = (req, res) => {
    res.render('sign-up', { title: 'Sign Up', errors: [], username: '' });
};
exports.postSignUp = async (req, res, next) => {
    // Validation errors
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        res.render('sign-up', {
            title: 'Sign Up',
            errors: errors.array(),
            username: req.body.username
        });
    }

    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
            },
        });

        // Automatic log in
        req.login(newUser, (err) => {
            if(err) return next(err);
            // res.status(201).json({ message: 'Account created and logged in successfully.', user: newUser }); (good for React)
            res.redirect('/');
        });
    } catch(err) {
        console.error(err);
        if(err.code === 'P2002' && err.detail.includes('username')) {
            // return res.status(409).json({ message: 'Error registering user.' }); (good for React)
            return res.render('sign-up', {
                title: 'Sign Up',
                errors: [{ msg: 'Username already exists.' }],
                username: req.body.username
            });
        }
        // res.status(500).json({ message: 'An unexpected error occurred during registration.' }); (good for React)
        res.status(500).send('Error signing up!');
    }
};

// log in
exports.getLogIn = (req, res) => {
    res.render('index', { title: 'File Uploader' });
};
exports.postLogIn = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if(err) {
        console.error('Passport authentication error:', err);
        return next(err); 
      }

      if(!user) {
        // return res.status(401).json({ message: info.message || 'Authentication failed' });
        return res.redirect('/');
      }

      req.login(user, (err) => {
        if(err) {
            console.error('Log in error:', err);
            return next(err);
        }
        req.flash('success', 'Logged in successfully!');
        res.redirect('/');
      });
    })(req, res, next);
};

// log out
exports.postLogOut = (req, res, next) => {
    req.logout(err => {
        if(err) {
            console.error('Error during log out:', err);
            return next(err);
        }
        req.session.destroy(err => {
            if(err) {
                console.error('Error destroying session:', err);
                // return res.status(500).json({  message: 'Could not log out, please try again.'}); (good for React)
            }
            // res.status(200).json({ message: 'Logged out successfully.' }); (good for React)
        });
        res.redirect('/');
    });
};

// Authentication middleware
exports.isAuthenticated = (req, res, next) => {
    if(req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: 'Please log in first.' });
};