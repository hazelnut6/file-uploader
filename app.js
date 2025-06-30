require('dotenv').config();
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