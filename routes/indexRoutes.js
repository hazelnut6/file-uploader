const { Router } = require('express');
const indexRoutes = Router();
const authController = require('../controllers/authController');

indexRoutes.get('/', authController.getHome);

module.exports = indexRoutes;