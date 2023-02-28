const express = require('express');
const router= express.Router();
const UserController = require('../controllers/user.controller');

router.get('/user', UserController.pruebaUser);
router.post('/register', UserController.register);


module.exports = router;
