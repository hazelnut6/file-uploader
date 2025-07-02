require('dotenv').config();
const session = require('express-session');
const passport = require('passport');
const { PrismaClient } = require('@prisma/client');
const PrismaSessionStore = require('@quixo3/prisma-session-store')(session, {
    checkPeriod: 2 * 60 * 1000,
    dbRecordIdIsSessionId: true,
    sessionModelName: 'Session',
    prisma: new PrismaClient(),
});
require('./config/passport')(passport);
const express = require('express');
const path = require('node:path');

const app = express();

//View engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(
    session({
        secret: process.env.SECRET_KEY,
        resave: false,
        saveUninitialized: false,
        store: PrismaSessionStore,
        cookie: {
            maxAge: 1000 * 60 * 24
        }
    })
);
app.use(passport.initialize);
app.use(passport.session());

// Routes
app.get('/', (req, res) => {
    res.render('index', { title: 'File Uploader' });
});

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Running on port ${PORT}`) });

// Basic error
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});