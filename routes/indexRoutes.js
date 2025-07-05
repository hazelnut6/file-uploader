const { Router } = require('express');
const indexRoutes = Router();
const authController = require('../controllers/authController');
const indexController = require('../controllers/indexController');
const multer = require('multer');
const path = require('node:path');

// storage
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/uploads/'); // where file uploads will be stored
    },
    filename: function(req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); // filename
    }
});

// initialize upload middleware
const upload = multer({ storage: storage });

indexRoutes.get('/', indexController.getHome);
indexRoutes.post('/upload', authController.isAuthenticated, upload.single('myFile'), indexController.postUpload);

module.exports = indexRoutes;