require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const { PrismaSessionStore } = require('@quixo3/prisma-session-store');
const { PrismaClient } = require('@prisma/client');
require('./config/passport')(passport);
const express = require('express');
const path = require('node:path');
const indexRoutes = require('./routes/indexRoutes');
const authRoutes = require('./routes/authRoutes');

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
    cookie: {
     maxAge: 7 * 24 * 60 * 60 * 1000 // ms
    },
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: new PrismaSessionStore(
      new PrismaClient(),
      {
        checkPeriod: 2 * 60 * 1000,  //ms
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      }
    )
  })
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  res.locals.info = req.flash('info');
  next();
});

// Routes
app.use('/', indexRoutes);
app.use('/auth', authRoutes);

// Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`Running on port ${PORT}`) });

// Basic error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});