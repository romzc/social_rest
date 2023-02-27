const express = require('express');
const router= express.Router();
const UserController = require('../controllers/user.controller');

router.get('/user', UserController.pruebaUser);


module.exports = router;
