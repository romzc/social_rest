const express = require('express');
const router= express.Router();
const FollowController = require('../controllers/follow.controller');

router.get('/follow', FollowController.pruebaFollow);


module.exports = router;
